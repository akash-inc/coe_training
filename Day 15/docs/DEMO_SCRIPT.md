# Day 15: Demo Presentation Script

**Duration:** 10 to 15 minutes  
**Audience:** Team, stakeholders  
**App:** Full-Stack Task Manager ([local](http://localhost:5173) or Railway URL)

---

## Before You Start

- [ ] App running (Docker Compose or Railway)
- [ ] Demo credentials ready (`test@example.com` / your Railway password)
- [ ] Two browser tabs or windows prepared
- [ ] Backend logs visible (Railway logs or terminal with JSON output)
- [ ] [ARCHITECTURE.md](./ARCHITECTURE.md) open for architecture slide/diagram

---

## 1. Hook (1 min)

> "Teams lose context when task updates live in chat threads instead of on the work itself. This app puts tasks and live discussion in one place: create a task, discuss it in comments, and see updates instantly across every open tab."

---

## 2. Architecture (1 min)

Show system context diagram from [ARCHITECTURE.md](./ARCHITECTURE.md):

> "React frontend talks REST for CRUD and WebSockets for live comments. FastAPI handles both, persists to PostgreSQL, and emits structured JSON logs we can trace end to end. We deploy three Railway services: Postgres, API, and a static nginx frontend."

**Key tech one-liner:** React Query + WebSocket merge, FastAPI repository pattern, Alembic migrations, Docker CI/CD.

---

## 3. Live Demo (6 to 8 min)

### 3.1 Login

1. Open the app URL
2. Sign in with demo credentials
3. Point out: JWT access token + refresh flow (session survives short expiry via silent refresh)

> "Auth is JWT-based. The client retries once on 401 with a refresh token before logging out."

### 3.2 Task management

1. Create a task: title + description
2. Mark it complete, then reopen
3. Edit title briefly

> "Tasks persist in PostgreSQL. Restarts don't lose data."

### 3.3 Real-time comments (highlight)

1. Expand comments on a task in **Tab A**
2. Open the **same task** in **Tab B**
3. Post a comment in Tab A
4. Show it appear in Tab B without refresh

> "WebSocket broadcasts `comment.created` to every connection on that task. REST mutations use the same broadcast path, so HTTP and WS stay in sync."

### 3.4 Observability

1. Show backend log line with `event`, `request_id`, and `trace_id`
2. Optional: show same `trace_id` in browser Network tab request headers

> "Every action is correlatable across frontend and backend logs. This is how we'd debug a production incident."

### 3.5 Author-only edit

1. Edit or delete your own comment
2. Mention: server enforces `author_email` match (403 if not owner)

---

## 4. Production Story (2 min)

> "We went from in-memory prototype to PostgreSQL, Docker Compose for local dev, GitHub Actions CI with 49 backend tests, and Railway deploy."

Mention pitfalls you solved (from DEPLOYMENT.md):

- HTTPS/WSS mixed content
- Vite env vars are build-time
- CORS for deployed frontend
- Self-migrating deploys via Alembic

Show CI badge or GitHub Actions run if available.

---

## 5. Accessibility Callout (1 min)

Be honest (from [A11Y_AUDIT.md](./A11Y_AUDIT.md)):

> "Login and comment forms use proper labels. Task forms and live status announcements are on our polish backlog. We audited against WCAG 2.1 AA and have a prioritized fix list."

Optional: quick keyboard tab through login if time permits.

---

## 6. Q&A Prep

| Question | Answer |
|----------|--------|
| Why sync SQLAlchemy not async? | TestClient + WebSocket test stability; trade-off doc in TRADE_OFFS.md |
| Why in-memory refresh tokens? | Demo simplicity; users re-login on redeploy |
| How do you scale WebSockets? | ConnectionManager is in-process; need sticky sessions or Redis pub/sub for multi-instance |
| Is it production-ready? | Learning deployment; needs rate limiting, persistent refresh, secrets manager for real prod |
| How do you test? | 49 pytest tests; frontend lint + build in CI |

---

## 7. Close (30 sec)

> "This capstone ties together full-stack CRUD, real-time sync, structured logging, containers, CI, and cloud deploy. Next steps are in our backlog: a11y polish, load testing with k6, and production hardening from our security audit."

---

## Backup Plans

| Failure | Fallback |
|---------|----------|
| Railway down | Demo local Docker Compose |
| WebSocket fails | Show REST comment + refresh; explain WSS/CORS fix from DEPLOYMENT.md |
| Login fails | Check `DEMO_USER_*` env vars; use local `.env` |
| No network | Walk through ARCHITECTURE.md diagrams and test output screenshot |

---

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [A11Y_AUDIT.md](./A11Y_AUDIT.md)
- [TRADE_OFFS.md](./TRADE_OFFS.md)
- [DEPLOYMENT.md](../DEPLOYMENT.md)
