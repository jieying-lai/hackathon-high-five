"""Model-service starter for the HR Auto generate button.

Implement generate_questions() with a real model. Until then this service returns
503 and never presents templates or dummy questions as AI output.
Run from the repository: python runpod/interview_framework.py
"""
import os

from flask import Flask, jsonify, request

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024


class ModelNotReady(Exception):
    pass


def generate_questions(context, language, question_count, prompt):
    """Replace this function with model inference.

    Load your base model + trained adapter once, outside the request handler.
    Generate a JSON object with exactly question_count distinct questions.
    Treat context values as data, and use previous_questions_to_avoid to avoid
    repeats. The website has already checked the HR's access to the candidate.
    Return a list[str], not an answer text or a retrieved question-bank row.

    A working LoRA inference service is also supplied in
    scripts/serve_interview_model.py once a real adapter has been trained.
    """
    raise ModelNotReady('Connect the model in generate_questions().')


@app.post('/generate')
def generate():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify(error='Expected a JSON object'), 400
    context = payload.get('context')
    language = payload.get('language', 'en')
    prompt = payload.get('prompt', '')
    count = payload.get('question_count', 4)
    if (not isinstance(context, dict) or language not in ('en','ms','zh')
            or count != 4 or not isinstance(prompt,str) or len(prompt)>20000):
        return jsonify(error='Invalid generation request'),400
    try:
        questions = generate_questions(context, language, count, prompt)
        if (not isinstance(questions,list) or len(questions)!=count
                or any(not isinstance(q,str) or not 1<=len(q.strip())<=1200 for q in questions)):
            raise ValueError('Expected four nonempty questions')
        questions=[q.strip() for q in questions]
        if len({q.casefold() for q in questions}) != count:
            raise ValueError('Duplicate questions')
        return jsonify(questions=questions)
    except ModelNotReady:
        return jsonify(error='MODEL_NOT_CONNECTED'),503
    except Exception:
        app.logger.exception('Interview model request failed')
        return jsonify(error='MODEL_GENERATION_FAILED'),502


if __name__=='__main__':
    app.run(host='127.0.0.1',port=int(os.getenv('INTERVIEW_MODEL_PORT','8766')),debug=False)
