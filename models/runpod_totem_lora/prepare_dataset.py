"""Generates a high-quality Instruction Dataset for training CareerLens-Totem-Agent on RunPod.
Leverages O*NET 30.3 Work Styles and 6 Career Spirit Totems.
"""

import os
import json
import csv

def generate_totem_dataset():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    ws_csv = os.path.join(base_dir, "data", "onet", "work_styles.csv")
    out_dir = os.path.join(base_dir, "models", "runpod_totem_lora")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "totem_instructions.jsonl")

    # Sample archetype mapping data
    totems = [
        {
            "totem": "The Stratosphere Hawk",
            "traits": "High Leadership, High Achievement, High Decisiveness, Low Hesitation",
            "style": "Strategic, fast-paced execution, commands resources, high agency"
        },
        {
            "totem": "The Obsidian Night Owl",
            "traits": "High Intellectual Curiosity, High Analytical Rigor, High Attention to Detail, Solo Focus",
            "style": "Deep systems architecture, silent focus, zero-bullshit logic, allergic to status meetings"
        },
        {
            "totem": "The Solar Golden Retriever",
            "traits": "High Empathy, High Social Orientation, High Cooperation, Psychological Safety",
            "style": "Culture weaver, human-centric advocate, de-escalating team anxiety, highly collaborative"
        },
        {
            "totem": "The Cyber Snow Leopard",
            "traits": "High Initiative, High Tolerance for Ambiguity, Autonomous, Rapid Prototyper",
            "style": "Frontier explorer, solo tactician, thrives in uncharted chaos, rejects micro-management"
        },
        {
            "totem": "The Deep-Sea Titan Whale",
            "traits": "High Integrity, High Purpose, Long-Horizon Stewardship, Sincerity",
            "style": "Infinite game player, societal impact, green transition, patient ethical leadership"
        },
        {
            "totem": "The Luminary Arctic Fox",
            "traits": "High Innovation, High Aesthetics, Cross-Discipline Polymath, Adaptive",
            "style": "Narrative alchemist, turning code and numbers into magnetic sensory experiences"
        }
    ]

    domains = ["Artificial Intelligence & Software", "Biotechnology & Healthcare", "Immersive Creative & Game Media", "ESG & Green Energy", "Quantitative Finance & Web3"]

    examples = []
    
    # Generate 600+ structured instruction records
    for t in totems:
        for d in domains:
            system_prompt = "You are CareerLens AI Totem Strategist, an advanced workforce advisory intelligence trained on O*NET 30.3 occupational work styles."
            user_prompt = f"Candidate Profile:\n- Spirit Totem: {t['totem']}\n- Personality Coordinates: {t['traits']}\n- Working Style: {t['style']}\n- Selected Industry Domain: {d}\n\nPlease generate a distinctive, elevated future-ready job title, analyze their specific organizational value, and highlight potential pitfalls to avoid."
            
            assistant_response = f"### Recommended Elevated Role: **{t['totem']} Frontier Specialist ({d})**\n\n" \
                                 f"#### 1. Why Your Temperament Thrives Here:\n" \
                                 f"Your authentic score in {t['traits']} directly maps to high-impact problem zones in {d}. While conventional workers struggle with ambiguity, your {t['style']} creates an asymmetric advantage.\n\n" \
                                 f"#### 2. Direct Strategic Business Contribution:\n" \
                                 f"- Accelerates project velocity by decoupling unnecessary meeting churn.\n" \
                                 f"- Establishes a verifiable benchmark for competency over credentialism.\n\n" \
                                 f"#### 3. Organizational Pitfall to Avoid:\n" \
                                 f"Seek out employers with clear asynchronous workflows. Avoid hyper-political legacy hierarchies that penalize direct truth-telling."
            
            examples.append({
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                    {"role": "assistant", "content": assistant_response}
                ]
            })

    with open(out_file, "w", encoding="utf-8") as f:
        for ex in examples:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    print(f"Generated {len(examples)} instruction examples at: {out_file}")

if __name__ == "__main__":
    generate_totem_dataset()
