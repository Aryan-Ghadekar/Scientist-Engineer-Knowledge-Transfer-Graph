from fastapi import APIRouter, UploadFile, File
from .service import parse_csv, upload_to_neo4j
from .models import UploadResponse

graph_create_router = APIRouter()


@graph_create_router.post("/upload-dataset", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    content = await file.read()
    decoded = content.decode("utf-8")

    edges = parse_csv(decoded)

    result = upload_to_neo4j(edges)

    return {
        "message": "Dataset uploaded successfully",
        "nodes_created": result["nodes_created"],
        "relationships_created": result["relationships_created"],
    }