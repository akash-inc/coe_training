# Day 11 — FastAPI Task Management API

A beginner-friendly backend API built with FastAPI, async SQLAlchemy, and PostgreSQL.

## What you learn

- FastAPI request/response validation with Pydantic
- Async SQLAlchemy (`AsyncSession`) against PostgreSQL
- Repository pattern to keep route handlers thin
- Alembic migrations for versioned schema changes
- `PUT` vs `PATCH` semantics for full vs partial updates
- Async API testing with pytest and a real PostgreSQL test database

## Project structure

- `main.py` — routes, validation, dependency injection
- `models.py` — SQLAlchemy models (`User`, `Task`)
- `database.py` — async engine and session factory
- `repositories.py` — repository interfaces and SQLAlchemy implementations
- `alembic/` + `alembic.ini` — migration system
- `tests/` — API and repository tests
- `.env.example` — environment variable template

## Prerequisites

- Python 3.11+
- PostgreSQL running locally (`psql` available)

## Setup

From `Day 11`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
cp .env.example .env
```

Edit `.env` if your PostgreSQL user, password, or host differ from the defaults.

## Database (PostgreSQL)

Create the application and test databases:

```bash
psql -U postgres -c "CREATE DATABASE tasks;"
psql -U postgres -c "CREATE DATABASE tasks_test;"
```

If your role is not `postgres`, use your superuser or an account that can create databases.

Apply migrations:

```bash
alembic upgrade head
```

## Run the API

```bash
uvicorn main:app --reload
```

- API: `http://127.0.0.1:8000`
- Docs: `http://127.0.0.1:8000/docs`

## Run tests

```bash
python -m pytest
```

Tests use `TEST_DATABASE_URL` from `.env` (default: `tasks_test`). The test suite creates that database if needed, runs `alembic upgrade head`, then truncates tables between tests.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health / welcome |
| GET | `/users` | List users |
| POST | `/users` | Create user |
| GET | `/tasks` | List tasks |
| POST | `/tasks` | Create task |
| GET | `/tasks/{task_id}` | Get task |
| PUT | `/tasks/{task_id}` | Replace task (full body) |
| PATCH | `/tasks/{task_id}` | Partial task update |
| DELETE | `/tasks/{task_id}` | Delete task |

## Why `PUT` and `PATCH` are separate

- `PUT` replaces the full task representation (client sends all required fields).
- `PATCH` updates only fields present in the request body.

## Troubleshooting

- **Import warnings in the editor** — Select `Day 11/.venv/bin/python` as the interpreter.
- **`ModuleNotFoundError` during tests** — Run from `Day 11` with `python -m pytest`; `pytest.ini` sets `pythonpath = .`.
- **Connection refused / authentication failed** — Confirm PostgreSQL is running and `.env` URLs match your local setup.
- **Event loop / asyncpg errors in tests** — Keep `pytest.ini` asyncio settings unchanged.
- **Alembic check/migration errors** — Ensure PostgreSQL is running and `alembic.ini` / `.env` URLs are valid; run `alembic upgrade head` before starting the API.

## Further reading

See [RESOURCES.md](RESOURCES.md) for documentation links and deeper topics.
