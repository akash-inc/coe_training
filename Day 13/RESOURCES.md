# Day 13 — PostgreSQL profiling and optimization

Reference notes for slow-query logging, statement statistics, and related reading.

## Slow query log in PostgreSQL

PostgreSQL does not have a dedicated "slow query log" toggle like MySQL. Use **`log_min_duration_statement`** instead.

### 1. Find your `postgresql.conf`

```bash
# Inside psql
SHOW config_file;

# Or from terminal
psql -U postgres -c "SHOW config_file;"
```

### 2. Set the threshold in `postgresql.conf`

```ini
log_min_duration_statement = 1000   # log queries taking > 1000ms (1 second)
log_min_duration_statement = 500    # log queries > 500ms
log_min_duration_statement = 0      # log ALL queries (use carefully!)
log_min_duration_statement = -1     # disable slow query logging (default)
```

Also enable these for more useful output:

```ini
log_duration = off
log_statement = 'none'
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_destination = 'stderr'
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d.log'
```

### 3. Reload config (no restart needed)

```bash
# Inside psql
SELECT pg_reload_conf();

# Or terminal
pg_ctl reload

# Or system service
sudo systemctl reload postgresql
```

### 4. Set it live without editing the file

```sql
SET log_min_duration_statement = 500;
ALTER DATABASE mydb SET log_min_duration_statement = 1000;
ALTER ROLE myuser SET log_min_duration_statement = 500;
```

### 5. Read the logs

```bash
tail -f /var/log/postgresql/postgresql-*.log
tail -f /var/log/postgresql/postgresql-16-main.log
tail -f /usr/local/var/log/postgresql@16.log
tail -f $PGDATA/pg_log/postgresql-2024-01-15.log
```

### 6. Use `pg_stat_statements`

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

Add to `postgresql.conf`:

```ini
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
```

Example queries:

```sql
SELECT
    round(mean_exec_time::numeric, 2) AS avg_ms,
    round(total_exec_time::numeric, 2) AS total_ms,
    calls,
    query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

```sql
SELECT pg_stat_statements_reset();
```

### 7. Enable `auto_explain`

```ini
shared_preload_libraries = 'auto_explain'
auto_explain.log_min_duration = 1000
auto_explain.log_analyze = on
auto_explain.log_buffers = on
auto_explain.log_nested_statements = on
```

### Quick reference

| Goal | Tool |
|------|------|
| Log queries over X ms | `log_min_duration_statement` |
| Analyze query patterns | `pg_stat_statements` |
| Auto-log execution plans | `auto_explain` |
| One-off slow query check | `EXPLAIN ANALYZE <query>` |
| Real-time activity | `SELECT * FROM pg_stat_activity` |

### Setting priority (highest wins)

```
Session SET  >  Role  >  Database  >  postgresql.conf
```

## External articles

- [Introduction to Profiling and Optimizing SQL Queries for Software Engineers](https://medium.com/scopedev/introduction-to-profiling-and-optimizing-sql-queries-for-software-engineers-3cf376ecc712)
- [Connection Pooling: PostgreSQL](https://medium.com/@jramcloud1/01-connection-pooling-postgresql-database-administration-connection-pooling-in-postgresql-17-1264aff21dae)

## SQLAlchemy loading strategies

- [Relationship loading techniques](https://docs.sqlalchemy.org/en/latest/orm/queryguide/relationships.html#relationship-loading-techniques) — `joinedload`, `selectinload`, `subqueryload`
