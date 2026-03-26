"""
Health and Status Endpoints.
"""

from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder
from typing import Dict, Any
from bson import ObjectId

from models.schemas import HealthResponse

router = APIRouter(tags=["health"])


def get_data_store():
    """Dependency to get data store."""
    from main import data_store
    return data_store


@router.get("/", response_model=Dict[str, Any])
async def root():
    """Root endpoint with API information."""
    return {
        "service": "Social Media Recommendation API",
        "version": "1.0.0",
        "endpoints": {
            "recommendations": "/recommendations?user_id=<user_id>",
            "health": "/health",
            "posts": "/posts",
            "users": "/users",
        },
    }


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    data_store = get_data_store()
    return HealthResponse(
        status="healthy",
        posts_loaded=len(data_store.posts),
        users_loaded=len(data_store.users),
        faiss_index_size=data_store.faiss_index.ntotal if data_store.faiss_index else 0,
    )


@router.get("/posts", response_model=list)
async def get_all_posts():
    """Return all posts currently loaded in memory."""
    data_store = get_data_store()
    return jsonable_encoder(data_store.posts, custom_encoder={ObjectId: str})


@router.get("/users", response_model=list)
async def get_all_users():
    """Return all users currently loaded in memory."""
    data_store = get_data_store()
    return jsonable_encoder(data_store.users, custom_encoder={ObjectId: str})
