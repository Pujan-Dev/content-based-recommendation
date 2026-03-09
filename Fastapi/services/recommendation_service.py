"""
Recommendation Service with FAISS and Hybrid Ranking.
"""

from fastapi import HTTPException
from datetime import datetime, timezone
from typing import List, Dict, Any
import numpy as np

from config import (
    TOP_K_CANDIDATES,
    FINAL_RECOMMENDATIONS,
    CATEGORY_WEIGHT,
    ENGAGEMENT_WEIGHT,
    RECENCY_WEIGHT,
)
from models.schemas import RecommendationResponse, RecommendationsResponse
from .embedding_service import embed_query


class RecommendationService:
    """Core recommendation logic using FAISS and hybrid ranking."""

    @staticmethod
    def _calculate_engagement_score(post: Dict[str, Any]) -> float:
        """
        Calculate engagement score from post metrics (0-1 normalized).
        
        Args:
            post: Post dictionary
            
        Returns:
            Normalized engagement score (0-1)
        """
        score = post.get("score", 0)
        comments = post.get("numComments", post.get("comments", 0))
        
        # Engagement = normalized combination of upvotes and comments
        # Using log scale to avoid extreme values
        engagement = np.log1p(score) + np.log1p(comments * 2)  # Comments weighted higher
        
        # Normalize to 0-1 range (log1p(1000) ≈ 6.9, log1p(200) ≈ 5.3)
        normalized = min(engagement / 12.0, 1.0)
        
        return float(normalized)
    
    @staticmethod
    def _calculate_recency_weight(created_at: str) -> float:
        """
        Calculate recency weight (0-1) based on post age.
        Newer posts score higher.
        
        Args:
            created_at: ISO format timestamp string
            
        Returns:
            Recency weight (0-1)
        """
        try:
            # Parse created_at timestamp
            if created_at.endswith('Z'):
                post_time = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            else:
                post_time = datetime.fromisoformat(created_at)
            
            # Get current time
            now = datetime.now(timezone.utc)
            
            # Calculate days ago (or hours if very recent)
            time_diff = now - post_time
            days_ago = time_diff.total_seconds() / (24 * 3600)
            
            # Exponential decay: newer posts score higher
            # At 0 days: 1.0, at 7 days: ~0.37, at 30 days: ~0.03
            recency = np.exp(-days_ago / 7.0)  # Half-life of 7 days
            
            return float(min(recency, 1.0))
        except Exception:
            # Fallback if timestamp parsing fails
            return 0.5
    
    @staticmethod
    def _calculate_category_score(user_preferences: Dict[str, Any], post_category: str) -> float:
        """
        Calculate category match score based on user preferences.
        
        Args:
            user_preferences: User preference dictionary with categories
            post_category: Post category
            
        Returns:
            Category match score (0-1)
        """
        # Get all preference categories
        categories = user_preferences.get("categories", [])
        
        # If post category matches any user preference, return high score
        if post_category in categories:
            # Find the preference position (earlier = higher priority)
            index = categories.index(post_category)
            # Score decreases with position (first=1.0, second=0.7, third=0.4)
            return max(1.0 - (index * 0.3), 0.0)
        
        return 0.0
    
    @staticmethod
    def _calculate_hybrid_score(
        user_preferences: Dict[str, Any],
        post: Dict[str, Any],
    ) -> float:
        """
        Calculate real-time hybrid ranking score.
        
        Score = (Category Match * 0.5) + (Engagement * 0.3) + (Recency * 0.2)
        
        Args:
            user_preferences: User preference dictionary
            post: Post dictionary
            
        Returns:
            Hybrid ranking score (0-1+)
        """
        # Calculate individual components in real-time
        category_score = RecommendationService._calculate_category_score(
            user_preferences, 
            post.get("category", "uncategorized")
        )
        
        engagement_score = RecommendationService._calculate_engagement_score(post)
        
        recency_score = RecommendationService._calculate_recency_weight(
            post.get("createdUtc", post.get("created_at", datetime.now().isoformat()))
        )
        
        # Weighted combination
        hybrid_score = (
            CATEGORY_WEIGHT * category_score 
            + ENGAGEMENT_WEIGHT * engagement_score 
            + RECENCY_WEIGHT * recency_score
        )
        
        return hybrid_score

    @staticmethod
    def get_recommendations(
        data_store, user_id: str, k: int = FINAL_RECOMMENDATIONS
    ) -> RecommendationsResponse:
        """
        Generate personalized post recommendations for a user.

        Algorithm:
        1. Fetch user profile and preferences from MongoDB
        2. Create query embedding from user preferences
        3. Search FAISS index for top-K similar posts
        4. Filter out already-interacted posts
        5. Calculate hybrid scores in real-time (not from DB)
        6. Return top-N recommendations

        Args:
            data_store: DataStore instance
            user_id: User identifier
            k: Number of recommendations to return

        Returns:
            RecommendationsResponse with ranked recommendations
        """
        # Step 1: Fetch user data
        user = data_store.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")

        preferences = user.get("preferences", {})
        interactions = user.get("interactions", [])

        # Step 2: Build query from preferences
        categories = preferences.get("categories", [])
        if not categories:
            query_text = "interesting posts"
        else:
            query_text = f"Posts about {', '.join(categories)}"

        # Step 3: Generate query embedding
        if data_store.embedding_model is None:
            raise HTTPException(status_code=500, detail="Embedding model not loaded")

        query_embedding = embed_query(query_text, data_store.embedding_model)

        # Step 4: Search FAISS index
        if data_store.faiss_index is None:
            raise HTTPException(status_code=500, detail="FAISS index not initialized")

        distances, indices = data_store.faiss_index.search(
            query_embedding, min(TOP_K_CANDIDATES, data_store.faiss_index.ntotal)
        )

        # Step 5: Get already-viewed post IDs
        viewed_post_ids = set(str(interaction.get("post_id")) for interaction in interactions if interaction.get("post_id") is not None)

        # Step 6: Score and rank candidates (calculated in real-time)
        candidates = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx >= len(data_store.posts):
                continue

            post = data_store.posts[idx]
            post_id = str(post.get("postId") or post.get("_id"))
            mongo_id = str(post.get("_id"))

            if post_id in viewed_post_ids or mongo_id in viewed_post_ids:
                continue

            # Calculate score in real-time
            hybrid_score = RecommendationService._calculate_hybrid_score(
                preferences, post
            )
            
            # Calculate engagement and recency for response
            engagement_score = RecommendationService._calculate_engagement_score(post)
            recency_weight = RecommendationService._calculate_recency_weight(
                post.get("createdUtc", post.get("created_at", datetime.now().isoformat()))
            )

            candidates.append(
                {
                    "post": post,
                    "score": hybrid_score,
                    "engagement_score": engagement_score,
                    "recency_weight": recency_weight,
                    "distance": float(distance),
                }
            )

        # Step 7: Sort and return top-K
        candidates.sort(key=lambda x: x["score"], reverse=True)
        top_recommendations = candidates[:k]

        recommendations = [
            RecommendationResponse(
                post_id=str(cand["post"].get("postId") or cand["post"].get("_id")),
                title=cand["post"].get("title", ""),
                category=cand["post"].get("category", ""),
                score=cand["score"],
                engagement_score=cand["engagement_score"],
                recency_weight=cand["recency_weight"],
                distance=cand["distance"],
            )
            for cand in top_recommendations
        ]

        return RecommendationsResponse(
            user_id=user_id,
            timestamp=datetime.now().isoformat(),
            recommendations=recommendations,
            total_candidates=len(candidates),
            filtered_count=sum(1 for _ in top_recommendations),
        )
