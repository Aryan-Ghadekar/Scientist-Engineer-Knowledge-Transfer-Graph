from neo4j import GraphDatabase
import os
# import ssl
# import certifi
from dotenv import load_dotenv

load_dotenv()

URI = os.getenv("NEO4J_URI")
USER = os.getenv("NEO4J_USER")
PASSWORD = os.getenv("NEO4J_PASSWORD")

# ssl_context = ssl.create_default_context(cafile=certifi.where())

driver = GraphDatabase.driver(URI, 
                              auth=(USER, PASSWORD))

def get_session():
    return driver.session()

try:
    driver.verify_connectivity()
    print("Connection of neo4j successfull!!!!")
except Exception as e:
    print(f"Connection failed of neo4j: {e}")