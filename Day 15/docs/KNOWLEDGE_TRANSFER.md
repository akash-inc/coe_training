# Day 15: Knowledge Transfer

Document for onboarding teammates to the Full-Stack Task App.

---

## What This App Is

A production-oriented learning project: JWT-authenticated task CRUD, per-task comments with live WebSocket sync, PostgreSQL persistence, structured JSON logging, Docker Compose, GitHub Actions CI, and Railway deployment.

**Default login:** `test@example.com` / `password` (local `.env`; change on Railway)

---

## Run Locally in 5 Minutes

```bash
cd "Day 15"
cp .env.example .env
docker compose up --build
```

| URL | Service |
|-----|---------|
| http://localhost:5173 | Frontend |
| http://localhost:8000 | Backend API |
| http://localhost:8000/docs | OpenAPI (FastAPI auto) |

**Without Docker:**

```bash
createdb day15_tasks && cd "Day 15" && alembic upgrade head
source .venv/bin/activate && uvicorn main:app --reload --no-access-log
cd frontend && npm ci && npm run dev
```

**Tests:**

```bash
cd "Day 15"
pip install -r requirements.txt -r requirements-dev.txt
python -m pytest -q
```

---

## What This Project Covers

| Area | Implementation in Day 15 |
|------|--------------------------|
| **Backend** | FastAPI, sync SQLAlchemy, repository pattern, Alembic |
| **Frontend** | React 19, Vite, React Query, WebSocket hook |
| **Auth** | JWT access + in-memory refresh tokens |
| **Real-time** | Per-task WebSocket comment broadcast |
| **Observability** | JSON logging, trace IDs, optional Sentry/APM |
| **Accessibility** | Partial WCAG patterns ([A11Y_AUDIT.md](./A11Y_AUDIT.md)) |
| **Performance** | k6 REST load test ([PERFORMANCE.md](./PERFORMANCE.md)) |
| **Security** | Env-driven secrets, CORS, log redaction ([SECURITY_AUDIT.md](./SECURITY_AUDIT.md)) |
| **Deploy** | Docker Compose, Railway, CI ([RUNBOOK.md](./RUNBOOK.md)) |

---

## Key Concepts to Teach

### 1. Repository pattern

Routes call `TaskRepository` / `CommentRepository`, not raw SQL. Implementations live in [repositories.py](../repositories.py). Tests use real Postgres with fixtures in [conftest.py](../tests/conftest.py).

### 2. Dual-path comment sync

- **REST:** `POST /tasks/{id}/comments` persists then `broadcast()`
- **WebSocket:** `comment.create` message same path
- **Frontend:** Optimistic REST + WS merge in [commentsCache.js](../frontend/src/lib/commentsCache.js)

### 3. Trace propagation

- Browser: `sessionStorage` trace_id, per-request `request_id` ([requestTracing.js](../frontend/src/lib/requestTracing.js))
- Backend: ContextVars + JSON logs ([tracing.py](../tracing.py), [logging_config.py](../logging_config.py))
- Debug: filter Railway logs by same `trace_id`

### 4. Build-time vs runtime config

- `VITE_*` vars are inlined at `npm run build`. Changing Railway frontend env requires **rebuild**.
- Backend vars (`JWT_SECRET`, `DATABASE_URL`) are runtime.

### 5. Deploy self-migration

[docker-entrypoint.sh](../docker-entrypoint.sh) runs `alembic upgrade head` before uvicorn. Fresh DB gets schema automatically.

---

## File Map (where to look)

| Question | File |
|----------|------|
| Add a REST route | [main.py](../main.py) |
| Change DB schema | [alembic/versions/](../alembic/versions/) |
| Auth / tokens | [auth.py](../auth.py) |
| WebSocket messages | [comment_ws.py](../comment_ws.py) |
| WS connection registry | [connection_manager.py](../connection_manager.py) |
| Env vars | [config.py](../config.py), [.env.example](../.env.example) |
| Frontend API calls | [frontend/src/lib/apiClient.js](../frontend/src/lib/apiClient.js) |
| WS hook | [frontend/src/hooks/useTaskCommentsSocket.js](../frontend/src/hooks/useTaskCommentsSocket.js) |
| CI | [.github/workflows/day15-ci.yaml](../../.github/workflows/day15-ci.yaml) |

---

## Capstone Artifacts Index

| Document | Use when |
|----------|----------|
| [CODE_REVIEW.md](./CODE_REVIEW.md) | Team review session |
| [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) | Pre-prod security checklist |
| [A11Y_AUDIT.md](./A11Y_AUDIT.md) | Accessibility remediation planning |
| [PERFORMANCE.md](./PERFORMANCE.md) | Running k6 load tests |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Onboarding, design discussions |
| [RUNBOOK.md](./RUNBOOK.md) | Deploying or incident response |
| [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) | Presenting the app |
| [TRADE_OFFS.md](./TRADE_OFFS.md) | Architecture retro |
| [NEXT_STEPS.md](./NEXT_STEPS.md) | Prioritized backlog |

---

## Common Onboarding Questions

**Q: Why did my Railway frontend still call localhost?**  
A: `VITE_API_BASE_URL` was wrong at build time. Fix var, redeploy frontend, hard refresh.

**Q: Why do comments not sync live?**  
A: Check `wss://` URL, CORS, and that both tabs expanded the same task (WS connects per expanded task).

**Q: Why am I logged out after deploy?**  
A: In-memory refresh tokens. Expected for demo.

**Q: How do I add a new env var?**  
A: Add to `config.py`, `.env.example`, README env table, and RUNBOOK if deploy-related.

---

## Handoff Checklist for New Maintainer

- [ ] Clone repo, run `docker compose up`, complete login + two-tab comment demo
- [ ] Run `pytest -q` and `npm run lint && npm run build`
- [ ] Read [ARCHITECTURE.md](./ARCHITECTURE.md) and [RUNBOOK.md](./RUNBOOK.md)
- [ ] Access Railway project (if deployed) and verify env vars
- [ ] Review open items in [NEXT_STEPS.md](./NEXT_STEPS.md)

---

## Related Documents

- [README.md](../README.md)
- [REFLECTION_TEMPLATE.md](./REFLECTION_TEMPLATE.md)
- [NEXT_STEPS.md](./NEXT_STEPS.md)
