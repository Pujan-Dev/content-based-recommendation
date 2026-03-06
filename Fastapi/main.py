"""
FastAPI Backend for Text-Based Social Media Recommendation System

This service provides personalized post recommendations using:
- MongoDB for post and user data storage
- FAISS for efficient similarity search on post embeddings
- Hybrid ranking: category match, engagement, and recency
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import asyncio

# Import configuration
from config import (
    MONITOR_CHECK_INTERVAL,
    MONITOR_BATCH_SIZE,
)

# Import services
from services import (
    DataStore,
    load_or_create_faiss_index,
)

# Import routers
from routers import health_router, posts_router, recommendations_router

# Import workers
from worker import PostEncodingWorker, EmbeddingWorker, BackgroundPostMonitor
# Global State
data_store = DataStore()
post_encoding_worker: Optional[PostEncodingWorker] = None
embedding_worker: Optional[EmbeddingWorker] = None
background_monitor: Optional[BackgroundPostMonitor] = None
# FastAPI Application
app = FastAPI(
    title="Social Media Recommendation API",
    description="Personalized post recommendations using FAISS and hybrid ranking",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Include Routers
app.include_router(health_router)
app.include_router(posts_router)
app.include_router(recommendations_router)
# Lifecycle Events

@app.on_event("startup")
async def startup_event():
    """Initialize data and FAISS index on application startup."""
    global post_encoding_worker, embedding_worker, background_monitor

    print("\nStarting Recommendation Service...")
    print("Loading data from MongoDB...")
    data_store.load_from_mongodb()

    print("Loading embedding model...")
    data_store.load_embedding_model()

    print("Initializing workers...")
    post_encoding_worker = PostEncodingWorker(
        data_store, embedding_model=data_store.embedding_model
    )
    embedding_worker = EmbeddingWorker(embedding_model=data_store.embedding_model)

    print("Loading or creating FAISS index...")
    data_store.faiss_index, data_store.post_embeddings = load_or_create_faiss_index(
        data_store.posts, data_store.embedding_model
    )

    print("Starting background post monitor...")
    background_monitor = BackgroundPostMonitor(
        data_store=data_store,
        post_encoding_worker=post_encoding_worker,
        check_interval=MONITOR_CHECK_INTERVAL,
        batch_size=MONITOR_BATCH_SIZE,
    )
    background_monitor.start()

    print("Service started successfully!")
    print("API documentation available at: http://localhost:8000/docs\n")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    global background_monitor

    print("\nShutting down service...")

    if background_monitor is not None:
        await background_monitor.stop()

    data_store.close()
    print("Service stopped successfully.\n")

# Development Server
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
