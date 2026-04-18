from config.db import get_session

def get_papers_with_patents():
    query = """
    MATCH (p:Paper)-[r:SIMILAR_TO]->(pt:Patent)
    RETURN 
        p.id AS paper_id,
        p.title AS paper_title,
        p.year AS paper_year,
        pt.title AS patent_title,
        pt.year AS patent_year,
        r.score AS similarity,
        p.novelty AS novelty
    LIMIT 50
    """

    with get_session() as session:
        result = session.run(query)
        return [dict(record) for record in result]