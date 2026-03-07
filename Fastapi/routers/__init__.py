"""Routers module for API endpoints."""

from .health import router as health_router
from .posts import router as posts_router
from .recommendations import router as recommendations_router

__all__ = ["health_router", "posts_router", "recommendations_router"]
