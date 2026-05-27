# Day 11 - FastAPI Task Management API

This folder contains a beginner-friendly backend API built with FastAPI, SQLAlchemy, and PostgreSQL.

If you are new to backend development, think of this project as:
- FastAPI handles HTTP requests (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)
- SQLAlchemy models define database tables
- Repository classes isolate database access logic
- Tests validate behavior end-to-end against a test database

## What This API Does

- Manage users
- Manage tasks assigned to users
- Support full replacement (`PUT`) and partial update (`PATCH`) for tasks

## Project Structure

- `main.py` - API routes + validation + dependency injection
- `models.py` - SQLAlchemy models (`User`, `Task`)
- `database.py` - async DB engine/session setup
- `repositories.py` - repository interfaces + SQLAlchemy implementations
- `alembic/` + `alembic.ini` - migration system
- `tests/` - API tests and fixtures

## Core Concepts Used

- **FastAPI + Pydantic** for request/response validation
- **Async SQLAlchemy** (`AsyncSession`) for DB access
- **Repository pattern** so route handlers stay clean
- **Alembic migrations** so schema changes are versioned
- **Pytest + pytest-asyncio** for async endpoint testing

## API Endpoints

- `GET /` - health/welcome
- `GET /users`
- `POST /users`
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/{task_id}`
- `PUT /tasks/{task_id}`
- `PATCH /tasks/{task_id}`
- `DELETE /tasks/{task_id}`

## Local Setup

From this directory (`Day 11`):

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Configure Database

Update `DATABASE_URL` in `database.py` if needed. Current default is PostgreSQL with asyncpg.

Then run migrations:

```bash
alembic upgrade head
```

## Run the API

```bash
uvicorn main:app --reload
```

Open docs at:
- `http://127.0.0.1:8000/docs`

## Run Tests

```bash
python -m pytest
```

Current test setup includes:
- Async API tests
- Factory fixtures for user/task payloads
- Dedicated test DB flow with migration bootstrap and cleanup

## Why `PUT` and `PATCH` are Separate

- `PUT` means full replacement of a task representation
- `PATCH` means partial update of only provided fields

Both can touch similar internals, but they represent different API contracts for clients.

## Common Issues and Fixes

- **Import warnings in editor but code runs**  
  Usually interpreter mismatch. Select `Day 11/.venv/bin/python` in Cursor/VS Code.

- **`ModuleNotFoundError` during tests**  
  Run tests from this folder using `python -m pytest` and ensure `pytest.ini` has `pythonpath = .`.

- **Event loop / asyncpg loop errors in tests**  
  Keep pytest async loop settings from `pytest.ini` as-is.

- **Alembic check/migration errors**  
  Ensure PostgreSQL is running and the configured DB user/password are valid.

## Learning Notes

This project demonstrates a clean separation of concerns:
- route layer for HTTP behavior and validation
- repository layer for persistence behavior
- model layer for schema

That structure scales better than writing SQL directly inside route functions.
