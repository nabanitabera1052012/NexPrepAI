# interview-ai-frontend

React + Vite frontend for the Interview AI app.

## Run locally

```bash
npm install
npm run dev
```

## Backend configuration

The frontend talks to the backend using Axios (`src/lib/apiClient.js`).

- Dev default backend: `http://localhost:3000`
- Production: set `VITE_API_BASE_URL` (see `.env.example`)

## Routes

- `/` → redirects to `/dashboard`
- `/login`
- `/register`
- `/dashboard` (protected)
- `/interview/:interviewId` (protected)

## Deploy (Vercel)

SPA routing is handled by `vercel.json`.
