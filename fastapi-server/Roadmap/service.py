from config.db import get_session
from auth.service import supabase_admin as supabase
from services.groq_service import client

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
    context = get_graph_context(paper.title)

    prompt = f"""
    You are an innovation strategist.

    Paper:
    {paper.title}

    Abstract:
    {paper.abstract}

    Graph insights:
    {context}

    Generate:
    1. Steps to convert into patent
    2. Technical improvements
    3. Industry applications
    4. Risks & gaps
    """

    response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",   # ✅ updated
    messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content

def store_in_supabase(paper, prediction):
    supabase.table("papers").insert({
        "title": paper.title,
        "abstract": paper.abstract,
        "year": paper.year,
        "prediction": prediction["label"],
        "probability": prediction["probability"]
    }).execute()


from config.db import get_session

def save_and_link_paper(paper, prediction):
    """
    1. Save new paper
    2. Link with similar existing papers
    3. Link with patents (if any exist)
    """

    with get_session() as session:

        # 🔹 Save paper + prediction
        session.run("""
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
        confidence=prediction["confidence"]
        )

        # 🔹 Link with similar existing papers (basic matching)
        session.run("""
        MATCH (new:Paper {title: $title}), (p:Paper)
        WHERE new <> p 
        AND toLower(p.title) CONTAINS toLower($title)

        MERGE (new)-[:SIMILAR_TO {score: 0.7}]->(p)
        """, {"title": paper.get("title")})

        # 🔹 Link to patents (if related exist)
        session.run("""
        MATCH (p:Paper {title: $title}), (pt:Patent)
        WHERE toLower(pt.title) CONTAINS toLower($title)

        MERGE (p)-[:SIMILAR_TO {score: 0.6}]->(pt)
        """, {"title": paper.get("title")})

def get_matches(title: str):
    with get_session() as session:
        result = session.run("""
        MATCH (p:Paper {title: $title})-[r:SIMILAR_TO]->(n)
        RETURN 
            labels(n)[0] AS type,
            n.title AS title,
            r.score AS score
        LIMIT 5
        """, {"title": title})

        return [dict(record) for record in result]
    
def store_in_supabase(paper, prediction):
    supabase.table("papers").insert({
        "title": paper.title,
        "abstract": paper.abstract,
        "year": paper.year,
        "novelty": paper.novelty,
        "prediction": prediction["label"],
        "probability": prediction["probability"],
        "confidence": prediction["confidence"]
    }).execute()