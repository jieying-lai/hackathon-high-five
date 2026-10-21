"""
Extract and compile ONET Career Changers, Career Starters, and Job Zones
from C:/Users/April/Downloads/dataset/ONET Occupation Data.zip into src/data/career_pathways.json
"""
import zipfile
import xml.etree.ElementTree as ET
import json
import os
import re

ZIP_PATH = r"C:\Users\April\Downloads\dataset\ONET Occupation Data.zip"
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "career_pathways.json")

def read_xlsx_rows(zip_ref, filename):
    with zip_ref.open(filename) as f:
        with zipfile.ZipFile(f, 'r') as inner_z:
            shared = []
            if 'xl/sharedStrings.xml' in inner_z.namelist():
                tree = ET.fromstring(inner_z.read('xl/sharedStrings.xml'))
                for si in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                    t = si.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                    shared.append(t.text if t is not None else '')
            sheet = ET.fromstring(inner_z.read('xl/worksheets/sheet1.xml'))
            rows = sheet.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData/{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
            all_rows = []
            for r in rows:
                row_vals = []
                for c in r.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    if v is not None and v.text is not None:
                        val = v.text
                        if c.attrib.get('t') == 's':
                            val = shared[int(val)]
                        row_vals.append(val)
                if row_vals:
                    all_rows.append(row_vals)
            return all_rows

def build():
    print(f"Reading {ZIP_PATH}...")
    with zipfile.ZipFile(ZIP_PATH, 'r') as z:
        raw_changers = read_xlsx_rows(z, 'Career Changers Matrix.xlsx')
        raw_starters = read_xlsx_rows(z, 'Career Starters Matrix.xlsx')
        raw_zones = read_xlsx_rows(z, 'Job Zones.xlsx')

    # Parse Job Zones: code -> int(zone)
    job_zones = {}
    for r in raw_zones[1:]:
        if len(r) >= 3:
            code = r[0].strip()
            try:
                job_zones[code] = int(r[2].strip())
            except:
                job_zones[code] = 3

    print(f"Parsed {len(job_zones)} job zones.")

    # Parse pathways
    # { "code": { "title": ..., "zone": ..., "lateral_paths": [...], "vertical_paths": [...] } }
    occupations = {}

    def ensure_occ(code, title):
        if code not in occupations:
            occupations[code] = {
                "code": code,
                "title": title,
                "zone": job_zones.get(code, 3),
                "lateral_transitions": [],
                "advancement_pathways": []
            }
        return occupations[code]

    # Process Career Changers (lateral transitions)
    for r in raw_changers[1:]:
        if len(r) >= 5:
            src_code, src_title, tgt_code, tgt_title, idx_val = r[0].strip(), r[1].strip(), r[2].strip(), r[3].strip(), r[4].strip()
            occ = ensure_occ(src_code, src_title)
            tgt_zone = job_zones.get(tgt_code, 3)
            try:
                rank = int(idx_val)
            except:
                rank = 1
            occ["lateral_transitions"].append({
                "code": tgt_code,
                "title": tgt_title,
                "target_zone": tgt_zone,
                "transferability_rank": rank,
                "zone_delta": tgt_zone - occ["zone"]
            })

    # Process Career Starters (advancement pathways)
    for r in raw_starters[1:]:
        if len(r) >= 5:
            src_code, src_title, tgt_code, tgt_title, idx_val = r[0].strip(), r[1].strip(), r[2].strip(), r[3].strip(), r[4].strip()
            occ = ensure_occ(src_code, src_title)
            tgt_zone = job_zones.get(tgt_code, 3)
            try:
                rank = int(idx_val)
            except:
                rank = 1
            occ["advancement_pathways"].append({
                "code": tgt_code,
                "title": tgt_title,
                "target_zone": tgt_zone,
                "advancement_rank": rank,
                "zone_delta": tgt_zone - occ["zone"]
            })

    # Normalize titles index for fuzzy lookups
    title_index = {}
    for code, data in occupations.items():
        clean_title = data["title"].lower()
        title_index[clean_title] = code

    output_data = {
        "metadata": {
            "source": "O*NET 29.0 Career Changers & Starters Matrices + Job Zones",
            "total_occupations": len(occupations),
            "version": "2026-hackathon-highfive"
        },
        "occupations": occupations,
        "title_index": title_index
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as out_f:
        json.dump(output_data, out_f, ensure_ascii=False, indent=2)

    print(f"Successfully generated {OUT_PATH} with {len(occupations)} occupations!")

if __name__ == "__main__":
    build()
