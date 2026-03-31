you can just import the files donot have to add .js/.ts at end

# Content-Based Recommendation System

A full-stack project for a personalized social media feed, featuring a Node.js/Express backend, a FastAPI-based recommendation engine, a React frontend, and a fine-tuned embedding model.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Backend (Node.js/Express)](#backend-nodejsexpress)
- [Recommendation API (FastAPI)](#recommendation-api-fastapi)
- [Frontend (React/Vite)](#frontend-reactvite)
- [Model & Data](#model--data)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Swagger & API Docs](#swagger--api-docs)
- [License](#license)

---

## Project Overview

This project delivers a personalized content recommendation platform, combining:

- **Backend**: User management, post CRUD, authentication, and API gateway.
- **FastAPI Service**: Content-based recommendations using embeddings and hybrid ranking.
- **Frontend**: Modern React SPA for user interaction.
- **Model**: Sentence-transformer-based embedding model for post similarity.

---

## Architecture

```mermaid
graph TD
	A[User] --> B[Frontend (React)]
	B --> C[Backend API (Node.js/Express)]
	C --> D[Database (MongoDB)]
	C --> E[Recommendation API (FastAPI)]
	E --> F[Embedding Model]
	E --> D
```

---

## Backend (Node.js/Express)

- **Tech Stack**: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Multer, Swagger.
- **Features**: User authentication, post CRUD, image uploads, API docs, integration with FastAPI for recommendations.
- **Location**: `Backend/`

### Run

```bash
cd Backend
npm install
npm run dev
```

- API Docs: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## Recommendation API (FastAPI)

- **Tech Stack**: FastAPI, Python, FAISS, Pydantic, CORS.
- **Features**: Embedding-based similarity search, hybrid ranking, health checks, async endpoints.
- **Location**: `Fastapi/`

### Run

```bash
cd Fastapi
pip install -r requirements.txt
uvicorn main:app --reload
```

- Ensure `embedding_model` and data files are in `Fastapi/data/`.

---

## Frontend (React/Vite)

- **Tech Stack**: React, Vite, Zustand, modern CSS.
- **Features**: User login, feed, post creation/editing, like/dislike, interest selection.
- **Location**: `Frontend/`

### Run

```bash
cd Frontend
npm install
npm run dev
```

---

## Model & Data

- **Embedding Model**: Sentence-transformers, fine-tuned for post similarity.
- **Data**: JSON files for posts and users, plus model weights.
- **Location**: `Fastapi/data/embedding_model/`, `Fastapi/data/posts.json`, `Fastapi/data/users.json`, `MODEL/`

---

## Setup & Installation

1. **Clone the repository**
2. **Install dependencies** for each component (see above).
3. **Configure environment variables** (see below).
4. **Download model/data** as described in `Fastapi/README.md`.

---

## Environment Variables

### Backend (`Backend/.env`)

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

---

## Swagger & API Docs

- **Backend API Docs**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **FastAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## License

MIT License 

