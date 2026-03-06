# Personalized Social Media Feed — Backend API

A personalized content recommendation backend built with Node.js, Express, and TypeScript. Uses MongoDB for data persistence and integrates with a Python FastAPI ML model (FAISS vector search) for personalized post recommendations.

---

## Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **MongoDB Atlas** + **Mongoose**
- **JWT** + **bcrypt** (authentication)
- **Multer** (image uploads)
- **Swagger UI** (API documentation)
- **FastAPI ML Model** (FAISS vector similarity search)

---

## Project Structure

```
src/
├── Controller/
│   └── controller.ts       # all route handlers
├── Middleware/
│   ├── multer.ts            # image upload middleware
│   └── tokens.ts            # JWT protect middleware
├── Model/
│   ├── user.ts              # user schema
│   └── postschema.ts        # post schema
├── Router/
│   └── router.ts            # all routes + swagger docs
└── Config/
    └── database.ts          # MongoDB connection
```

---

## Environment Variables

Create a `.env` file in the root:

```dotenv
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.py9yfev.mongodb.net/social_media?appName=Cluster0
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

---

## Installation

```bash
npm install
npm run dev
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/backend/signup` | Register new user |
| POST | `/backend/login` | Login user |
| POST | `/backend/logout` | Logout user |
| POST | `/backend/category` | Save selected category |

### Feed

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/backend/home?page=1&limit=10` | Get personalized feed |

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/backend/post` | Create new post (multipart/form-data) |
| POST | `/backend/post/:postId/like` | Like or unlike a post |
| POST | `/backend/post/:postId/dislike` | Dislike or remove dislike |

### Interactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/backend/track` | Track post view with dwell time |

---

## How the Feed Works

### New User
```
signup → select category → GET /home
  → posts from selected category only
```

### Returning User
```
GET /home
  → mergedScore = categoryScore + liked posts - disliked posts
  → top 3 categories selected
  → posts fetched and sorted by recencyWeight + engagementScore
```

### With ML Model
```
GET /home
  → GET /recommendations?user_id=xxx&k=10
  → ML returns recommendedPostIds[]
  → posts fetched from MongoDB by postIds
  → fallback to mergedScore if ML unavailable
```

---

## MongoDB Collections

### `users`
Stores auth data, engagement scores, and interaction history.

```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "password": "hashed",
  "selectedCategory": "science",
  "categoryScore": { "science": 10, "technology": 6 },
  "likedPosts": ["ObjectId"],
  "dislikedPosts": ["ObjectId"],
  "viewHistory": [{ "postId": "ObjectId", "category": "string", "dwellTime": 300, "viewedAt": "Date" }]
}
```

### `posts`
Stores post content and ML features.

```json
{
  "_id": "ObjectId",
  "postId": "string",
  "title": "string",
  "body": "string",
  "category": "string",
  "subreddit": "string",
  "score": 9,
  "numComments": 2,
  "engagementScore": 0.9,
  "recencyWeight": 0.4,
  "wordCount": 136,
  "postLength": 476,
  "hourPosted": 9,
  "dayOfWeek": 3,
  "image": "url or null",
  "likes": ["userId"],
  "dislikes": ["userId"],
  "likesCount": 0,
  "dislikesCount": 0
}
```

---

## Scoring Logic

```
Like post        → categoryScore[category] += 2
Unlike post      → remove from likedPosts
Dislike post     → add to dislikedPosts
View post        → categoryScore[category] += 1, save dwellTime

mergedScore (feed generation):
  categoryScore + liked posts (+1 each) - disliked posts (-1 each)
  filter negative scores
  top 3 categories → fetch posts
```

---

## Swagger Docs

```
http://localhost:5000/api-docs
```

---

## ML Model Integration

The ML model runs separately on `http://localhost:8000`.

```
GET  /health
GET  /recommendations?user_id=<id>&k=10
```

Set the ML model `.env`:

```dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.py9yfev.mongodb.net/social_media
MONGODB_DATABASE=social_media
MONGODB_POSTS_COLLECTION=posts
MONGODB_USERS_COLLECTION=ml_users
API_PORT=8000
EMBEDDING_DIMENSION=384
TOP_K_CANDIDATES=30
FINAL_RECOMMENDATIONS=10
CATEGORY_WEIGHT=0.5
ENGAGEMENT_WEIGHT=0.3
RECENCY_WEIGHT=0.2
```

Run ML model with Docker:

```bash
docker build -t fastapi-ml .
docker run -p 8000:8000 --env-file .env fastapi-ml
```

---

## Running Locally

```bash
# Terminal 1 — backend
npm run dev        # http://localhost:5000

# Terminal 2 — ML model
docker run -p 8000:8000 --env-file .env fastapi-ml   # http://localhost:8000
```
