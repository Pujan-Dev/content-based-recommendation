"""
Pydantic Models and Schemas for API requests and responses.
"""

from pydantic import BaseModel, Field, AliasChoices, ConfigDict
from typing import List, Dict, Any, Optional


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
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(..., description="Post title")
    body: str = Field(..., description="Post content")
    category: str = Field(..., description="Post category")
    subreddit: Optional[str] = Field(default=None, description="Subreddit/community")
    score: int = Field(default=0, description="Initial engagement score")
    numComments: int = Field(
        default=0,
        validation_alias=AliasChoices("numComments", "comments"),
        description="Number of comments",
    )
    createdUtc: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("createdUtc", "created_at"),
        description="Post creation timestamp",
    )
    engagementScore: float = Field(default=0.0)
    wordCount: int = Field(default=0)
    postLength: int = Field(default=0)
    recencyWeight: float = Field(default=0.0)
    hourPosted: int = Field(default=0)
    dayOfWeek: int = Field(default=0)


class PostResponse(BaseModel):
    """Post response with auto-generated embedding"""
    model_config = ConfigDict(populate_by_name=True)

    _id: str
    postId: str
    title: str
    body: str
    subreddit: Optional[str] = None
    category: str
    score: int
    numComments: int = Field(
        validation_alias=AliasChoices("numComments", "comments")
    )
    createdUtc: str = Field(
        validation_alias=AliasChoices("createdUtc", "created_at")
    )
    engagementScore: float = 0.0
    wordCount: int = 0
    postLength: int = 0
    recencyWeight: float = 0.0
    hourPosted: int = 0
    dayOfWeek: int = 0
    image: Optional[str] = None
    likes: List[str] = Field(default_factory=list)
    dislikes: List[str] = Field(default_factory=list)
    likesCount: int = 0
    dislikesCount: int = 0
    embedding: List[float] = Field(description="Auto-generated embedding vector")
