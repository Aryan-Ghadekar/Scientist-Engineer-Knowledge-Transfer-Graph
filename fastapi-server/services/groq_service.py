import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_roadmap(paper, graph_context):
    prompt = f"""
You are an innovation analyst AI.

Research Paper:
Title: {paper.get("title")}
Abstract: {paper.get("abstract")}

Related Graph Insights:
{graph_context}

Generate:
1. Future research roadmap
2. Possible patent opportunities
3. Similar technologies
4. Suggestions to improve patent potential
"""

    response = client.chat.completions.create(
        model="llama-3.1-70b-versatile",  # fast + powerful
        messages=[
            {"role": "system", "content": "You are a deep-tech innovation expert."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
    )

    return response.choices[0].message.content