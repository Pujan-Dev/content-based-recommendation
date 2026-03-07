"""
Data Service for MongoDB operations and in-memory caching.
"""

from typing import Dict, Any, List, Optional
import json
from datetime import datetime, timedelta
import random
from pymongo import MongoClient
from bson import ObjectId
from sentence_transformers import SentenceTransformer
import faiss
from pathlib import Path

from config import (
    MONGODB_URI,
    MONGODB_DATABASE,
    MONGODB_POSTS_COLLECTION,
    MONGODB_USERS_COLLECTION,
    POSTS_FILE,
    USERS_FILE,
    EMBEDDING_MODEL_DIR,
    EMBEDDING_MODEL_NAME,
)


class DataStore:
    """
    In-memory data store for posts and users.
    Integrates with MongoDB for persistence.
    """

    def __init__(self):
        self.posts: List[Dict[str, Any]] = []
        self.users: List[Dict[str, Any]] = []
        self.posts_by_id: Dict[str, Dict[str, Any]] = {}
        self.users_by_id: Dict[str, Dict[str, Any]] = {}
        self.faiss_index: Optional[faiss.IndexFlatL2] = None
        self.post_embeddings: Optional[object] = None
        self.embedding_model: Optional[SentenceTransformer] = None
        self.mongo_client: Optional[MongoClient] = None
        self.mongo_db = None
        self.posts_collection = None
        self.users_collection = None
        self.using_mongodb = False

    def connect_mongodb(self):
        """Connect to MongoDB and initialize collections."""
        if self.mongo_client is not None:
            return

        try:
            self.mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            self.mongo_client.admin.command("ping")

            db_name = MONGODB_DATABASE
            if not db_name:
                default_db = self.mongo_client.get_default_database()
                db_name = default_db.name if default_db is not None else None
            if not db_name:
                db_name = "social_media"

            self.mongo_db = self.mongo_client[db_name]
            self.posts_collection = self.mongo_db[MONGODB_POSTS_COLLECTION]
            self.users_collection = self.mongo_db[MONGODB_USERS_COLLECTION]
            self.using_mongodb = True
            print(f"Connected to MongoDB: {db_name}")
        except Exception as e:
            print(f"MongoDB connection failed: {e}")
            print("Falling back to JSON file mode")
            self.using_mongodb = False
            self.mongo_client = None

    def bootstrap_mongodb_if_empty(self):
        """Seed MongoDB from JSON files when collections are empty."""
        posts_count = self.posts_collection.count_documents({})
        users_count = self.users_collection.count_documents({})

        if posts_count > 0 and users_count > 0:
            print(f"MongoDB has data: posts={posts_count}, users={users_count}")
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
                raw_id = post.get("_id") or post.get("id")
                if not raw_id:
                    continue

                if isinstance(raw_id, str) and len(raw_id) == 24:
                    mongo_id = ObjectId(raw_id)
                else:
                    mongo_id = ObjectId()

                created_utc = post.get("createdUtc") or post.get("created_at") or datetime.now().isoformat() + "Z"
                num_comments = post.get("numComments", post.get("comments", 0))

                normalized_post = {
                    "_id": mongo_id,
                    "postId": str(mongo_id),
                    "title": post.get("title", ""),
                    "body": post.get("body", ""),
                    "subreddit": post.get("subreddit", "general"),
                    "category": post.get("category", "uncategorized"),
                    "score": post.get("score", 0),
                    "numComments": num_comments,
                    "createdUtc": created_utc,
                    "engagementScore": post.get("engagementScore", 0),
                    "wordCount": post.get("wordCount", 0),
                    "postLength": post.get("postLength", 0),
                    "recencyWeight": post.get("recencyWeight", 0),
                    "hourPosted": post.get("hourPosted", 0),
                    "dayOfWeek": post.get("dayOfWeek", 0),
                    "image": post.get("image", None),
                    "likes": post.get("likes", []),
                    "dislikes": post.get("dislikes", []),
                    "likesCount": post.get("likesCount", 0),
                    "dislikesCount": post.get("dislikesCount", 0),
                    "embedding": post.get("embedding", []),
                }

                self.posts_collection.replace_one({"_id": normalized_post["_id"]}, normalized_post, upsert=True)
            print(f"Loaded posts into MongoDB: {len(json_posts)}")

        if users_count == 0 and json_users:
            for user in json_users:
                name = user.get("name") or user.get("username") or f"user_{random.randint(1000,9999)}"
                email = user.get("email") or f"{name}@example.com"

                normalized_user = {
                    "name": name,
                    "email": email,
                    "password": user.get("password", "temp_password"),
                    "role": user.get("role", "user"),
                    "selectedCategory": user.get("selectedCategory"),
                    "categoryScore": user.get("categoryScore", {}),
                    "viewHistory": user.get("viewHistory", []),
                    "likedPosts": user.get("likedPosts", []),
                    "dislikedPosts": user.get("dislikedPosts", []),
                }

                self.users_collection.replace_one({"email": email}, normalized_user, upsert=True)
            print(f"Loaded users into MongoDB: {len(json_users)}")

    def load_from_mongodb(self):
        """Load posts/users from MongoDB into in-memory caches or use JSON files."""
        self.connect_mongodb()
        
        if not self.using_mongodb:
            print("Loading data from JSON files...")
            self.load_from_json()
            return
        
        self.bootstrap_mongodb_if_empty()

        self.posts = list(
            self.posts_collection.find(
                {},
                {
                    "_id": 1,
                    "postId": 1,
                    "id": 1,
                    "title": 1,
                    "body": 1,
                    "subreddit": 1,
                    "category": 1,
                    "score": 1,
                    "numComments": 1,
                    "comments": 1,
                    "createdUtc": 1,
                    "created_at": 1,
                    "engagementScore": 1,
                    "wordCount": 1,
                    "postLength": 1,
                    "recencyWeight": 1,
                    "hourPosted": 1,
                    "dayOfWeek": 1,
                    "embedding": 1,
                },
            )
        )
        self.users = list(
            self.users_collection.find(
                {},
                {
                    "_id": 1,
                    "user_id": 1,
                    "username": 1,
                    "email": 1,
                    "selectedCategory": 1,
                    "categoryScore": 1,
                    "viewHistory": 1,
                    "preferences": 1,
                    "interactions": 1,
                },
            )
        )

        for post in self.posts:
            post["_id"] = str(post.get("_id"))
            post["postId"] = post.get("postId") or post.get("_id")
            post["numComments"] = post.get("numComments", post.get("comments", 0))
            post["comments"] = post["numComments"]
            post["createdUtc"] = post.get("createdUtc") or post.get("created_at")
            post["created_at"] = post.get("created_at") or post.get("createdUtc")
            post["likes"] = [str(item) for item in post.get("likes", [])]
            post["dislikes"] = [str(item) for item in post.get("dislikes", [])]
            post["likesCount"] = post.get("likesCount", len(post["likes"]))
            post["dislikesCount"] = post.get("dislikesCount", len(post["dislikes"]))

        for user in self.users:
            user_id = user.get("user_id") or str(user.get("_id"))
            user["user_id"] = user_id

            if not user.get("preferences"):
                selected = user.get("selectedCategory")
                top_categories = []

                category_score = user.get("categoryScore", {})
                if isinstance(category_score, dict) and category_score:
                    sorted_categories = sorted(
                        category_score.items(),
                        key=lambda item: item[1],
                        reverse=True,
                    )
                    top_categories = [cat for cat, score in sorted_categories if score > 0][:5]

                if not top_categories and selected:
                    top_categories = [selected]

                user["preferences"] = {"categories": top_categories}

            if not user.get("interactions") and user.get("viewHistory"):
                interactions = []
                for item in user.get("viewHistory", []):
                    interactions.append(
                        {
                            "post_id": str(item.get("postId")),
                            "category": item.get("category", ""),
                            "action": "view",
                            "dwell_time": item.get("dwellTime", 0),
                            "timestamp": item.get("viewedAt"),
                        }
                    )
                user["interactions"] = interactions

        self.posts_by_id = {str(p.get("_id")): p for p in self.posts if p.get("_id") is not None}
        self.posts_by_id.update({str(p.get("postId")): p for p in self.posts if p.get("postId") is not None})
        self.users_by_id = {u["user_id"]: u for u in self.users if u.get("user_id")}

        print(f"Loaded {len(self.posts)} posts from MongoDB")
        print(f"Loaded {len(self.users)} users from MongoDB")

    def ensure_data_exists(self):
        """Auto-populate database if empty."""
        posts_missing = (not POSTS_FILE.exists()) or POSTS_FILE.stat().st_size < 10
        users_missing = (not USERS_FILE.exists()) or USERS_FILE.stat().st_size < 10

        if posts_missing or users_missing:
            print("Database is empty. Generating sample data...")
            self._generate_sample_data()

    def _generate_sample_data(self):
        """Generate sample posts and users if database is empty."""
        categories = [
            "technology",
            "gaming",
            "relationships",
            "food_cooking",
            "health_fitness",
            "career_jobs",
            "education",
        ]

        sample_posts = []
        for i in range(1, 21):
            category = random.choice(categories)
            sample_posts.append(
                {
                    "_id": f"post_{i:03d}",
                    "id": f"post_{i:03d}",
                    "title": f"Sample {category} post #{i}",
                    "body": f"This is a sample post about {category}. It contains interesting information.",
                    "category": category,
                    "score": random.randint(10, 500),
                    "comments": random.randint(5, 100),
                    "created_at": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat(),
                }
            )

        sample_users = [
            {
                "user_id": "user_001",
                "username": "demo_user_1",
                "preferences": {"categories": ["technology", "gaming", "education"]},
                "interactions": [],
            },
            {
                "user_id": "user_002",
                "username": "demo_user_2",
                "preferences": {"categories": ["health_fitness", "food_cooking", "relationships"]},
                "interactions": [],
            },
        ]

        POSTS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(POSTS_FILE, "w") as f:
            json.dump(sample_posts, f, indent=2)
        with open(USERS_FILE, "w") as f:
            json.dump(sample_users, f, indent=2)

        print(f"Generated {len(sample_posts)} sample posts and {len(sample_users)} users")

    def load_from_json(self):
        """Load posts and users from JSON files."""
        self.ensure_data_exists()
        
        if POSTS_FILE.exists():
            with open(POSTS_FILE, 'r') as f:
                self.posts = json.load(f)
                for post in self.posts:
                    post["_id"] = str(post.get("_id"))
                    post["postId"] = post.get("postId") or post.get("_id")
                    post["numComments"] = post.get("numComments", post.get("comments", 0))
                    post["comments"] = post["numComments"]
                    post["createdUtc"] = post.get("createdUtc") or post.get("created_at")
                    post["created_at"] = post.get("created_at") or post.get("createdUtc")

                self.posts_by_id = {str(p.get("_id")): p for p in self.posts}
                self.posts_by_id.update({str(p.get("postId")): p for p in self.posts if p.get("postId") is not None})
                print(f"Loaded {len(self.posts)} posts from {POSTS_FILE.name}")
        else:
            raise FileNotFoundError(f"Posts file not found: {POSTS_FILE}")
        
        if USERS_FILE.exists():
            with open(USERS_FILE, 'r') as f:
                self.users = json.load(f)
                for user in self.users:
                    user_id = user.get("user_id") or str(user.get("_id"))
                    user["user_id"] = user_id
                    user.setdefault("preferences", {"categories": []})
                    user.setdefault("interactions", [])

                self.users_by_id = {u.get('user_id'): u for u in self.users if u.get("user_id")}
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
                print(f"Downloading {EMBEDDING_MODEL_NAME} model...")
                self.embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
            print("Embedding model loaded")
        return self.embedding_model

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch user by ID from in-memory cache."""
        return self.users_by_id.get(user_id)

    def get_post(self, post_id: str) -> Optional[Dict[str, Any]]:
        """Fetch post by ID from in-memory cache."""
        return self.posts_by_id.get(post_id)

    def close(self):
        """Close MongoDB connection."""
        if self.mongo_client is not None:
            self.mongo_client.close()
            self.mongo_client = None
