"""
Configuration and Constants for the Recommendation API.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

try:
    load_dotenv()
except Exception:
    pass

# Embedding Configuration

EMBEDDING_DIMENSION = 384  # all-MiniLM-L6-v2 embedding size
EMBEDDING_MODEL_NAME = "paraphrase-MiniLM-L3-v2"

# FAISS Configuration

TOP_K_CANDIDATES = 30  # Number of candidates to retrieve from FAISS
FINAL_RECOMMENDATIONS = 10  # Number of recommendations to return

# Scoring Weights for Hybrid Ranking

CATEGORY_WEIGHT = 0.5
ENGAGEMENT_WEIGHT = 0.3
RECENCY_WEIGHT = 0.2

# Data Paths

DATA_DIR = Path(__file__).parent / "data"
print(DATA_DIR)
POSTS_FILE = DATA_DIR / "posts.json"
USERS_FILE = DATA_DIR / "users.json"
FAISS_INDEX_FILE = DATA_DIR / "reddit_posts.faiss"
PROCESSED_POSTS_FILE = DATA_DIR / "processed_posts.pkl"
EMBEDDING_MODEL_DIR = DATA_DIR / "embedding_model"
print(f"Data directory set to: {DATA_DIR}")
print(f"Posts file path: {POSTS_FILE}")
print(f"Users file path: {USERS_FILE}")
print(f"FAISS index file path: {FAISS_INDEX_FILE}")
print(f"Processed posts file path: {PROCESSED_POSTS_FILE}")
print(f"Embedding model directory: {EMBEDDING_MODEL_DIR}")
# MongoDB Configuration

MONGODB_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE") or os.getenv("MONGO_DB_NAME", "social_media")
MONGODB_POSTS_COLLECTION = os.getenv("MONGODB_POSTS_COLLECTION", "posts")
MONGODB_USERS_COLLECTION = os.getenv("MONGODB_USERS_COLLECTION", "users")

# Background Monitor Configuration

MONITOR_CHECK_INTERVAL = 10  # Check every 10 seconds
MONITOR_BATCH_SIZE = 5  # Encode up to 5 posts per check
