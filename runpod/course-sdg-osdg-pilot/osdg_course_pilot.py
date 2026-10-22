"""Train a small, CPU-only OSDG community-data pilot and rank SDGs for courses.

This is an experimental candidate generator, not an official OSDG model and not
human validation. It streams the source CSV and writes a separate JSONL report;
it never modifies the project's production SDG labels.
"""
import argparse
import csv
import json
import random
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.linear_model import SGDClassifier


def open_osdg(path):
    stream = path.open("r", encoding="utf-8-sig", newline="")
    sample = stream.read(8192)
    stream.seek(0)
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",\t;")
    except csv.Error:
        dialect = csv.excel
    return stream, csv.DictReader(stream, dialect=dialect)


def field_value(row, *names):
    normalised = {str(k).strip().lower(): v for k, v in row.items() if k is not None}
    for name in names:
        value = normalised.get(name.lower())
        if value is not None:
            return str(value).strip()
    return ""


def training_rows(path, min_votes, min_agreement):
    stream, rows = open_osdg(path)
    try:
        for row in rows:
            text = field_value(row, "text")
            if not text:
                continue
            try:
                goal = int(field_value(row, "sdg", "goal"))
                positive = int(float(field_value(row, "labels_positive", "positive")))
                negative = int(float(field_value(row, "labels_negative", "negative")))
            except (TypeError, ValueError):
                continue
            votes = positive + negative
            if not 1 <= goal <= 17 or votes < min_votes or votes == 0 or positive == negative:
                continue
            agreement = abs(positive - negative) / votes
            if agreement < min_agreement:
                continue
            target = 1 if positive > negative else 0
            yield goal, text, target
    finally:
        stream.close()


def shuffled_training_rows(path, min_votes, min_agreement, seed, buffer_size=2048):
    """Shuffle a bounded buffer so a file grouped by SDG cannot dominate late updates."""
    rng = random.Random(seed)
    buffer = []
    for row in training_rows(path, min_votes, min_agreement):
        if len(buffer) < buffer_size:
            buffer.append(row)
            continue
        index = rng.randrange(len(buffer))
        yield buffer[index]
        buffer[index] = row
    rng.shuffle(buffer)
    yield from buffer


def train(data_path, vectorizer, epochs, batch_size, min_votes, min_agreement):
    models = {goal: SGDClassifier(loss="log_loss", alpha=1e-5, random_state=42 + goal)
              for goal in range(1, 18)}
    trained = {goal: False for goal in range(1, 18)}
    examples = 0
    for epoch in range(epochs):
        batch_texts = {goal: [] for goal in range(1, 18)}
        batch_y = {goal: [] for goal in range(1, 18)}

        def learn_batch(goal):
            nonlocal examples
            if not batch_texts[goal]:
                return
            X = vectorizer.transform(batch_texts[goal])
            y = np.asarray(batch_y[goal], dtype=np.int8)
            positives = int(y.sum())
            negatives = len(y) - positives
            weights = np.ones(len(y), dtype=np.float32)
            if positives and negatives:
                weights[y == 1] = len(y) / (2.0 * positives)
                weights[y == 0] = len(y) / (2.0 * negatives)
            models[goal].partial_fit(
                X, y, classes=np.array([0, 1]) if not trained[goal] else None,
                sample_weight=weights,
            )
            trained[goal] = True
            examples += len(y)
            batch_texts[goal].clear()
            batch_y[goal].clear()

        for goal, text, target in shuffled_training_rows(
            data_path, min_votes, min_agreement, seed=42 + epoch
        ):
            batch_texts[goal].append(text)
            batch_y[goal].append(target)
            if len(batch_texts[goal]) >= batch_size:
                learn_batch(goal)
        for goal in range(1, 18):
            learn_batch(goal)
        if not any(trained.values()):
            raise RuntimeError("No usable labelled rows found. Check the CSV delimiter and column names.")
        print(f"Training pass {epoch + 1}/{epochs} complete")
    missing_goals = [goal for goal, was_trained in trained.items() if not was_trained]
    if missing_goals:
        print(f"Warning: no usable training rows for SDGs {missing_goals}; they will be omitted")
    return {goal: model for goal, model in models.items() if trained[goal]}, examples


def course_text(course):
    fields = []
    for key in ("course_title", "title", "category", "target_skill", "description"):
        value = course.get(key)
        if isinstance(value, str) and value.strip():
            fields.append(value.strip())
    return " ".join(fields)


def load_courses(path, limit):
    courses = []
    with path.open("r", encoding="utf-8") as stream:
        for line in stream:
            try:
                item = json.loads(line)
            except json.JSONDecodeError:
                continue
            if course_text(item):
                courses.append(item)
                if limit and len(courses) >= limit:
                    break
    return courses


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, required=True, help="OSDG Community Dataset CSV/TSV")
    parser.add_argument("--courses", type=Path, default=Path("models/course-recommender/courses.jsonl"))
    parser.add_argument("--output", type=Path, default=Path("model-artifacts/osdg-course-pilot.jsonl"))
    parser.add_argument("--limit", type=int, default=20, help="Courses to score; 0 means all")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=512)
    parser.add_argument("--min-votes", type=int, default=3)
    parser.add_argument("--min-agreement", type=float, default=0.5)
    parser.add_argument("--min-score", type=float, default=0.50,
                        help="Minimum candidate score to list, before human review")
    args = parser.parse_args()

    vectorizer = HashingVectorizer(n_features=2**18, alternate_sign=False,
                                   ngram_range=(1, 2), norm="l2", lowercase=True)
    models, examples = train(args.data, vectorizer, args.epochs, args.batch_size,
                             args.min_votes, args.min_agreement)
    courses = load_courses(args.courses, args.limit)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="\n") as out:
        for course in courses:
            text = course_text(course)
            candidates = []
            for goal in range(1, 18):
                model = models.get(goal)
                if model is None:
                    continue
                X = vectorizer.transform([text])
                positive_class = list(model.classes_).index(1)
                score = float(model.predict_proba(X)[0, positive_class])
                candidates.append({"goal": goal, "score": round(score, 4)})
            candidates.sort(key=lambda item: item["score"], reverse=True)
            candidates = [item for item in candidates[:3] if item["score"] >= args.min_score]
            record = {
                "course_id": course.get("id"),
                "url": course.get("url"),
                "title": course.get("course_title") or course.get("title"),
                "status": "candidate_review",
                "training_examples_seen": examples,
                "candidates": candidates,
                "notice": "Experimental OSDG-CD baseline. Per-goal scores are not calibrated across goals; review candidates against course evidence. Not production labels.",
            }
            out.write(json.dumps(record, ensure_ascii=False) + "\n")
            print(f"{record['title'] or record['course_id']}: {candidates}")
    print(f"Wrote {len(courses)} review-only course rows to {args.output}")


if __name__ == "__main__":
    main()
