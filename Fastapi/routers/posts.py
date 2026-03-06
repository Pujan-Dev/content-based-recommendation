"""
Post Management Endpoints.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from models.schemas import NewPostRequest, PostResponse
from worker import PostEncodingWorker

router = APIRouter(prefix="/posts", tags=["posts"])


def get_workers():
    """Dependency to get workers."""
    from main import post_encoding_worker
    return post_encoding_worker


def get_data_store():
    """Dependency to get data store."""
    from main import data_store
    return data_store


@router.post("", response_model=PostResponse)
async def create_post(post: NewPostRequest):
    """
    Create a new post with auto-generated embedding.

    This endpoint:
    1. Accepts post data (title, body, category, etc.)
    2. Uses PostEncodingWorker to auto-generate embedding
    3. Saves post with encoding to MongoDB
    4. Updates in-memory cache and FAISS index
    5. Returns the encoded post

    Worker-driven features:
    - Automatic SentenceTransformer embedding generation
    - Normalized embeddings for similarity search
    - Auto FAISS index update
    - MongoDB persistence

    Args:
        post: New post data

    Returns:
        Post document with auto-generated embedding vector

    Raises:
        HTTPException: If post encoding fails
    """
    post_encoding_worker = get_workers()

    if post_encoding_worker is None:
        raise HTTPException(status_code=503, detail="Encoding worker not initialized")

    try:
        post_dict = post.model_dump()
        encoded_post = post_encoding_worker.create_post_with_encoding(post_dict)
        return PostResponse(**encoded_post)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Encoding error: {str(e)}")
