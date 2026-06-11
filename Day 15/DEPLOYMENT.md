# Day 15: Production and Railway Deployment Notes

This document records what we built, the steps to take it from a local in-memory
prototype to a Railway deployment, and the pitfalls we hit along the way (with
the fix for each).

## 1. What this app is

A small full-stack task app used for learning:

- **Backend**: FastAPI, JWT auth, REST task and comment CRUD, WebSocket live comments.
- **Frontend**: React + Vite + React Query, WebSocket hook for real-time updates.
- **Database**: PostgreSQL via SQLAlchemy using the repository pattern.
- **Schema management**: Alembic migrations.
- **Local orchestration**: Docker Compose (Postgres + backend + frontend).
- **Deployment target**: Railway (three services).

## 2. The path we took

### 2.1 In-memory to PostgreSQL

Started with in-memory lists for tasks and comments, then moved to PostgreSQL.

- Added `database.py` (engine, `SessionLocal`, `get_db`).
- Added `orm_models.py` (`TaskModel`, `CommentModel` with a cascade delete).
- Added `repositories.py`: abstract `TaskRepository` / `CommentRepository` plus
  `SqlAlchemy*` implementations. Routes depend on the abstract interface, not on
  the session directly.
- Kept Pydantic API schemas in `models/` separate from ORM models.
- Added Alembic (`alembic.ini`, `alembic/env.py`, one migration that creates the
  tables and seeds task id 1).

Auth and refresh tokens stayed in memory on purpose (see pitfalls).

### 2.2 Centralized configuration

Added `config.py` as the single source for environment driven settings:

- `get_database_url()` reads `DATABASE_URL` and normalizes the scheme.
- `get_cors_origins()` parses a comma separated `CORS_ORIGINS`.
- `JWT_SECRET`, token lifetimes, demo credentials, and `PORT` all read from env
  with safe local defaults.

`database.py`, `auth.py`, `main.py`, and `alembic/env.py` all import from
`config.py` so there is one place to change behavior.

### 2.3 Frontend API base wiring

- Added `frontend/src/lib/apiBase.js` with `getApiBaseUrl()` and `apiUrl()`.
- `apiClient.js` and `api/auth.js` call `apiUrl(path)` instead of hardcoded paths.
- `useTaskCommentsSocket.js` derives the WebSocket URL from `VITE_API_WS_HOST`,
  then `VITE_API_BASE_URL` (http to ws), then falls back to the page origin.

This lets the same build run two ways:

- **Local dev**: empty base URL, so requests are same origin and go through the
  Vite proxy.
- **Split deploy**: base URL points at the deployed API domain.

### 2.4 Docker

- `Dockerfile` (backend): installs deps, copies code, runs `docker-entrypoint.sh`
  which applies migrations then starts uvicorn on `${PORT:-8000}`.
- `frontend/Dockerfile`: multi-stage. The `build` stage compiles the Vite bundle;
  the `production` stage serves the static files with nginx and respects `PORT`.
- `frontend/nginx.conf.template`: SPA routing (`try_files ... /index.html`) and a
  templated `listen ${PORT}` substituted by the official nginx entrypoint.
- `docker-compose.yml`: Postgres with a healthcheck, backend with reload, and the
  frontend targeting the `build` stage with the dev server command so local
  development keeps hot reload while production uses nginx.

### 2.5 Railway deployment

Three services in one Railway project:

1. **PostgreSQL** (plugin, provides `DATABASE_URL`).
2. **Backend**: root directory `Day 15`, Dockerfile build.
3. **Frontend**: root directory `Day 15/frontend`, Dockerfile build.

Backend variables:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<openssl rand -hex 32>
DEMO_USER_EMAIL=test@example.com
DEMO_USER_PASSWORD=<strong-password>
CORS_ORIGINS=https://<frontend-domain>.up.railway.app
```

Frontend variables (build time):

```
VITE_API_BASE_URL=https://<backend-domain>.up.railway.app
VITE_API_WS_HOST=wss://<backend-domain>.up.railway.app
```

Deploy order: Postgres, then backend (generate domain), then frontend (set API
URLs, generate domain), then set backend `CORS_ORIGINS`, then verify.

## 3. Pitfalls we hit and how we avoided them

### 3.1 Mixed content: HTTPS page calling HTTP API

**Symptom**

```
Mixed Content: The page at 'https://<frontend>.up.railway.app/' was loaded over
HTTPS, but requested an insecure resource 'http://<backend>.up.railway.app/token'.
This request has been blocked.
```

**Cause**: `VITE_API_BASE_URL` was set with an `http://` scheme. Browsers block
insecure requests made from an HTTPS page.

**Fix**: set the variable with `https://` (and `wss://` for `VITE_API_WS_HOST`),
then rebuild the frontend. Railway only forces HTTPS on the served domain, not on
arbitrary variable values, so the scheme must be correct in the variable itself.

### 3.2 Vite environment variables are build time, not runtime

**Cause**: `VITE_*` values are inlined into the JavaScript bundle when
`npm run build` runs. Editing the variable after deploy does nothing until a
rebuild.

**Fix**: change the variable, then trigger a redeploy (Railway usually does this
automatically) and hard refresh the browser to drop the cached bundle. In Docker
the values are passed as build `ARG`s in `frontend/Dockerfile`.

### 3.3 WebSocket scheme on HTTPS

**Cause**: a WebSocket from an HTTPS page must use `wss://`. Using `ws://` or
`http://` is blocked the same way as mixed content.

**Fix**: `VITE_API_WS_HOST=wss://...`. As a backstop, `useTaskCommentsSocket.js`
falls back to `wss:` when the page protocol is `https:`.

### 3.4 SQLAlchemy database URL scheme

**Cause**: Railway provides `postgresql://...` (or sometimes `postgres://...`),
but the app uses the psycopg driver, which needs `postgresql+psycopg://...`.

**Fix**: `normalize_database_url()` in `config.py` rewrites the scheme, so the
raw Railway URL can be pasted as is.

### 3.5 CORS blocked the deployed frontend

**Cause**: CORS origins were hardcoded to localhost, so the deployed frontend
origin was rejected.

**Fix**: `CORS_ORIGINS` is now an env variable parsed by `get_cors_origins()`.
Set it to the frontend HTTPS domain on Railway.

### 3.6 Server port on Railway

**Cause**: Railway injects a `PORT` and expects the app to bind to it. A
hardcoded port fails health checks.

**Fix**: `docker-entrypoint.sh` runs uvicorn on `${PORT:-8000}`, and the nginx
template listens on `${PORT}`. Do not set `PORT` manually on Railway.

### 3.7 Production frontend was the Vite dev server

**Cause**: the first `frontend/Dockerfile` ran `npm run dev`, which is a
development server, not suitable for production.

**Fix**: multi-stage Dockerfile that builds the bundle and serves it with nginx.
Local hot reload is preserved by pointing Docker Compose at the `build` stage and
overriding the command.

### 3.8 Migrations must run before the app serves traffic

**Cause**: a fresh database has no tables, so the first request would fail.

**Fix**: `docker-entrypoint.sh` runs `alembic upgrade head` before starting
uvicorn, so deploys are self migrating.

### 3.9 In-memory refresh tokens reset on redeploy

**Cause**: refresh tokens live in a Python dict in `auth.py`. Any restart or
redeploy clears them, logging users out.

**Status**: acceptable for a demo. For real use, persist refresh tokens in
PostgreSQL. Documented so it is a known limitation, not a surprise.

### 3.10 Async SQLAlchemy did not play well with TestClient

**Cause**: an early attempt used the async engine and async repositories. The
WebSocket and TestClient tests hit event loop conflicts
(`attached to a different loop`, `another operation is in progress`).

**Fix**: switched to the sync engine with `psycopg` and a session per request.
All 15 tests then passed reliably.

### 3.11 Local secrets and env files in Git

**Cause**: committing `.env` would leak secrets.

**Fix**: `.gitignore` excludes `.env` and `.env.*` but keeps `.env.example`
tracked. Compose reads real values from `.env`; Railway uses dashboard variables.

### 3.12 Folder name has a space

**Note**: the app lives in `Day 15` (with a space). Railway's Root Directory
field handles this through the UI, but be aware when scripting paths or setting
build configs.

## 4. Verification checklist

1. Backend root URL returns `{"message": "Hello, World!"}`.
2. Login works with the demo credentials.
3. Task create, edit, complete, and delete persist (REST to PostgreSQL).
4. Open one task in two browser tabs and post a comment: it appears live in both
   (confirms `wss://` WebSockets and CORS are correct).

## 5. Quick reference: where variables live

| Service  | Variables |
|----------|-----------|
| Postgres | `DATABASE_URL` (auto) |
| Backend  | `DATABASE_URL`, `JWT_SECRET`, `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD`, `CORS_ORIGINS` |
| Frontend | `VITE_API_BASE_URL`, `VITE_API_WS_HOST` (build time) |
