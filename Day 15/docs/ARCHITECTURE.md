# Day 15: Architecture Reference

Deep-dive architecture for the Full-Stack Task App. For a quick overview, see the diagram in [README.md](../README.md).

---

## 1. System Context

```mermaid
flowchart TB
  subgraph user [User Browser]
    SPA[React SPA]
  end

  subgraph railway [Railway Project]
    FE[Frontend nginx]
    API[FastAPI Backend]
    PG[(PostgreSQL)]
  end

  SPA -->|HTTPS REST| FE
  SPA -->|HTTPS REST / WSS| API
  FE -->|static assets| SPA
  API --> PG
```

| Component | Technology | Responsibility |
|-----------|------------|----------------|
| Frontend | React 19, Vite, React Query | Task UI, auth shell, WebSocket client |
| Frontend prod | nginx | Serve static `dist/`, SPA routing |
| Backend | FastAPI, sync SQLAlchemy | REST API, WebSocket hub, auth |
| Database | PostgreSQL 16 | Tasks and comments persistence |
| CI | GitHub Actions | pytest + Postgres, frontend lint/build |

---

## 2. Backend Layering

```mermaid
flowchart TB
  subgraph routes [FastAPI Routes]
    REST[REST handlers]
    WS[WebSocket handler]
  end

  subgraph domain [Domain Layer]
    REPO[TaskRepository / CommentRepository]
    AUTH[auth.py JWT]
    CM[ConnectionManager]
  end

  subgraph infra [Infrastructure]
    ORM[orm_models.py]
    DB[(PostgreSQL)]
    LOG[JSON logging]
    APM[Sentry / Elastic APM]
  end

  REST --> REPO
  REST --> AUTH
  WS --> REPO
  WS --> AUTH
  WS --> CM
  REPO --> ORM --> DB
  REST --> LOG
  WS --> LOG
  REST --> APM
```

**Dependency rule:** Routes depend on repository abstractions and auth helpers, not on raw SQL or ORM sessions directly.

---

## 3. Authentication Flow

```mermaid
sequenceDiagram
  participant UI as React App
  participant API as FastAPI
  participant Store as RefreshTokenStore

  UI->>API: POST /token email password
  alt valid demo credentials
    API->>Store: issue_refresh_token email
    API-->>UI: access_token refresh_token
    UI->>UI: tokenStorage localStorage
  else invalid
    API-->>UI: 401 auth.login_failed logged
  end

  UI->>API: GET /tasks Authorization Bearer
  alt token expired
    API-->>UI: 401
    UI->>API: POST /token/refresh
    API->>Store: validate_refresh_token
    API-->>UI: new access_token
    UI->>API: retry GET /tasks
  else valid
    API-->>UI: 200 tasks JSON
  end
```

**WebSocket auth:** Browsers cannot set custom headers on WebSocket handshake. The client passes `token` as a query parameter plus `trace_id` / `request_id` from [requestTracing.js](../frontend/src/lib/requestTracing.js). Server validates via `get_user_from_token()` in [main.py](../main.py).

---

## 4. Comment Sync Flow

```mermaid
sequenceDiagram
  participant TabA as Browser Tab A
  participant TabB as Browser Tab B
  participant API as FastAPI
  participant CM as ConnectionManager
  participant DB as PostgreSQL

  TabA->>API: WS connect /ws/tasks/1 token
  API->>DB: list comments
  API-->>TabA: comments.snapshot

  TabB->>API: WS connect /ws/tasks/1 token
  API-->>TabB: comments.snapshot

  TabA->>API: POST /tasks/1/comments body
  API->>DB: insert comment
  API->>CM: broadcast comment.created
  CM-->>TabA: comment.created
  CM-->>TabB: comment.created
  TabA->>TabA: React Query merge cache
  TabB->>TabB: React Query merge cache
```

**Dual path:** Comments can be created via REST (`POST /tasks/{id}/comments`) or WebSocket (`comment.create` message). Both persist to DB and broadcast via `ConnectionManager.broadcast()`.

**Frontend merge:** [TaskComments.jsx](../frontend/src/components/TaskComments.jsx) uses optimistic updates for REST posts and merges WebSocket events via [commentsCache.js](../frontend/src/lib/commentsCache.js) to dedupe optimistic rows.

---

## 5. Observability Path

```mermaid
flowchart LR
  subgraph browser [Browser]
    RT[requestTracing.js]
    FETCH[apiClient fetch]
    WS[WebSocket URL params]
  end

  subgraph api [Backend]
    MW[RequestLoggingMiddleware]
    CTX[tracing ContextVars]
    JSON[JSON log stdout]
    SENTRY[Sentry optional]
    APM[Elastic APM optional]
  end

  RT --> FETCH
  RT --> WS
  FETCH -->|X-Trace-ID X-Request-ID| MW
  WS -->|trace_id request_id query| CTX
  MW --> CTX --> JSON
  MW --> SENTRY
  MW --> APM
```

| Field | Scope | Purpose |
|-------|-------|---------|
| `trace_id` | Browser tab session | Correlate all actions in one tab |
| `request_id` | Single HTTP/WS connection | Pinpoint one request in logs |
| `event` | Log line | Filter (`http.response`, `ws.connect`, etc.) |

**Health endpoints:**

| Path | Purpose |
|------|---------|
| `GET /live` | Liveness (process up) |
| `GET /ready` | Readiness (DB reachable) |
| `GET /health` | Full health check (same as ready) |

---

## 6. Deployment Topology

```mermaid
flowchart TB
  subgraph buildTime [Build Time - Frontend Docker]
    VITE[VITE_API_BASE_URL]
    VITEWS[VITE_API_WS_HOST]
    NPM[npm run build]
    DIST[dist/ static bundle]
    VITE --> NPM
    VITEWS --> NPM
    NPM --> DIST
  end

  subgraph runtime [Runtime - Railway]
  PG[(Postgres plugin)]
  BE[Backend container]
  FE[Frontend nginx container]
  end

  DIST --> FE
  BE -->|DATABASE_URL| PG
  FE -->|user browser calls API URL| BE
```

| Variable | When read | Service |
|----------|-----------|---------|
| `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` | Runtime | Backend |
| `VITE_API_BASE_URL`, `VITE_API_WS_HOST` | **Build time** | Frontend (inlined into JS) |

**Deploy order:** Postgres → backend (get domain) → frontend (set Vite vars, rebuild) → backend `CORS_ORIGINS` → verify.

---

## 7. Data Model

```mermaid
erDiagram
  tasks ||--o{ comments : has
  tasks {
    int id PK
    string title
    string description
    bool completed
  }
  comments {
    int id PK
    int task_id FK
    string body
    string author_email
    datetime created_at
  }
```

Cascade delete: removing a task deletes its comments (`ON DELETE CASCADE` + ORM cascade).

---

## Related Documents

- [README.md](../README.md)
- [RUNBOOK.md](./RUNBOOK.md)
- [TRADE_OFFS.md](./TRADE_OFFS.md)
- [DEPLOYMENT.md](../DEPLOYMENT.md)
