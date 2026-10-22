"""Extract searchable indicator metadata from the UN SDG metadata DOCX archive."""
import argparse
import json
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree


DOC_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def docx_paragraphs(docx_bytes):
    import io

    with zipfile.ZipFile(io.BytesIO(docx_bytes)) as document:
        root = ElementTree.fromstring(document.read("word/document.xml"))
    paragraphs = []
    for paragraph in root.findall(".//w:p", DOC_NS):
        text = "".join(node.text or "" for node in paragraph.findall(".//w:t", DOC_NS)).strip()
        if text:
            paragraphs.append(text)
    return paragraphs


def extract_record(name, paragraphs):
    full_text = "\n".join(paragraphs)
    goal_match = re.search(r"(?m)^Goal\s+(\d{1,2})\s*[.:]\s*(.+)$", full_text)
    target_match = re.search(r"(?m)^Target\s+(\d{1,2}\.[0-9a-zA-Z]+)\s*:\s*(.+)$", full_text)
    indicator_match = re.search(r"(?m)^Indicator\s+(\d{1,2}\.[0-9a-zA-Z.]+)\s*:\s*(.+)$", full_text)
    return {
        "source_file": name,
        "goal": int(goal_match.group(1)) if goal_match else None,
        "goal_title": goal_match.group(2).strip() if goal_match else "",
        "target_code": target_match.group(1) if target_match else "",
        "target_description": target_match.group(2).strip() if target_match else "",
        "indicator_code": indicator_match.group(1) if indicator_match else "",
        "indicator_description": indicator_match.group(2).strip() if indicator_match else "",
        "metadata_text": full_text,
    }


def convert(archive_path, output_path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    missing_goal = 0
    with zipfile.ZipFile(archive_path) as archive, output_path.open("w", encoding="utf-8", newline="\n") as output:
        for name in archive.namelist():
            if not name.lower().endswith(".docx") or "/" in name:
                continue
            record = extract_record(name, docx_paragraphs(archive.read(name)))
            missing_goal += record["goal"] is None
            output.write(json.dumps(record, ensure_ascii=False) + "\n")
            count += 1
    return count, missing_goal


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path, help="UN SDG-indicator-metadata.zip")
    parser.add_argument("output", type=Path, help="Destination JSONL")
    args = parser.parse_args()
    count, missing_goal = convert(args.archive, args.output)
    print(f"Extracted {count} indicator metadata documents to {args.output}")
    print(f"Records missing a parsed goal heading: {missing_goal}")


if __name__ == "__main__":
    main()
