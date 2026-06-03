# Day 13 — School Management API (N+1 and eager loading)

A FastAPI + SQLAlchemy API for students, courses, and enrollments. Compare naive lazy loading against `joinedload`, `selectinload`, and `subqueryload` on the same dataset.

## What you learn

- ORM relationships and the N+1 query problem
- Eager loading strategies: `joinedload`, `selectinload`, `subqueryload`
- Bulk seed and bulk update endpoints
- PostgreSQL-only persistence with SQL echo controlled by environment
- API testing against a real PostgreSQL test database

## Project structure

- `app/main.py` — routes and loading-strategy demos
- `app/models.py` — `Student`, `Course`, `Enrollment`
- `app/schemas.py` — Pydantic request/response models
- `app/database.py` — PostgreSQL engine and sessions
- `tests/` — smoke and integration-style API tests
- `.env.example` — environment variable template

## Prerequisites

- Python 3.11+
- PostgreSQL (`psql`)

## Setup

From `Day 13`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
cp .env.example .env
```

Edit `.env` if your PostgreSQL credentials differ.

## Database (PostgreSQL)

```bash
psql -U postgres -c "CREATE DATABASE school;"
psql -U postgres -c "CREATE DATABASE school_test;"
```

Tables are created on app startup (`Base.metadata.create_all` in `main.py`).

## Run the API

From `Day 13/app`:

```bash
cd app
uvicorn main:app --reload
```

- API: `http://127.0.0.1:8000`
- Docs: `http://127.0.0.1:8000/docs`

Set `DATABASE_ECHO=true` in `.env` to print SQL statements to the console while exploring loading strategies.

## Seed data for experiments

```bash
curl -X POST http://127.0.0.1:8000/populate-all \
  -H "Content-Type: application/json" \
  -d '{
    "reset": true,
    "students": [{
      "name": "Alice Example",
      "age": 20,
      "email": "alice@example.com",
      "phone": "+14155552671",
      "subjects": ["Math"],
      "subject_grades": {"Math": "A"}
    }],
    "courses": [{
      "name": "CS101",
      "description": "Introduction to computer science",
      "subjects": ["Math"]
    }],
    "enrollments": [{"student_ref": 0, "course_ref": 0}]
  }'
```

Then compare these endpoints (watch SQL echo):

| Endpoint | Loading behavior |
|----------|------------------|
| `GET /courses-with-students-naive` | Lazy load — N+1 risk |
| `GET /courses-with-students-eager-joinedload` | Single query with joins |
| `GET /courses-with-students-selectin` | Batched `IN` queries |
| `GET /courses-with-students-subquery` | Subquery-based collection load |

## Run tests

From `Day 13`:

```bash
python -m pytest
```

Tests use `TEST_DATABASE_URL` (default: `school_test`). The suite creates that database if missing.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health / welcome |
| GET/POST | `/students` | List / upsert students |
| GET/POST | `/courses` | List / upsert courses |
| GET/POST | `/enrollments` | List / upsert enrollments |
| POST | `/populate-all` | Seed students, courses, enrollments |
| POST | `/bulk-update` | Bulk update mappings |
| GET | `/courses-with-students-naive` | Lazy loading demo |
| GET | `/courses-with-students-eager-joinedload` | `joinedload` demo |
| GET | `/courses-with-students-selectin` | `selectinload` demo |
| GET | `/courses-with-students-subquery` | `subqueryload` demo |

## Troubleshooting

- **Import errors when running uvicorn** — Run from `Day 13/app` so flat imports (`from database import …`) resolve.
- **Connection refused** — Confirm PostgreSQL is running and `.env` URLs are correct.
- **Validation errors on seed data** — Phone must match `+?[1-9]…`; grades must be `A+`, `A`, `B+`, etc.

## Further reading

- [RESOURCES.md](RESOURCES.md) — PostgreSQL slow-query logging, `pg_stat_statements`, profiling articles
