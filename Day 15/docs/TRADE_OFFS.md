# Day 15: Technical Decisions and Trade-offs

Discussion guide for the Day 15 capstone review session. Expand on the summary table in [README.md](../README.md).

---

## Decision Log

| Decision | Chosen | Alternative considered | Trade-off | When to revisit |
|----------|--------|------------------------|-----------|-----------------|
| Database access | Sync SQLAlchemy + psycopg | Async SQLAlchemy + asyncpg | Simpler TestClient and WebSocket tests; blocks thread per request under load | p95 latency > 500ms sustained or > 50 concurrent users |
| Refresh tokens | In-memory dict | PostgreSQL `refresh_tokens` table | Zero migration complexity; lost on restart; breaks multi-instance | Horizontal scaling or zero-downtime deploy |
| WebSocket auth | JWT in query param | Cookie-based session | Browser cannot set WS headers; token may appear in logs (mitigated by redaction) | Production WS auth standard (e.g. short-lived ticket) |
| API/persistence split | Pydantic models + ORM models | Single model layer | More files; clear API contract vs DB shape | Never at this scale |
| Data access pattern | Repository ABC | Active record in routes | Extra boilerplate; routes stay testable | Optional if team prefers simplicity |
| Frontend deploy | Static nginx bundle | SSR (Next.js, etc.) | Fast, cheap, CDN-ready; no SEO, no server components | Public marketing site needs SEO |
| Frontend state | React Query + local WS merge | Redux or Zustand for all state | Learning curve for cache merge; powerful server cache sync | If client state becomes very complex |
| Auth model | Demo single-user env creds | Multi-user + OAuth | Focus on CRUD/WS/deploy; not a user management lesson | Real product launch |
| Logging | JSON to stdout | File logs or sidecar agent | Container-native; needs log aggregator | Already production pattern |
| Migrations on deploy | `alembic upgrade head` in entrypoint | Separate migration job | Simple; risky for breaking migrations at scale | High-traffic production |
| Observability | Optional Sentry + Elastic APM | Single vendor only | Flexible; more env vars | Pick one vendor for cost clarity |
| CORS | Explicit allowlist env var | `*` wildcard | Must update on new frontend domains | New staging environments |

---

## Deep Dives

### Sync vs async SQLAlchemy

**Why we chose sync:** Early async implementation caused event loop conflicts with FastAPI `TestClient` and WebSocket tests (`attached to a different loop`). Sync sessions per request are predictable.

**Cost:** Under load, each request holds a worker thread during DB I/O. Mitigation: connection pooling, multiple uvicorn workers, then async if needed.

### In-memory refresh tokens

**Why:** Avoids a migration and repository for a demo with one user.

**Cost:** Railway redeploy = mass logout. Two backend replicas = refresh valid on only one instance.

**Upgrade path:** `refresh_tokens(token, email, expires_at)` table + cleanup job for expired rows.

### JWT in WebSocket query string

**Why:** The WebSocket API does not support custom headers in all browsers the way `fetch` does.

**Cost:** Tokens may appear in access logs if redaction fails. Mitigation: `SENSITIVE_QUERY_PARAMS` in logging middleware.

**Upgrade path:** Issue a one-time WS ticket via REST, connect with `?ticket=...`, exchange server-side.

### Repository pattern

**Why:** Tests can mock `TaskRepository` without a database. ORM details stay in one module.

**Cost:** ~200 lines of ABC + implementation. Worth it for teaching DIP; YAGNI for a throwaway script.

---

## Discussion Prompts

Use these in your team retro:

1. **If this app had 10,000 daily users, which decision would break first?** (Likely: sync DB + single worker + in-memory refresh.)

2. **Would you ship demo credentials to a public URL?** What is the minimum change to make login acceptable?

3. **Is the repository pattern worth it for a two-table app?** When does the abstraction pay off?

4. **How would you test WebSocket broadcast behavior in CI?** Review `test_comments_ws.py` approach: is it sufficient?

5. **Build-time vs runtime frontend config:** What breaks if you need to change API URL without rebuild? Is that acceptable?

6. **Observability:** Is `trace_id` enough, or do you need OpenTelemetry spans across services?

7. **Accessibility:** We optimized for shipping features. When should a11y checks enter the workflow (design, PR review, CI)?

8. **What would you add next** (RBAC, rate limiting, OAuth) and what would you keep from the current stack (WS, logging, deploy)?

---

## What We Would Do Differently (starter for reflection)

- Add form labels and `aria-live` from the start (cheaper than retrofit)
- Run gitleaks in CI before first Railway deploy
- Persist refresh tokens before calling it "deployed to prod"
- Add k6 smoke test to CI (optional job, non-blocking)

---

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [CODE_REVIEW.md](./CODE_REVIEW.md)
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
- [REFLECTION_TEMPLATE.md](./REFLECTION_TEMPLATE.md)
