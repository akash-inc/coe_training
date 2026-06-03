# Day 11 — FastAPI Task Management (Full-Stack)

A task management app with a FastAPI backend (async SQLAlchemy + PostgreSQL) and a Vite + React frontend.

## What you learn

- FastAPI request/response validation with Pydantic
- Async SQLAlchemy (`AsyncSession`) against PostgreSQL
- Repository pattern to keep route handlers thin
- Alembic migrations for versioned schema changes
- `PUT` vs `PATCH` semantics for full vs partial updates
- Async API testing with pytest and a real PostgreSQL test database
- Vite + React UI consuming the REST API

## Project structure

- `main.py` — routes, validation, dependency injection, optional static UI mount
- `models.py` — SQLAlchemy models (`User`, `Task`)
- `database.py` — async engine and session factory
- `repositories.py` — repository interfaces and SQLAlchemy implementations
- `alembic/` + `alembic.ini` — migration system
- `frontend/` — Vite + React + TypeScript UI
- `tests/` — API and repository tests
- `.env.example` — environment variable template

## Prerequisites

- Python 3.11+
- Node.js 20+ (for the frontend)
- PostgreSQL running locally (`psql` available)

## Setup

From `Day 11`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
cp .env.example .env

cd frontend
npm install
cd ..
```

Edit `.env` if your PostgreSQL user, password, or host differ from the defaults.

## Database (PostgreSQL)

Create the application and test databases:

```bash
psql -U postgres -c "CREATE DATABASE tasks;"
psql -U postgres -c "CREATE DATABASE tasks_test;"
```

Apply migrations:

```bash
alembic upgrade head
```

## Run (development)

Use two terminals.

**Terminal 1 — API** (from `Day 11`):

```bash
uvicorn main:app --reload
```

- API: `http://127.0.0.1:8000`
- Docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

**Terminal 2 — Frontend** (from `Day 11/frontend`):

```bash
npm run dev
```

- UI: `http://127.0.0.1:5173` (proxies `/users`, `/tasks`, `/health` to the API)

CORS is enabled on the API for the Vite dev server.

## Run (production-style, single server)

Build the UI and serve it from FastAPI:

```bash
cd frontend && npm run build && cd ..
uvicorn main:app --reload
```

Open `http://127.0.0.1:8000` for the app (requires `frontend/dist` to exist).

## Run tests

From `Day 11`:

```bash
python -m pytest
```

Tests use `TEST_DATABASE_URL` from `.env` (default: `tasks_test`).

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health / welcome |
| GET | `/users` | List users |
| POST | `/users` | Create user |
| GET | `/tasks` | List tasks |
| POST | `/tasks` | Create task |
| GET | `/tasks/{task_id}` | Get task |
| PUT | `/tasks/{task_id}` | Replace task (full body) |
| PATCH | `/tasks/{task_id}` | Partial task update |
| DELETE | `/tasks/{task_id}` | Delete task |

## Frontend features

- Create and list users
- Create, list, filter, edit (PUT), and delete tasks
- Quick status updates via PATCH
- Toast feedback for API errors

## Why `PUT` and `PATCH` are separate

- `PUT` replaces the full task representation (client sends all required fields).
- `PATCH` updates only fields present in the request body (used for quick status changes in the UI).

## Troubleshooting

- **Import warnings in the editor** — Select `Day 11/.venv/bin/python` as the interpreter.
- **UI cannot reach API in dev** — Ensure uvicorn is running on port 8000 before `npm run dev`.
- **Blank page on port 8000** — Run `npm run build` in `frontend/` so `frontend/dist` exists.
- **Connection refused / authentication failed** — Confirm PostgreSQL is running and `.env` URLs match your local setup.

## Further reading

See [RESOURCES.md](RESOURCES.md) for documentation links and deeper topics.
