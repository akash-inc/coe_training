## Slow Query Log in PostgreSQL

PostgreSQL doesn't have a "slow query log" toggle like MySQL, but achieves the same thing via **`log_min_duration_statement`**.

---

### 1. Find your `postgresql.conf`

```bash
# Inside psql
SHOW config_file;

# Or from terminal
psql -U postgres -c "SHOW config_file;"
```

---

### 2. Set the threshold in `postgresql.conf`

```ini
# postgresql.conf

log_min_duration_statement = 1000   # log queries taking > 1000ms (1 second)
log_min_duration_statement = 500    # log queries > 500ms
log_min_duration_statement = 0      # log ALL queries (use carefully!)
log_min_duration_statement = -1     # disable slow query logging (default)
```

Also enable these for more useful output:

```ini
log_duration = off                  # don't log duration separately (redundant)
log_statement = 'none'              # let log_min_duration handle it
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_destination = 'stderr'         # or 'csvlog' for structured logs
logging_collector = on             # enable log file collection
log_directory = 'pg_log'           # log folder inside data dir
log_filename = 'postgresql-%Y-%m-%d.log'
```

---

### 3. Reload config (no restart needed)

```bash
# Option 1: inside psql
SELECT pg_reload_conf();

# Option 2: terminal
pg_ctl reload

# Option 3: system service
sudo systemctl reload postgresql
```

---

### 4. Set it live without editing the file (session/db level)

```sql
-- For current session only
SET log_min_duration_statement = 500;

-- For a specific database
ALTER DATABASE mydb SET log_min_duration_statement = 1000;

-- For a specific user
ALTER ROLE myuser SET log_min_duration_statement = 500;
```

---

### 5. Read the logs

```bash
# Default log location (varies by OS/install)
tail -f /var/log/postgresql/postgresql-*.log

# On Ubuntu/Debian
tail -f /var/log/postgresql/postgresql-16-main.log

# On macOS (Homebrew)
tail -f /usr/local/var/log/postgresql@16.log

# Inside the data directory
tail -f $PGDATA/pg_log/postgresql-2024-01-15.log
```

**Sample slow query log output:**
```
2024-01-15 10:23:45 UTC [12345]: user=app,db=mydb LOG:
  duration: 2341.567 ms  statement: SELECT * FROM orders
  JOIN users ON orders.user_id = users.id
  WHERE orders.created_at > '2024-01-01';
```

---

### 6. Use `pg_stat_statements` (better for analysis)

This extension tracks **cumulative stats** across all queries — more powerful than log files.

```sql
-- Enable the extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Add to postgresql.conf
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
```

Then query it:

```sql
-- Top 10 slowest queries by average time
SELECT
    round(mean_exec_time::numeric, 2)  AS avg_ms,
    round(total_exec_time::numeric, 2) AS total_ms,
    calls,
    round((total_exec_time / sum(total_exec_time) OVER ()) * 100, 2) AS pct,
    query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

```sql
-- Most frequently called slow queries
SELECT
    calls,
    round(mean_exec_time::numeric, 2) AS avg_ms,
    round(total_exec_time::numeric, 2) AS total_ms,
    query
FROM pg_stat_statements
WHERE mean_exec_time > 100     -- avg over 100ms
ORDER BY calls DESC
LIMIT 10;
```

```sql
-- Reset stats
SELECT pg_stat_statements_reset();
```

---

### 7. Enable `auto_explain` for query plans in logs

Automatically logs the **EXPLAIN plan** of slow queries:

```ini
# postgresql.conf
shared_preload_libraries = 'auto_explain'
auto_explain.log_min_duration = 1000   # explain queries > 1s
auto_explain.log_analyze = on          # include ANALYZE output
auto_explain.log_buffers = on          # include buffer usage
auto_explain.log_nested_statements = on
```

Log output will include the full execution plan automatically — no manual `EXPLAIN ANALYZE` needed.

---

### Quick Reference

| Goal | Tool |
|---|---|
| Log queries over X ms | `log_min_duration_statement` |
| Analyze query patterns | `pg_stat_statements` |
| Auto-log execution plans | `auto_explain` |
| One-off slow query check | `EXPLAIN ANALYZE <query>` |
| Real-time activity | `SELECT * FROM pg_stat_activity` |


### Priority

`SET log_min_duration_statement = 500` is **session-scoped** — it dies the moment your session ends.

---

### To make it persist across sessions, you have 3 options:

#### 1. Edit `postgresql.conf` (global, permanent)
```ini
log_min_duration_statement = 500
```
Then reload:
```sql
SELECT pg_reload_conf();
```
Every session from every user will be affected.

---

#### 2. Per database (permanent for that DB)
```sql
ALTER DATABASE mydb SET log_min_duration_statement = 500;
```
Anyone connecting to `mydb` will have this applied automatically.

---

#### 3. Per user/role (permanent for that user)
```sql
ALTER ROLE myuser SET log_min_duration_statement = 500;
```
Whenever `myuser` starts a new session, it's automatically applied.

---

### Priority order (highest wins):

```
Session SET  >  Role  >  Database  >  postgresql.conf
```

So a `SET` in session always overrides everything else — but only for that session's lifetime.

### A great read to learn Profiling and Optimizing SQL Queries

[Introduction to Profiling and Optimizing SQL Queries for Software Engineers](https://medium.com/scopedev/introduction-to-profiling-and-optimizing-sql-queries-for-software-engineers-3cf376ecc712)