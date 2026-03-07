"""
FastAPI Backend for Text-Based Social Media Recommendation System

This service provides personalized post recommendations using:
- MongoDB for post and user data storage
- FAISS for efficient similarity search on post embeddings
- Hybrid ranking: category match, engagement, and recency
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import numpy as np
import faiss
import json
import os
import pickle
import asyncio
from pathlib import Path
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
from worker import PostEncodingWorker, EmbeddingWorker, BackgroundPostMonitor

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# ============================================================================
# Configuration
# ============================================================================

EMBEDDING_DIMENSION = 384  # all-MiniLM-L6-v2 embedding size
TOP_K_CANDIDATES = 30  # Number of candidates to retrieve from FAISS
FINAL_RECOMMENDATIONS = 10  # Number of recommendations to return

# Scoring weights for hybrid ranking
CATEGORY_WEIGHT = 0.5
ENGAGEMENT_WEIGHT = 0.3
RECENCY_WEIGHT = 0.2

# Data paths (for testing with JSON files - replace with MongoDB in production)
DATA_DIR = Path(__file__).parent / "data"
POSTS_FILE = DATA_DIR / "posts.json"
USERS_FILE = DATA_DIR / "users.json"
FAISS_INDEX_FILE = DATA_DIR / "reddit_posts.faiss"
PROCESSED_POSTS_FILE = DATA_DIR / "processed_posts.pkl"
EMBEDDING_MODEL_DIR = DATA_DIR / "embedding_model"

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "social_media")
MONGODB_POSTS_COLLECTION = os.getenv("MONGODB_POSTS_COLLECTION", "posts")
MONGODB_USERS_COLLECTION = os.getenv("MONGODB_USERS_COLLECTION", "users")

# ============================================================================
# Pydantic Models
# ============================================================================

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

# ============================================================================
# In-Memory Data Storage (Replace with MongoDB in production)
# ============================================================================

class DataStore:
    """
    In-memory data store for posts and users.
    In production, replace with MongoDB client connections.
    """
    
    def __init__(self):
        self.posts: List[Dict[str, Any]] = []
        self.users: List[Dict[str, Any]] = []
        self.posts_by_id: Dict[str, Dict[str, Any]] = {}
        self.users_by_id: Dict[str, Dict[str, Any]] = {}
        self.faiss_index: Optional[faiss.IndexFlatL2] = None
        self.post_embeddings: Optional[np.ndarray] = None
        self.embedding_model: Optional[SentenceTransformer] = None
        self.mongo_client: Optional[MongoClient] = None
        self.mongo_db = None
        self.posts_collection = None
        self.users_collection = None

    def connect_mongodb(self):
        """Connect to MongoDB and initialize collections."""
        if self.mongo_client is not None:
            return

        self.mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        self.mongo_client.admin.command("ping")
        self.mongo_db = self.mongo_client[MONGODB_DATABASE]
        self.posts_collection = self.mongo_db[MONGODB_POSTS_COLLECTION]
        self.users_collection = self.mongo_db[MONGODB_USERS_COLLECTION]
        print(f"Connected to MongoDB: {MONGODB_DATABASE}")

    def bootstrap_mongodb_if_empty(self):
        """Seed MongoDB from JSON files when collections are empty."""
        posts_count = self.posts_collection.count_documents({})
        users_count = self.users_collection.count_documents({})

        if posts_count > 0 and users_count > 0:
            print(f"MongoDB already has data: posts={posts_count}, users={users_count}")
            return

        self.ensure_data_exists()
        json_posts: List[Dict[str, Any]] = []
        json_users: List[Dict[str, Any]] = []

        if POSTS_FILE.exists():
            with open(POSTS_FILE, "r") as f:
                json_posts = json.load(f)
        if USERS_FILE.exists():
            with open(USERS_FILE, "r") as f:
                json_users = json.load(f)

        if posts_count == 0 and json_posts:
            for post in json_posts:
                post_id = post.get("_id") or post.get("id")
                if not post_id:
                    continue
                post["_id"] = str(post_id)
                self.posts_collection.replace_one({"_id": post["_id"]}, post, upsert=True)
            print(f"Seeded MongoDB posts: {len(json_posts)}")

        if users_count == 0 and json_users:
            for user in json_users:
                user_id = user.get("user_id")
                if not user_id:
                    continue
                self.users_collection.replace_one({"user_id": user_id}, user, upsert=True)
            print(f"Seeded MongoDB users: {len(json_users)}")

    def load_from_mongodb(self):
        """Load posts/users from MongoDB into in-memory caches."""
        self.connect_mongodb()
        self.bootstrap_mongodb_if_empty()

        self.posts = list(self.posts_collection.find({}, {"_id": 1, "id": 1, "title": 1, "body": 1, "subreddit": 1, "final_category": 1, "score": 1, "num_comments": 1, "created_utc": 1, "engagement_score": 1, "word_count": 1, "post_length": 1, "recency_weight": 1, "hour_posted": 1, "day_of_week": 1}))
        self.users = list(self.users_collection.find({}, {"_id": 1, "user_id": 1, "username": 1, "category_preferences": 1, "interaction_history": 1}))

        for post in self.posts:
            post["_id"] = str(post.get("_id"))

        self.posts_by_id = {str(p.get("_id")): p for p in self.posts if p.get("_id") is not None}
        self.users_by_id = {u["user_id"]: u for u in self.users if u.get("user_id")}

        print(f"Loaded {len(self.posts)} posts from MongoDB")
        print(f"Loaded {len(self.users)} users from MongoDB")
        
    def ensure_data_exists(self):
        """Auto-populate database if empty."""
        posts_missing = (not POSTS_FILE.exists()) or POSTS_FILE.stat().st_size < 10
        users_missing = (not USERS_FILE.exists()) or USERS_FILE.stat().st_size < 10

        if posts_missing or users_missing:
            print("Database is empty or missing files. Generating sample data...")
            self._generate_sample_data()
            
    def _generate_sample_data(self):
        """Generate sample posts and users if database is empty."""
        from datetime import datetime, timedelta
        import random
        
        categories = [
            "technology", "gaming", "relationships", "food_cooking", 
            "health_fitness", "career_jobs", "education"
        ]
        
        # Generate 20 sample posts
        sample_posts = []
        for i in range(1, 21):
            category = random.choice(categories)
            sample_posts.append({
                "_id": f"post_{i:03d}",
                "id": f"post_{i:03d}",
                "title": f"Sample {category} post #{i}",
                "body": f"This is a sample post about {category}. It contains interesting information.",
                "subreddit": f"r/{category}",
                "final_category": category,
                "score": random.randint(10, 500),
                "num_comments": random.randint(5, 100),
                "created_utc": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat(),
                "engagement_score": random.uniform(0.5, 10.0),
                "recency_weight": random.uniform(0.3, 0.9)
            })
        
        # Generate 2 sample users
        sample_users = [
            {
                "user_id": "user_001",
                "username": "demo_user_1",
                "category_preferences": {
                    "technology": 0.9,
                    "gaming": 0.7,
                    "education": 0.5
                },
                "interaction_history": []
            },
            {
                "user_id": "user_002",
                "username": "demo_user_2",
                "category_preferences": {
                    "health_fitness": 0.8,
                    "food_cooking": 0.9,
                    "relationships": 0.6
                },
                "interaction_history": []
            }
        ]
        
        # Save to files
        POSTS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(POSTS_FILE, 'w') as f:
            json.dump(sample_posts, f, indent=2)
        with open(USERS_FILE, 'w') as f:
            json.dump(sample_users, f, indent=2)
            
        print(f"Generated {len(sample_posts)} sample posts and {len(sample_users)} sample users")
        
    def load_from_json(self):
        """Load posts and users from JSON files (dev/testing only)."""
        # Ensure data exists first
        self.ensure_data_exists()
        
        # Load posts
        if POSTS_FILE.exists():
            with open(POSTS_FILE, 'r') as f:
                self.posts = json.load(f)
                self.posts_by_id = {p['_id']: p for p in self.posts}
                print(f"Loaded {len(self.posts)} posts from {POSTS_FILE.name}")
        else:
            raise FileNotFoundError(f"Posts file not found: {POSTS_FILE}")
        
        # Load users
        if USERS_FILE.exists():
            with open(USERS_FILE, 'r') as f:
                self.users = json.load(f)
                self.users_by_id = {u['user_id']: u for u in self.users}
                print(f"Loaded {len(self.users)} users from {USERS_FILE.name}")
        else:
            raise FileNotFoundError(f"Users file not found: {USERS_FILE}")
    
    def load_embedding_model(self):
        """Load the SentenceTransformer embedding model."""
        if self.embedding_model is None:
            if EMBEDDING_MODEL_DIR.exists():
                print(f"Loading embedding model from {EMBEDDING_MODEL_DIR.name}...")
                self.embedding_model = SentenceTransformer(str(EMBEDDING_MODEL_DIR))
            else:
                print("Downloading paraphrase-MiniLM-L3-v2 model...")
                self.embedding_model = SentenceTransformer("paraphrase-MiniLM-L3-v2")
            print("Embedding model loaded")
        return self.embedding_model
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch user by ID from in-memory cache populated from MongoDB."""
        return self.users_by_id.get(user_id)
    
    def get_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        """Fetch post by ID from in-memory cache populated from MongoDB."""
        return self.posts_by_id.get(post_id)

    def close(self):
        """Close MongoDB connection."""
        if self.mongo_client is not None:
            self.mongo_client.close()
            self.mongo_client = None

# Initialize global data store
data_store = DataStore()
post_encoding_worker: Optional[PostEncodingWorker] = None
embedding_worker: Optional[EmbeddingWorker] = None
background_monitor: Optional[BackgroundPostMonitor] = None

# ============================================================================
# Embedding and FAISS Index Management
# ============================================================================

def create_embeddings_from_posts(posts: List[Dict[str, Any]], model: SentenceTransformer) -> np.ndarray:
    """
    Generate embeddings for posts using SentenceTransformer.
    
    Args:
        posts: List of post dictionaries
        model: Pre-loaded SentenceTransformer model
        
    Returns:
        numpy array of embeddings (N x 384)
    """
    print(f"Generating embeddings for {len(posts)} posts...")
    
    # Create text representations
    texts = [f"{p.get('title', '')} {p.get('body', '')[:200]}" for p in posts]
    
    # Generate embeddings
    embeddings = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True
    )
    
    print(f"Generated {len(embeddings)} embeddings of dimension {embeddings.shape[1]}")
    return embeddings.astype('float32')

def load_or_create_faiss_index(posts: List[Dict[str, Any]], model: SentenceTransformer) -> tuple:
    """
    Load pre-computed FAISS index or create a new one.
    
    Returns:
        (faiss_index, embeddings) tuple
    """
    # Try to load existing FAISS index and embeddings
    if FAISS_INDEX_FILE.exists():
        try:
            print(f"Loading pre-computed FAISS index from {FAISS_INDEX_FILE.name}...")
            faiss_index = faiss.read_index(str(FAISS_INDEX_FILE))
            print(f"Loaded FAISS index with {faiss_index.ntotal} vectors")

            if faiss_index.ntotal == len(posts):
                print("Using loaded FAISS index (size matches current posts)")
                return faiss_index, None

            print(
                "FAISS index size does not match loaded posts; "
                "rebuilding index from current data"
            )
            
        except Exception as e:
            print(f"Failed to load FAISS index: {e}")
            print("Creating new index from current posts...")
    
    # Create new FAISS index from current posts
    print("Creating new FAISS index...")
    embeddings = create_embeddings_from_posts(posts, model)
    
    dimension = embeddings.shape[1]
    faiss_index = faiss.IndexFlatL2(dimension)
    faiss_index.add(embeddings)
    
    print(f"Created FAISS index with {faiss_index.ntotal} vectors of dimension {dimension}")
    
    return faiss_index, embeddings

def embed_query(query_text: str, model: SentenceTransformer) -> np.ndarray:
    """
    Generate embedding for a text query.
    
    Args:
        query_text: Text to embed
        model: Pre-loaded SentenceTransformer model
        
    Returns:
        384-dimensional embedding vector
    """
    embedding = model.encode(
        [query_text],
        convert_to_numpy=True,
        normalize_embeddings=True
    )
    
    return embedding.astype('float32')

# ============================================================================
# Recommendation Service
# ============================================================================

class RecommendationService:
    """Core recommendation logic using FAISS and hybrid ranking."""
    
    @staticmethod
    def get_recommendations(
        user_id: str,
        k: int = FINAL_RECOMMENDATIONS
    ) -> RecommendationsResponse:
        """
        Generate personalized post recommendations for a user.
        
        Algorithm:
        1. Fetch user profile and interaction history from MongoDB
        2. Create query embedding from user's category preferences
        3. Search FAISS index for top-K similar posts
        4. Filter out already-interacted posts
        5. Rank using hybrid scoring (category + engagement + recency)
        6. Return top-N recommendations
        
        Args:
            user_id: User identifier
            k: Number of recommendations to return
            
        Returns:
            RecommendationsResponse with ranked recommendations
        """
        # Step 1: Fetch user data
        user = data_store.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        category_preferences = user.get('category_preferences', {})
        interaction_history = user.get('interaction_history', [])
        
        # Step 2: Build query from user preferences
        categories = list(category_preferences.keys())
        if not categories:
            # Fallback: use general query if user has no preferences
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
            query_embedding,
            min(TOP_K_CANDIDATES, data_store.faiss_index.ntotal)
        )
        
        # Step 5: Get already-viewed post IDs
        viewed_post_ids = set(
            interaction['post_id'] for interaction in interaction_history
        )
        
        # Step 6: Score and rank candidates
        candidates = []
        for idx, distance in zip(indices[0], distances[0]):
            if idx >= len(data_store.posts):
                continue
            
            post = data_store.posts[idx]
            post_id = post['_id']
            
            # Filter out already-viewed posts
            if post_id in viewed_post_ids:
                continue
            
            # Calculate hybrid score
            category = post.get('final_category', 'uncategorized')
            category_score = category_preferences.get(category, 0.0)
            engagement_score = post.get('engagement_score', 0.0)
            recency = post.get('recency_weight', 0.5)
            
            final_score = (
                CATEGORY_WEIGHT * category_score +
                ENGAGEMENT_WEIGHT * engagement_score +
                RECENCY_WEIGHT * recency
            )
            
            candidates.append({
                'post_id': post_id,
                'title': post.get('title', 'Untitled'),
                'category': category,
                'score': final_score,
                'engagement_score': engagement_score,
                'recency_weight': recency,
                'distance': float(distance)
            })
        
        # Step 7: Sort by score and take top-k
        candidates.sort(key=lambda x: x['score'], reverse=True)
        top_recommendations = candidates[:k]
        
        return RecommendationsResponse(
            user_id=user_id,
            timestamp=datetime.now().isoformat(),
            recommendations=[RecommendationResponse(**rec) for rec in top_recommendations],
            total_candidates=len(indices[0]),
            filtered_count=len(candidates)
        )

# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="Social Media Recommendation API",
    description="Personalized post recommendations using FAISS and hybrid ranking",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Lifecycle Events
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize data and FAISS index on application startup."""
    global post_encoding_worker, embedding_worker, background_monitor
    
    print("Starting recommendation service...")
    
    # Load data from MongoDB (seed from JSON if collections are empty)
    data_store.load_from_mongodb()
    
    # Load embedding model
    data_store.load_embedding_model()
    
    # Initialize workers
    post_encoding_worker = PostEncodingWorker(
        data_store,
        embedding_model=data_store.embedding_model
    )
    embedding_worker = EmbeddingWorker(
        embedding_model=data_store.embedding_model
    )
    
    # Load or create FAISS index
    data_store.faiss_index, data_store.post_embeddings = load_or_create_faiss_index(
        data_store.posts,
        data_store.embedding_model
    )
    
    # Initialize and start background monitor
    background_monitor = BackgroundPostMonitor(
        data_store=data_store,
        post_encoding_worker=post_encoding_worker,
        check_interval=10,  # Check every 10 seconds
        batch_size=5  # Encode up to 5 posts per check
    )
    background_monitor.start()
    
    print("Service ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    global background_monitor
    
    # Stop background monitor
    if background_monitor is not None:
        await background_monitor.stop()
    
    data_store.close()
    print("Shutting down recommendation service...")

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", response_model=Dict[str, Any])
async def root():
    """Root endpoint with API information."""
    return {
        "service": "Social Media Recommendation API",
        "version": "1.0.0",
        "endpoints": {
            "recommendations": "/recommendations?user_id=<user_id>",
            "health": "/health",
            "posts": "/posts",
            "users": "/users"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        posts_loaded=len(data_store.posts),
        users_loaded=len(data_store.users),
        faiss_index_size=data_store.faiss_index.ntotal if data_store.faiss_index else 0
    )

@app.get("/posts", response_model=List[Dict[str, Any]])
async def get_all_posts():
    """Return all posts currently loaded in memory."""
    return data_store.posts

@app.get("/users", response_model=List[Dict[str, Any]])
async def get_all_users():
    """Return all users currently loaded in memory."""
    return data_store.users

@app.post("/posts", response_model=PostResponse)
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

@app.get("/recommendations", response_model=RecommendationsResponse)
async def get_recommendations(
    user_id: str = Query(..., description="User ID to get recommendations for"),
    k: int = Query(FINAL_RECOMMENDATIONS, ge=1, le=50, description="Number of recommendations")
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
    return RecommendationService.get_recommendations(user_id, k)

# ============================================================================
# Development Server
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
