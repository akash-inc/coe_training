# Day 15: Performance Testing

**Date:** 2026-06-17  
**Tool:** [k6](https://grafana.com/docs/k6/latest/)  
**Script:** [`../loadtest/k6-smoke.js`](../loadtest/k6-smoke.js)

---

## Purpose

Exercise the REST API under concurrent load: login, list tasks, create task, list comments. WebSocket fan-out is **out of scope** for v1 (see [WebSocket soak test](#websocket-soak-test-out-of-scope) below).

---

## Prerequisites

1. Backend running (Docker Compose or `uvicorn main:app --no-access-log`)
2. PostgreSQL with migrations applied
3. k6 installed

### Install k6

**macOS (Homebrew):**

```bash
brew install k6
```

**Linux:**

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

---

## Running the smoke test

### Local (default)

```bash
cd "Day 15"

# Terminal 1: start stack
docker compose up

# Terminal 2: run load test
k6 run loadtest/k6-smoke.js
```

### Custom target (Railway)

```bash
BASE_URL=https://your-backend.up.railway.app \
DEMO_EMAIL=test@example.com \
DEMO_PASSWORD=your-railway-password \
k6 run loadtest/k6-smoke.js
```

---

## Test profile

| Phase | Duration | Virtual users |
|-------|----------|---------------|
| Ramp up | 30s | 0 → 5 |
| Ramp up | 1m 30s | 5 → 20 |
| Hold | 1m | 20 |
| Ramp down | 30s | 20 → 0 |

**Per iteration (each VU):**

1. `POST /token` (login)
2. `GET /tasks`
3. `POST /tasks` (unique title)
4. `GET /tasks/{id}/comments`
5. Sleep 0.5s

---

## Thresholds (pass criteria)

| Metric | Threshold |
|--------|-----------|
| `errors` rate | < 5% |
| `http_req_duration` p95 | < 2000 ms |
| `task_list_duration` p95 | < 500 ms |
| `task_create_duration` p95 | < 1000 ms |

Adjust thresholds for Railway vs local; network latency will be higher on cloud.

---

## Interpreting results

Example output:

```
Day 15 k6 smoke test summary
BASE_URL: http://localhost:8000
http_req_duration p95: 42.15 ms
errors rate: 0.00%
auth_failures: 0
```

| Signal | Healthy | Investigate |
|--------|---------|-------------|
| `errors` rate | < 1% | Check 401 (wrong credentials), 503 (DB down), 5xx |
| p95 latency | Stable across hold phase | Growing p95 = connection pool or DB saturation |
| `auth_failures` | 0 | `DEMO_USER_*` mismatch with server env |
| `http_reqs` | Linear with VUs | Plateau = server maxed out |

**Backend logs:** Filter JSON logs by `event=http.response` and `duration_ms` during the run. Slow requests log as `WARNING` when above `LOG_SLOW_REQUEST_MS` (default 1000).

---

## Execution snapshot (2026-06-17)

| Item | Status |
|------|--------|
| k6 installed on review machine | **No** (`k6 not found`) |
| Backend running at localhost:8000 | **No** (not started for this session) |
| Script created | **Yes** (`loadtest/k6-smoke.js`) |

**Action for you:** Install k6, start `docker compose up`, run the script, and paste results into this section or your demo notes.

---

## Known bottlenecks (architectural)

| Area | Limitation | When it matters |
|------|------------|-----------------|
| Sync SQLAlchemy | One thread per request blocks on DB I/O | > 50 concurrent VUs on single worker |
| Single uvicorn worker | Default in `docker-entrypoint.sh` | CPU-bound or many concurrent WS |
| In-memory refresh tokens | Not a perf issue; resets on restart | Redeploy during test logs users out |
| No connection pool tuning | SQLAlchemy defaults | High VU count on small Postgres |

**Future:** Multiple uvicorn workers + persistent refresh tokens + async driver if traffic warrants (see [TRADE_OFFS.md](./TRADE_OFFS.md)).

---

## WebSocket soak test (out of scope)

Real-time comments use `WS /ws/tasks/{id}`. A separate script should:

1. Open N WebSocket connections per task
2. Send `comment.create` messages at a fixed rate
3. Measure broadcast latency and connection drops

Tools: k6 `ws` module, or a small Python `websockets` script. Document results separately if you extend this exercise.

---

## Frontend performance note

Vite build reports main chunk **565 kB** (gzip 181 kB). For load testing the SPA, use Lighthouse Performance tab or WebPageTest on the deployed nginx URL. Not covered by the k6 REST script.

---

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [RUNBOOK.md](./RUNBOOK.md)
- [CODE_REVIEW.md](./CODE_REVIEW.md) (M6 bundle size)
