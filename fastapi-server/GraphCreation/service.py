from neo4j import GraphDatabase
import csv
from io import StringIO
from typing import List
from .models import EdgeInput

# 🔗 Neo4j config
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASS = "password"

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))


def parse_csv(file_content: str) -> List[EdgeInput]:
    reader = csv.DictReader(StringIO(file_content))
    data = []

    for row in reader:
        data.append(
            EdgeInput(
                paper_id=row["paper_id"],
                paper_title=row["paper_title"],
                patent_id=row["patent_id"],
                patent_title=row["patent_title"],
                similarity=float(row["similarity"]),
            )
        )
    return data


def upload_to_neo4j(edges: List[EdgeInput]):
    with driver.session() as session:
        for e in edges:
            session.run(
                """
                MERGE (p:Paper {id: $paper_id})
                SET p.title = $paper_title

                MERGE (pt:Patent {id: $patent_id})
                SET pt.title = $patent_title

                MERGE (p)-[r:SIMILAR_TO]->(pt)
                SET r.similarity = $similarity
                """,
                paper_id=e.paper_id,
                paper_title=e.paper_title,
                patent_id=e.patent_id,
                patent_title=e.patent_title,
                similarity=e.similarity,
            )

    return {
        "nodes_created": len(edges) * 2,
        "relationships_created": len(edges),
    }