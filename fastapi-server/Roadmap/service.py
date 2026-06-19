from config.db import get_session
from services.ai_service import client
import re
from config.postgres_db import SessionLocal
from .models import Paper


def get_graph_context(title):
    query = """
    MATCH (p:Paper)-[:HAS_PREDICTION]->(pred)
    WHERE p.title = $title
    RETURN pred.label AS label, pred.probability AS prob
    """

    with get_session() as session:
        result = session.run(query, {"title": title})
        return [dict(r) for r in result]


def generate_roadmap(paper):
    """
    Returns HUMAN-READABLE STEP-BY-STEP ROADMAP (frontend-friendly text)
    """

    context = get_graph_context(paper.title)

    context_str = (
        "\n".join([f"- {c.get('label')} ({c.get('prob')})" for c in context])
        if context
        else "No prior context found"
    )

    paper_info = {"title": paper.title, "abstract": (paper.abstract or "")[:800]}

    prompt = f"""
You are a senior AI product engineer.

Convert this paper into a REALISTIC step-by-step product roadmap.

RULES:
- Be practical, not theoretical
- Keep steps implementable by small team
- Avoid fluff
- Use numbered steps
- Do NOT assume unlimited data or compute
- If paper is not deployable → clearly say it
- Prefer simple architectures over complex ones
- Avoid buzzwords
- Be specific (models, APIs, infra)

OUTPUT FORMAT:

Step 1: ...
Step 2: ...
Step 3: ...

Include:
- MVP building steps
- data handling
- deployment
- risks
- simplifications

PAPER:
{paper_info['title']}
{paper_info['abstract']}

CONTEXT:
{context_str}
"""

    def call_llm():
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content

    raw_output = call_llm()

    # 🔹 Clean output (remove weird formatting)
    cleaned = re.sub(r"```.*?```", "", raw_output, flags=re.DOTALL)
    cleaned = cleaned.replace("•", "").strip()

    return cleaned


from config.db import get_session


def save_and_link_paper(paper, prediction):
    """
    1. Save new paper
    2. Link with similar existing papers
    3. Link with patents (if any exist)
    """

    with get_session() as session:

        # 🔹 Save paper + prediction
        session.run(
            """
        MERGE (p:Paper {title: $title})
        SET p.abstract = $abstract,
            p.year = $year,
            p.novelty = $novelty

        MERGE (pred:Prediction {title: $title})
        SET pred.probability = $probability,
            pred.label = $label,
            pred.confidence = $confidence

        MERGE (p)-[:PREDICTED_AS]->(pred)
        """,
            title=paper.get("title"),
            abstract=paper.get("abstract"),
            year=paper.get("year"),
            novelty=paper.get("novelty", 0),
            probability=prediction["probability"],
            label=prediction["label"],
            confidence=prediction["confidence"],
        )

        # 🔹 Link with similar existing papers (basic matching)
        session.run(
            """
        MATCH (new:Paper {title: $title}), (p:Paper)
        WHERE new <> p 
        AND toLower(p.title) CONTAINS toLower($title)

        MERGE (new)-[:SIMILAR_TO {score: 0.7}]->(p)
        """,
            {"title": paper.get("title")},
        )

        # 🔹 Link to patents (if related exist)
        session.run(
            """
        MATCH (p:Paper {title: $title}), (pt:Patent)
        WHERE toLower(pt.title) CONTAINS toLower($title)

        MERGE (p)-[:SIMILAR_TO {score: 0.6}]->(pt)
        """,
            {"title": paper.get("title")},
        )


def get_matches(title: str):
    with get_session() as session:
        result = session.run(
            """
        MATCH (p:Paper {title: $title})-[r:SIMILAR_TO]->(n)
        RETURN 
            labels(n)[0] AS type,
            n.title AS title,
            r.score AS score
        LIMIT 5
        """,
            {"title": title},
        )

        return [dict(record) for record in result]


def store_in_postgres(paper, prediction):

    db = SessionLocal()

    try:
        db_paper = Paper(
            title=paper.title,
            abstract=paper.abstract,
            year=paper.year,
            novelty=paper.novelty,
            prediction=prediction["label"],
            probability=prediction["probability"],
            confidence=prediction["confidence"],
        )

        db.add(db_paper)
        db.commit()
        db.refresh(db_paper)

        return db_paper

    finally:
        db.close()
