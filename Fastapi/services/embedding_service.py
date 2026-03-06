"""
Embedding and FAISS Index Management Service.
"""

from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from pathlib import Path

from config import FAISS_INDEX_FILE


def create_embeddings_from_posts(
    posts: List[Dict[str, Any]], model: SentenceTransformer
) -> np.ndarray:
    """
    Generate embeddings for posts using SentenceTransformer.

    Args:
        posts: List of post dictionaries
        model: Pre-loaded SentenceTransformer model

    Returns:
        numpy array of embeddings (N x 384)
    """
    print(f"Generating embeddings for {len(posts)} posts...")

    texts = [f"{p.get('title', '')} {p.get('body', '')[:200]}" for p in posts]

    embeddings = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    print(f"Generated {len(embeddings)} embeddings (dimension: {embeddings.shape[1]})")
    return embeddings.astype("float32")


def load_or_create_faiss_index(
    posts: List[Dict[str, Any]], model: SentenceTransformer
) -> Tuple[faiss.IndexFlatL2, Optional[np.ndarray]]:
    """
    Load pre-computed FAISS index or create a new one.

    Args:
        posts: List of posts
        model: SentenceTransformer model

    Returns:
        (faiss_index, embeddings) tuple
    """
    if FAISS_INDEX_FILE.exists():
        try:
            print(f"Loading FAISS index from {FAISS_INDEX_FILE.name}...")
            faiss_index = faiss.read_index(str(FAISS_INDEX_FILE))
            print(f"Loaded FAISS index with {faiss_index.ntotal} vectors")

            if faiss_index.ntotal == len(posts):
                print("Index size matches current posts")
                return faiss_index, None

            print("Index size mismatch. Rebuilding...")

        except Exception as e:
            print(f"Could not load index: {e}")
            print("Creating new index...")

    print("Creating new FAISS index...")
    embeddings = create_embeddings_from_posts(posts, model)

    dimension = embeddings.shape[1]
    faiss_index = faiss.IndexFlatL2(dimension)
    faiss_index.add(embeddings)

    print(f"Created FAISS index with {faiss_index.ntotal} vectors")

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
    embedding = model.encode([query_text], convert_to_numpy=True, normalize_embeddings=True)

    return embedding.astype("float32")
