"""
Pydantic Models and Schemas for API requests and responses.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any


class RecommendationResponse(BaseModel):
    """Single recommendation item"""
    post_id: str
    title: str
    category: str
    score: float
    engagement_score: float
    recency_weight: float
    distance: float = Field(description="L2 distance from query embedding")


class RecommendationsResponse(BaseModel):
    """Complete recommendations response"""
    user_id: str
    timestamp: str
    recommendations: List[RecommendationResponse]
    total_candidates: int
    filtered_count: int


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    posts_loaded: int
    users_loaded: int
    faiss_index_size: int


class NewPostRequest(BaseModel):
    """Request model for creating new posts with auto-encoding"""
    title: str = Field(..., description="Post title")
    body: str = Field(..., description="Post content")
    category: str = Field(..., description="Post category")
    score: int = Field(default=0, description="Initial engagement score")
    comments: int = Field(default=0, description="Number of comments")


class PostResponse(BaseModel):
    """Post response with auto-generated embedding"""
    _id: str
    title: str
    body: str
    category: str
    score: int
    comments: int
    created_at: str
    embedding: List[float] = Field(description="Auto-generated embedding vector")
