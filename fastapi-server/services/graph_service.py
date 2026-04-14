from config.db import get_session

def get_papers_with_patents():
    query = """
    MATCH (p:Paper)-[r:SIMILAR_TO]->(pat:Patent)
    RETURN p.id AS paper_id,
           coalesce(r.score, 0.0) AS similarity,
           p.year AS paper_year,
           pat.year AS patent_year
    LIMIT 50
    """

    with get_session() as session:
        result = session.run(query)
        return [record.data() for record in result]