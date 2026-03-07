

# Social Media Recommendation System

### Architecture + ML Pipeline + Backend Design

**Last Updated:** March 7, 2026

---

# 1. System Architecture

The system follows a **microservice-style architecture** separating the web application logic from the ML recommendation engine.

```
                     ┌─────────────────────┐
                     │     React Frontend   │
                     │  (User Interface)    │
                     └──────────┬───────────┘
                                │
                                │ HTTP API
                                ▼
                     ┌─────────────────────┐
                     │  Express API Gateway │
                     │    (Node.js)         │
                     │  Auth + Routing      │
                     └──────────┬───────────┘
                                │
                                │ Internal API
                                ▼
                 ┌──────────────────────────────┐
                 │    FastAPI Recommendation     │
                 │           Engine              │
                 │                               │
                 │  • Recommendation Service     │
                 │  • Embedding Service          │
                 │  • Data Service               │
                 │  • Background Workers         │
                 └──────────┬───────────┬────────┘
                            │           │
                            │           │
                            ▼           ▼
                     ┌──────────┐  ┌────────────┐
                     │ MongoDB  │  │   FAISS    │
                     │ Database │  │ Vector DB  │
                     └──────────┘  └────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │Embedding Model│
                     │SentenceTransformer│
                     └──────────────┘
```

---

# 2. ML Pipeline Architecture

The ML pipeline is responsible for converting text posts into **vector embeddings** and enabling **semantic recommendation search**.

---

# 2.1 Embedding Generation Pipeline

Each post is transformed into a **dense vector representation**.

```
Post Title + Post Body
        │
        ▼
Text Preprocessing
- lowercase normalization
- token cleanup
- text merge
        │
        ▼
SentenceTransformer Model
(paraphrase-MiniLM-L3-v2)
        │
        ▼
384 Dimensional Vector
        │
        ▼
L2 Normalization
        │
        ▼
Embedding Vector
```

### Model Properties

| Property       | Value                   |
| -------------- | ----------------------- |
| Model          | paraphrase-MiniLM-L3-v2 |
| Architecture   | MiniLM (distilled BERT) |
| Embedding Size | 384                     |
| Training       | Semantic similarity     |
| Inference      | CPU/GPU supported       |

---

# 2.2 Vector Index Construction

All embeddings are stored inside a **FAISS similarity index**.

```
Generated Embeddings
      │
      ▼
FAISS IndexFlatL2
      │
      ▼
Vector Database
```

### FAISS Configuration

| Parameter       | Value          |
| --------------- | -------------- |
| Index Type      | IndexFlatL2    |
| Dimension       | 384            |
| Vectors         | 373,674        |
| Distance Metric | Euclidean (L2) |

This enables **fast nearest neighbor search** across all posts.

---

# 3. Recommendation ML Flow

The recommendation process combines:

* **Semantic similarity**
* **User preferences**
* **Post engagement**
* **Content recency**

---

## Step 1 — User Context Retrieval

User data is retrieved from MongoDB.

```
Fetch User
  │
  ├─ category preferences
  └─ viewed post history
```

Example:

```
user.preferences = ["technology", "science"]
user.interactions = viewed posts
```

---

## Step 2 — Query Embedding Creation

User preferences are converted into a **semantic query vector**.

```
User Preferences
    │
    ▼
Text Query Construction

"Posts about technology and science"
    │
    ▼
SentenceTransformer
    │
    ▼
Query Embedding (384D)
```

---

## Step 3 — Semantic Candidate Retrieval

FAISS performs nearest neighbor search.

```
Query Vector
    │
    ▼
FAISS Search
    │
    ▼
Top 30 Candidate Posts
```

Output:

```
[(post_id, distance)]
```

---

## Step 4 — Interaction Filtering

Posts already viewed by the user are removed.

```
Candidate Posts
     │
     ▼
Remove Viewed Posts
     │
     ▼
Filtered Candidates
```

---

## Step 5 — Hybrid Ranking

Each candidate receives a **hybrid recommendation score**.

### Components

---

### Category Preference Score

```
score = 1.0 - (preference_rank × 0.3)
```

Example:

| Preference | Score |
| ---------- | ----- |
| First      | 1.0   |
| Second     | 0.7   |
| Third      | 0.4   |

---

### Engagement Score

```
engagement =
log(1 + upvotes) +
log(1 + comments × 2)
```

Normalized:

```
engagement_score = min(engagement / 12, 1)
```

---

### Recency Score

```
days = current_time - post_time
recency = exp(-days / 7)
```

Decay behavior:

| Age     | Score |
| ------- | ----- |
| 0 days  | 1.0   |
| 7 days  | 0.37  |
| 30 days | 0.03  |

---

### Final Hybrid Score

```
score =
(Category × 0.5) +
(Engagement × 0.3) +
(Recency × 0.2)
```

Posts are sorted by descending score.

---

# 4. Backend Architecture

The backend consists of two main services.

---

# 4.1 API Gateway (Express)

The gateway manages:

* authentication
* routing
* user operations
* post CRUD operations

```
Client Request
      │
      ▼
Express Server
      │
      ├─ Auth routes
      ├─ Post routes
      └─ Recommendation routes
```

Express forwards recommendation requests to FastAPI.

---

# 4.2 Recommendation Engine (FastAPI)

FastAPI handles all **ML operations**.

```
FastAPI Application
│
├── Routers
│   ├── /health
│   ├── /recommendations
│   └── /posts
│
├── Services
│   ├── RecommendationService
│   ├── EmbeddingService
│   └── DataService
│
├── Workers
│   ├── PostEncodingWorker
│   └── BackgroundPostMonitor
│
└── ML Components
    ├── SentenceTransformer
    └── FAISS Index
```

---

# 4.3 Background Workers

Background workers handle asynchronous tasks.

---

### Post Encoding Worker

Generates embeddings for new posts.

```
New Post
   │
   ▼
Encode Text
   │
   ▼
Generate Embedding
   │
   ▼
Store in MongoDB
   │
   ▼
Update FAISS Index
```

---

### Background Post Monitor

Runs periodically to process unencoded posts.

```
Every 10 seconds
       │
       ▼
Query MongoDB
for posts without embeddings
       │
       ▼
Batch Encode (5 posts)
       │
       ▼
Update Index + DB
```

---

# 5. Data Architecture

---

## Posts Collection

```
{
  postId: string,
  title: string,
  body: string,
  category: string,
  subreddit: string,
  score: number,
  numComments: number,
  createdUtc: timestamp,
  embedding: [384 float values]
}
```

---

## Users Collection

```
{
  userId: string,
  username: string,
  preferences: {
    categories: []
  },
  interactions: [
    {
      post_id: string,
      action: "like" | "view",
      timestamp: datetime
    }
  ]
}
```

---

# 6. End-to-End Request Flow

```
User Opens Feed
      │
      ▼
Frontend Request
GET /recommendations
      │
      ▼
Express API Gateway
      │
      ▼
FastAPI Recommendation Engine
      │
      ▼
Fetch User Data (MongoDB)
      │
      ▼
Create Query Embedding
      │
      ▼
FAISS Semantic Search
      │
      ▼
Candidate Filtering
      │
      ▼
Hybrid Ranking
      │
      ▼
Top-K Posts Returned
      │
      ▼
Frontend Renders Feed
```

---

# 7. Performance Overview

| Operation            | Time     |
| -------------------- | -------- |
| Embedding Generation | ~10ms    |
| FAISS Search         | ~30ms    |
| Ranking              | ~20ms    |
| Total Recommendation | 50–150ms |
