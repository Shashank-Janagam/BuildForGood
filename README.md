# BuildForGood

BuildForGood is an AI-assisted social entrepreneurship platform where founders can validate ideas, run simulated user discovery, make operational decisions, recruit co-founders, and share progress with a community feed.

## Live Demo

- **Frontend (hosted):** https://build-for-good.vercel.app/

## Project Structure

```text
BuildForGood/
├── Frontend/BuildForGood   # React + TypeScript + Vite client app
└── Backend                 # Node.js + Express + MongoDB API
```

## Core Features

- **Authentication & profile management** (signup, login, profile update).
- **Founder simulation flow** with AI-generated personas and interview chat.
- **Round evaluation** to score founder discovery quality.
- **Operational scenario simulation** with budget/trust/impact trade-offs.
- **AI co-founder matching** and co-founder marketplace endpoints.
- **Community posts and comments** for sharing simulation outcomes.
- **Compliance guidance generation** for India-focused social ventures.

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Groq SDK (LLM-powered generation)

## Local Development Setup

## 1) Clone and install dependencies

From the project root:

```bash
# Frontend
cd Frontend/BuildForGood
npm install

# Backend
cd ../../Backend
npm install
```

## 2) Configure environment variables

### Backend (`Backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/buildforgood
JWT_SECRET=your_jwt_secret
groq=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

### Frontend (`Frontend/BuildForGood/.env`)

```env
VITE_API_URL=http://localhost:5000
```

## 3) Run the apps

### Start backend

```bash
cd Backend
npm run dev
```

### Start frontend

```bash
cd Frontend/BuildForGood
npm run dev
```

Frontend default dev URL: `http://localhost:5173`

## API Overview

Base URL (local): `http://localhost:5000`

- `POST /api/signup`
- `POST /api/login`
- `PUT /api/auth/profile`
- `GET /api/simulation`
- `POST /api/simulation/start`
- `POST /api/simulation/chat`
- `POST /api/simulation/evaluate`
- `POST /api/simulation/scenarios`
- `POST /api/simulation/cofounders`
- `POST /api/simulation/compliance`
- `GET /api/cofounder/pool`
- `POST /api/cofounder/recruit`
- `GET /api/posts`
- `POST /api/posts`
- `POST /api/posts/:postId/comment`

Most simulation, cofounder, and post-creation endpoints require a bearer token.

## Deployment Notes

- Frontend is currently hosted on Vercel.
- Set `VITE_API_URL` in Vercel environment variables to your deployed backend URL.
- Configure CORS/backend origin policy as needed for production.

## License

No license is currently specified in this repository.
