# Smart Campus Lost & Found
- backend/  : FastAPI + SQLAlchemy (MySQL or SQLite) + attribute matcher
- frontend/ : React + Vite

Run backend (port 8000) and frontend (port 5173) in two terminals. See each folder's README.

## Free hosting
- Frontend → GitHub Pages (workflow in `.github/workflows/pages.yml`)
- Backend → Render free web service (`render.yaml`)
- Database → Neon free Postgres

Env vars for the backend: `DATABASE_URL`, `CORS_ORIGINS` (your Pages origin), `ADMIN_KEY`.
Frontend: repo variable `VITE_API_URL` = your Render URL.
