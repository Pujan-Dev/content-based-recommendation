"""
Worker module for post encoding and auto-embedding generation.

This module provides background/batch workers for:
- Auto-encoding new posts with embeddings
- Batch embedding generation
- FAISS index updates
- Background monitoring for new/unencoded posts
"""

from typing import Dict, Any, List
from datetime import datetime
import numpy as np
import asyncio
from bson import ObjectId
from sentence_transformers import SentenceTransformer


class PostEncodingWorker:
    """Worker for encoding and processing new posts."""
    
    def __init__(self, data_store, embedding_model: SentenceTransformer = None):
        """
        Initialize the worker.
        
        Args:
            data_store: DataStore instance with MongoDB connections
            embedding_model: Pre-loaded SentenceTransformer model
        """
        self.data_store = data_store
        self.embedding_model = embedding_model
    
    def encode_text(self, text: str) -> List[float]:
        """
        Generate embedding for text.
        
        Args:
            text: Text to encode
            
        Returns:
            Normalized embedding vector as list
        """
        if self.embedding_model is None:
            self.embedding_model = self.data_store.load_embedding_model()
        
        embedding = self.embedding_model.encode(
            [text],
            convert_to_numpy=True,
            normalize_embeddings=True
        )[0].tolist()
        
        return embedding
    
    def create_post_with_encoding(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new post with auto-generated embedding.
        
        Worker steps:
        1. Validate post data
        2. Generate unique post ID
        3. Create encoding text from title + body
        4. Generate embedding using SentenceTransformer
        5. Create complete post document
        6. Save to MongoDB
        7. Update in-memory cache
        8. Update FAISS index
        
        Args:
            post_data: Dictionary with title, body, category, score, comments
            
        Returns:
            Complete post document with embedding
            
        Raises:
            ValueError: If required fields are missing
        """
        # Validate required fields
        required_fields = ["title", "body", "category"]
        for field in required_fields:
            if field not in post_data or not post_data[field]:
                raise ValueError(f"Missing or empty required field: {field}")
        
        # Generate Mongo ObjectId and backend-style postId
        mongo_id = ObjectId()
        post_id = str(mongo_id)
        
        # Create encoding text (title + body)
        text_to_encode = f"{post_data['title']} {post_data['body']}"
        
        # Generate embedding
        embedding = self.encode_text(text_to_encode)
        
        # Create complete document
        now_iso = datetime.now().isoformat() + "Z"
        num_comments = post_data.get("numComments", post_data.get("comments", 0))
        created_utc = post_data.get("createdUtc", post_data.get("created_at", now_iso))

        post_document = {
            "_id": mongo_id,
            "postId": post_id,
            "title": post_data["title"],
            "body": post_data["body"],
            "subreddit": post_data.get("subreddit", "general"),
            "category": post_data["category"],
            "score": post_data.get("score", 0),
            "numComments": num_comments,
            "comments": num_comments,
            "createdUtc": created_utc,
            "created_at": created_utc,
            "engagementScore": post_data.get("engagementScore", 0.0),
            "wordCount": post_data.get("wordCount", 0),
            "postLength": post_data.get("postLength", 0),
            "recencyWeight": post_data.get("recencyWeight", 0.0),
            "hourPosted": post_data.get("hourPosted", 0),
            "dayOfWeek": post_data.get("dayOfWeek", 0),
            "image": post_data.get("image", None),
            "likes": [],
            "dislikes": [],
            "likesCount": 0,
            "dislikesCount": 0,
            "embedding": embedding
        }
        
        self.data_store.posts_collection.insert_one(post_document)
        print(f"Encoded post: {post_id} ({post_data['title'][:40]}...)")
        
        cache_document = {**post_document, "_id": str(post_document["_id"])}
        self.data_store.posts.append(cache_document)
        self.data_store.posts_by_id[post_id] = cache_document
        
        if self.data_store.faiss_index is not None:
            embedding_vector = np.array([embedding], dtype='float32')
            self.data_store.faiss_index.add(embedding_vector)
        
        return cache_document
    
    def batch_encode_posts(self, posts_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Batch encode multiple posts at once.
        
        Args:
            posts_data: List of post dictionaries
            
        Returns:
            List of encoded post documents
        """
        encoded_posts = []
        
        print(f"Starting batch encoding of {len(posts_data)} posts...")
        
        for i, post_data in enumerate(posts_data, 1):
            try:
                encoded_post = self.create_post_with_encoding(post_data)
                encoded_posts.append(encoded_post)
                print(f"[{i}/{len(posts_data)}] Encoded")
            except ValueError as e:
                print(f"[{i}/{len(posts_data)}] Error: {e}")
                continue
        
        print(f"Batch encoding done: {len(encoded_posts)}/{len(posts_data)} encoded")
        
        return encoded_posts
    
    def update_post_embedding(self, post_id: str, new_text: str) -> Dict[str, Any]:
        """
        Re-encode an existing post with new text.
        
        Args:
            post_id: ID of post to update
            new_text: New text to encode
            
        Returns:
            Updated post document
            
        Raises:
            ValueError: If post not found
        """
        post = self.data_store.get_post(post_id)
        if not post:
            raise ValueError(f"Post {post_id} not found")
        
        new_embedding = self.encode_text(new_text)
        
        self.data_store.posts_collection.update_one(
            {"postId": post_id},
            {"$set": {"embedding": new_embedding}}
        )
        
        post["embedding"] = new_embedding
        self.data_store.posts_by_id[post_id] = post
        
        print(f"Updated embedding for post: {post_id}")
        
        return post


class EmbeddingWorker:
    """Worker for embedding operations."""
    
    def __init__(self, embedding_model: SentenceTransformer):
        """
        Initialize embedding worker.
        
        Args:
            embedding_model: Pre-loaded SentenceTransformer model
        """
        self.embedding_model = embedding_model
    
    def encode_batch(self, texts: List[str], normalize: bool = True) -> np.ndarray:
        """
        Encode multiple texts in batch.
        
        Args:
            texts: List of texts to encode
            normalize: Whether to normalize embeddings
            
        Returns:
            numpy array of embeddings (shape: [n_texts, embedding_dim])
        """
        embeddings = self.embedding_model.encode(
            texts,
            batch_size=32,
            show_progress_bar=True,
            convert_to_numpy=True,
            normalize_embeddings=normalize
        )
        
        return embeddings.astype('float32')
    
    def compute_similarity(self, embedding1, embedding2) -> float:
        """
        Compute cosine similarity between two embeddings.
        
        Args:
            embedding1: First embedding
            embedding2: Second embedding
            
        Returns:
            Similarity score (0-1)
        """
        # Convert to numpy if needed
        e1 = np.array(embedding1) if not isinstance(embedding1, np.ndarray) else embedding1
        e2 = np.array(embedding2) if not isinstance(embedding2, np.ndarray) else embedding2
        
        # Compute cosine similarity
        similarity = np.dot(e1, e2) / (np.linalg.norm(e1) * np.linalg.norm(e2))
        
        return float(similarity)


class BackgroundPostMonitor:
    """Background worker that monitors and auto-encodes new posts."""
    
    def __init__(
        self,
        data_store,
        post_encoding_worker: PostEncodingWorker,
        check_interval: int = 10,
        batch_size: int = 5
    ):
        """
        Initialize background monitor.
        
        Args:
            data_store: DataStore instance
            post_encoding_worker: PostEncodingWorker instance
            check_interval: Seconds between checks (default: 10)
            batch_size: Max posts to encode per check (default: 5)
        """
        self.data_store = data_store
        self.post_encoding_worker = post_encoding_worker
        self.check_interval = check_interval
        self.batch_size = batch_size
        self.is_running = False
        self.task = None
        self.encoded_count = 0
        self.last_check = None
    
    def find_unencoded_posts(self) -> List[Dict[str, Any]]:
        """
        Find posts from MongoDB that don't have embeddings.
        
        Returns:
            List of posts without embeddings
        """
        try:
            # Query MongoDB for posts without embeddings or with empty embeddings
            unencoded_posts = list(
                self.data_store.posts_collection.find({
                    "$or": [
                        {"embedding": {"$exists": False}},
                        {"embedding": {"$eq": []}},
                        {"embedding": None}
                    ]
                }).limit(self.batch_size)
            )
            
            return unencoded_posts
        except Exception as e:
            print(f"Error querying unencoded posts: {e}")
            return []
    
    async def monitor_and_encode(self):
        """
        Background task: Check for new posts and auto-encode them.
        
        This runs continuously:
        1. Every check_interval seconds
        2. Finds unencoded posts in MongoDB
        3. Encodes them with embeddings
        4. Saves to database and FAISS index
        5. Updates in-memory cache
        """
        self.is_running = True
        print(f"Background monitor started (checking every {self.check_interval}s)")
        
        while self.is_running:
            try:
                self.last_check = datetime.now()
                unencoded_posts = self.find_unencoded_posts()
                
                if unencoded_posts:
                    print(f"Found {len(unencoded_posts)} unencoded posts. Encoding...")
                    
                    for post in unencoded_posts:
                        try:
                            if post.get("embedding"):
                                continue
                            
                            post_data = {
                                "title": post.get("title", ""),
                                "body": post.get("body", ""),
                                "category": post.get("category", ""),
                                "score": post.get("score", 0),
                                "numComments": post.get("numComments", post.get("comments", 0)),
                            }
                            
                            text_to_encode = f"{post_data['title']} {post_data['body']}"
                            embedding = self.post_encoding_worker.encode_text(text_to_encode)
                            
                            self.data_store.posts_collection.update_one(
                                {"_id": post["_id"]},
                                {"$set": {"embedding": embedding}}
                            )
                            
                            post["embedding"] = embedding
                            post_key = str(post.get("postId") or post.get("_id"))
                            post["_id"] = str(post.get("_id"))
                            self.data_store.posts_by_id[post_key] = post
                            
                            if self.data_store.faiss_index is not None:
                                embedding_vector = np.array([embedding], dtype='float32')
                                self.data_store.faiss_index.add(embedding_vector)
                            
                            self.encoded_count += 1
                            print(f"Encoded: {post['_id']} ({post.get('title', '')[:40]}...)")
                        
                        except Exception as e:
                            print(f"Error encoding {post.get('_id')}: {e}")
                            continue
                    
                    print(f"Batch complete. Total encoded: {self.encoded_count}")
                
                # Wait before next check
                await asyncio.sleep(self.check_interval)
            
            except Exception as e:
                print(f"Monitor error: {e}")
                await asyncio.sleep(self.check_interval)
    
    def start(self):
        """Start the background monitoring task."""
        if self.task is None:
            self.task = asyncio.create_task(self.monitor_and_encode())
    
    async def stop(self):
        """Stop the background monitoring task."""
        self.is_running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        print(f"Background monitor stopped. Total encoded: {self.encoded_count}")

