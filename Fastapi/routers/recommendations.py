"""
Recommendation Endpoints.
"""

from fastapi import APIRouter, Query

from models.schemas import RecommendationsResponse
from services.recommendation_service import RecommendationService
from config import FINAL_RECOMMENDATIONS

router = APIRouter(tags=["recommendations"])


def get_data_store():
    """Dependency to get data store."""
    from main import data_store
    return data_store


@router.get("/recommendations", response_model=RecommendationsResponse)
async def get_recommendations(
    user_id: str = Query(..., description="User ID to get recommendations for"),
    k: int = Query(
        FINAL_RECOMMENDATIONS, ge=1, le=50, description="Number of recommendations"
    ),
):
    """
    Get personalized post recommendations for a user.

    This endpoint:
    1. Fetches user preferences and interaction history
    2. Generates query embedding from user's category preferences
    3. Searches FAISS index for similar posts
    4. Filters out already-viewed posts
    5. Ranks using hybrid scoring (category + engagement + recency)
    6. Returns top-K recommendations

    Args:
        user_id: User identifier
        k: Number of recommendations (default: 10, max: 50)

    Returns:
        List of personalized recommendations with scores
    """
    data_store = get_data_store()
    return RecommendationService.get_recommendations(data_store, user_id, k)
