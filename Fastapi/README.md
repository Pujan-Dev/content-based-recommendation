# Social Media Recommendation API

FastAPI backend for text-based social media recommendation system using FAISS and hybrid ranking.

## Features

- **FAISS Similarity Search**: Fast nearest-neighbor search on 384-dimensional embeddings
- **Hybrid Ranking**: Combines category preferences, engagement score, and recency
- **MongoDB Integration Ready**: Currently uses JSON files for testing, easily switchable to MongoDB
- **Type-Safe**: Full type hints with Pydantic models
- **Production-Ready**: CORS support, health checks, async endpoints

## Architecture

```
User Request → Fetch User Data → Generate Query Embedding
    ↓
FAISS Search (Top 30 candidates) → Filter Viewed Posts
    ↓
Hybrid Scoring → Rank & Return Top 10
```

### Scoring Formula

```python
final_score = 0.5 * category_score + 0.3 * engagement_score + 0.2 * recency_weight
```

## Installation

1. Install dependencies:
```bash
cd Fastapi
pip install -r requirements.txt
```

2. Ensure data files exist:
```bash
# posts.json and users.json should be in ../MODEL/
ls ../MODEL/posts.json
ls ../MODEL/users.json
```

3. Run the server:
```bash
python main.py
# or
uvicorn main:app --reload --port 8000
```

## API Endpoints

### GET /

Root endpoint with API information.

**Response:**
```json
{
  "service": "Social Media Recommendation API",
  "version": "1.0.0",
  "endpoints": {
    "recommendations": "/recommendations?user_id=<user_id>",
    "health": "/health"
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "posts_loaded": 50,
  "users_loaded": 2,
  "faiss_index_size": 50
}
```

### GET /recommendations

Get personalized recommendations for a user.

**Parameters:**
- `user_id` (required): User identifier
- `k` (optional): Number of recommendations (default: 10, max: 50)

**Example Request:**
```bash
curl "http://localhost:8000/recommendations?user_id=user_001&k=10"
```

**Example Response:**
```json
{
  "user_id": "user_001",
  "timestamp": "2026-03-05T15:30:00.000000",
  "recommendations": [
    {
      "post_id": "post_042",
      "title": "New Python library for machine learning released",
      "category": "technology",
      "score": 2.15,
      "engagement_score": 15.3,
      "recency_weight": 0.85,
      "distance": 18.234
    }
  ],
  "total_candidates": 30,
  "filtered_count": 25
}
```

## Testing with cURL

### Test User 1 (tech_gamer_2026)
```bash
curl "http://localhost:8000/recommendations?user_id=user_001&k=5"
```

### Test User 2 (wellness_chef_2026)
```bash
curl "http://localhost:8000/recommendations?user_id=user_002&k=5"
```

### Health Check
```bash
curl "http://localhost:8000/health"
```

## MongoDB Integration (Production)

To switch from JSON files to MongoDB:

1. Replace `DataStore.load_from_json()` with MongoDB connection:

```python
from motor.motor_asyncio import AsyncIOMotorClient

class DataStore:
    def __init__(self):
        self.mongo_client = AsyncIOMotorClient("mongodb://localhost:27017")
        self.db = self.mongo_client.social_media
        self.posts_collection = self.db.posts
        self.users_collection = self.db.users
    
    async def get_user(self, user_id: str):
        return await self.users_collection.find_one({"user_id": user_id})
    
    async def get_all_posts(self):
        return await self.posts_collection.find().to_list(length=None)
```

2. Load embeddings from MongoDB:

```python
# Assuming posts have a 'embedding' field (384-dim array)
posts = await data_store.get_all_posts()
embeddings = np.array([p['embedding'] for p in posts], dtype='float32')
```

## Configuration

Edit these constants in `main.py`:

```python
EMBEDDING_DIMENSION = 384
TOP_K_CANDIDATES = 30
FINAL_RECOMMENDATIONS = 10

CATEGORY_WEIGHT = 0.5
ENGAGEMENT_WEIGHT = 0.3
RECENCY_WEIGHT = 0.2
```

## Data Format

### Posts Collection (MongoDB)
```json
{
  "_id": "post_001",
  "title": "Post title",
  "body": "Post content...",
  "final_category": "technology",
  "score": 120,
  "engagement_score": 12.0,
  "recency_weight": 0.95,
  "created_utc": "2026-03-05T10:00:00",
  "embedding": [0.123, 0.456, ...] // 384-dim array
}
```

### Users Collection (MongoDB)
```json
{
  "_id": "user_001",
  "user_id": "user_001",
  "username": "tech_gamer_2026",
  "category_preferences": {
    "technology": 3.5,
    "gaming": 2.8
  },
  "interaction_history": [
    {
      "post_id": "post_042",
      "action": "upvote",
      "timestamp": "2026-03-05T14:30:00"
    }
  ]
}
```

## Performance

- **Startup Time**: ~2-3 seconds (loading 50 posts + embeddings)
- **Query Time**: ~10-50ms per recommendation request
- **Memory**: ~100MB for 50 posts with embeddings

## Error Handling

- `404`: User not found
- `500`: FAISS index not initialized
- `422`: Invalid query parameters

## Development

Run with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

View API docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

MIT
