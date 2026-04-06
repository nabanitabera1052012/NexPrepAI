# Interview AI (Gemini) — Full Stack

This repository contains a **React (Vite) frontend** and an **Express + MongoDB backend** that generates an interview preparation plan using **Google Gemini**.

- **Frontend**: `interview-ai-Frontend-main/` (React + Vite + React Router)
- **Backend**: `interview-ai-backend-main/` (Express + MongoDB + Gemini + Puppeteer PDF)

## Features

- **Auth** (cookie-based JWT)
  - Register, login, logout, get current user
- **Interview report**
  - Generate interview report using Gemini
  - View report by URL: `/interview/:interviewId`
  - List recent reports on dashboard
- **Resume PDF**
  - Generate a tailored resume PDF from the stored report inputs

## Live URLs

- **Frontend (Vercel)**: `https://interview-ai-frontend-ten.vercel.app/`
- **Backend**: set in `.env` / hosting provider (you can add the deploy URL anytime)

## Folder structure

```text
new_project/
  README.md
  interview-ai-Frontend-main/
    vercel.json
    vite.config.js
    package.json
    src/
      app.routes.jsx
      App.jsx
      main.jsx
      lib/
        apiClient.js
      features/
        auth/
          auth.context.jsx
          hooks/
            useAuth.js
          pages/
            Login.jsx
            Register.jsx
          services/
            auth.api.js
          components/
            Protected.jsx
        interview/
          interview.context.jsx
          hooks/
            useInterview.js
          pages/
            Home.jsx
            Interview.jsx
          services/
            interview.api.js
          style/
            home.scss
            interview.scss

  interview-ai-backend-main/
    server.js
    package.json
    .env
    src/
      app.js
      config/
        database.js
      middlewares/
        auth.middleware.js
      controllers/
        auth.controller.js
        interview.controller.js
      routes/
        auth.routes.js
        interview.routes.js
      models/
        user.model.js
        blacklist.model.js
        interviewReport.model.js
      service/
        ai.service.js
      services/
        ai.service.js
```

## Environment variables

### Backend (`interview-ai-backend-main/.env`)

Required:
- **`MONGO_URI`**: MongoDB connection string
- **`JWT_SECRET`**: secret for signing JWT
- **`GOOGLE_GENAI_API_KEY`**: Gemini API key

Optional:
- **`CORS_ORIGINS`**: comma-separated origins allowed for cookies (defaults include local dev + your Vercel URL)
  - Example: `http://localhost:5173,http://localhost:5174,https://interview-ai-frontend-ten.vercel.app`

Important:
- **Do not commit secrets** (especially `GOOGLE_GENAI_API_KEY`). Rotate keys if they were exposed.

### Frontend (`interview-ai-Frontend-main`)

Optional (for production / deployed backend):
- **`VITE_API_BASE_URL`**
  - Dev default (if not set): `http://localhost:3000`
  - Production: set to your deployed backend base URL (example: `https://your-backend-domain.com`)

There is a template at:
- `interview-ai-Frontend-main/.env.example`

## Run locally

### 1) Backend

```bash
cd interview-ai-backend-main
npm install
npm run dev
```

Backend runs on:
- `http://localhost:3000`

### 2) Frontend

```bash
cd interview-ai-Frontend-main
npm install
npm run dev
```

Frontend runs on:
- `http://localhost:5173` (or 5174 if 5173 is busy)

## API routes used by the frontend

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET  /api/auth/logout`
  - `GET  /api/auth/get-me`

- **Interview**
  - `GET  /api/interview/`
  - `POST /api/interview/` (multipart form: `jobDescription`, optional `selfDescription`, optional `resume` PDF)
  - `GET  /api/interview/report/:interviewId`
  - `POST /api/interview/resume/pdf/:interviewReportId` (returns `application/pdf`)

## Deploy notes (Vercel + backend)

- Frontend is configured for SPA routing via `interview-ai-Frontend-main/vercel.json`.
- When you deploy backend, set `VITE_API_BASE_URL` in Vercel to your backend URL.
- If you use cookie auth cross-domain, your backend must allow credentials and include the Vercel origin in `CORS_ORIGINS`.

