# Course enrollment counts — slow vs optimized

Two report endpoints return the **same JSON shape** for the same data. Compare them with `EXPLAIN ANALYZE` and `DATABASE_ECHO=true`.

| Endpoint | Purpose |
|----------|---------|
| `GET /report/course-enrollment-counts-slow` | Correlated subquery (anti-pattern for learning) |
| `GET /report/course-enrollment-counts` | `LEFT JOIN` + `GROUP BY` (preferred) |

Seed data first: `POST /populate-all`

---

## Slow version (correlated subquery)

**Handler:** `course_enrollment_counts_slow` in `app/main.py`

```sql
SELECT c.id, c.name,
  (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollment_count
FROM courses c
ORDER BY c.id;
```

PostgreSQL runs **SubPlan 1 once per course row** — cost scales with courses × work per enrollment scan.

### EXPLAIN ANALYZE (sample: 10 courses, 10 enrollments)

```text
                                                          QUERY PLAN
------------------------------------------------------------------------------------------------------------------------------
 Sort  (cost=2500.30..2500.47 rows=70 width=528) (actual time=0.714..0.716 rows=10 loops=1)
   Sort Key: c.id
   Sort Method: quicksort  Memory: 25kB
   ->  Seq Scan on courses c  (cost=0.00..2498.15 rows=70 width=528) (actual time=0.074..0.665 rows=10 loops=1)
         SubPlan 1
           ->  Aggregate  (cost=35.52..35.53 rows=1 width=8) (actual time=0.060..0.060 rows=1 loops=10)
                 ->  Seq Scan on enrollments e  (cost=0.00..35.50 rows=10 width=0) (actual time=0.003..0.004 rows=1 loops=10)
                       Filter: (course_id = c.id)
                       Rows Removed by Filter: 9
 Planning Time: 3.708 ms
 Execution Time: 0.817 ms
(11 rows)
```

**What to notice**

- `loops=10` on the subplan aggregate and enrollment scan — one execution **per course**.
- `Filter: (course_id = c.id)` with **Rows Removed by Filter** — scans enrollments and discards non-matches each time.
- Timing is tiny on a toy dataset; the **plan shape** is what matters.

**Try:** `GET http://127.0.0.1:8000/report/course-enrollment-counts-slow`

---

## Optimized version (`JOIN` + `GROUP BY`)

**Handler:** `course_enrollment_counts` in `app/main.py`

```sql
SELECT c.id, c.name, COUNT(e.id) AS enrollment_count
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY c.id, c.name
ORDER BY c.id;
```

- Single pass: **HashAggregate** over a **Hash Right Join** (one join, one group-by).
- `LEFT JOIN` includes courses with **zero** enrollments (`enrollment_count = 0`).
- No per-row subplan; enrollment scan runs **once** (`loops=1`).

### EXPLAIN ANALYZE (sample: 10 courses, 10 enrollments)

```text
                                                            QUERY PLAN
--------------------------------------------------------------------------------------------------------------------------------
 Sort  (cost=60.49..60.66 rows=70 width=528) (actual time=0.167..0.170 rows=10 loops=1)
   Sort Key: c.id
   Sort Method: quicksort  Memory: 25kB
   ->  HashAggregate  (cost=57.64..58.34 rows=70 width=528) (actual time=0.131..0.135 rows=10 loops=1)
         Group Key: c.id
         Batches: 1  Memory Usage: 24kB
         ->  Hash Right Join  (cost=11.57..47.44 rows=2040 width=524) (actual time=0.108..0.119 rows=13 loops=1)
               Hash Cond: (e.course_id = c.id)
               ->  Seq Scan on enrollments e  (cost=0.00..30.40 rows=2040 width=8) (actual time=0.004..0.005 rows=10 loops=1)
               ->  Hash  (cost=10.70..10.70 rows=70 width=520) (actual time=0.078..0.079 rows=10 loops=1)
                     Buckets: 1024  Batches: 1  Memory Usage: 9kB
                     ->  Seq Scan on courses c  (cost=0.00..10.70 rows=70 width=520) (actual time=0.024..0.026 rows=10 loops=1)
 Planning Time: 0.501 ms
 Execution Time: 0.273 ms
(14 rows)
```

**What to notice**

- **HashAggregate** with `Group Key: c.id` — counts all courses in one step.
- **Hash Right Join** with `Hash Cond: (e.course_id = c.id)` — builds a hash from courses, probes with enrollments once.
- `Seq Scan on enrollments e` has **`loops=1`** (not 10) — single scan of the enrollment table.
- Lower **Planning Time** (0.501 ms vs 3.708 ms) and **Execution Time** (0.273 ms vs 0.817 ms) on this sample.

**Try:** `GET http://127.0.0.1:8000/report/course-enrollment-counts`

---

## Side-by-side difference

| | Slow (correlated subquery) | Optimized (`JOIN` + `GROUP BY`) |
|--|---------------------------|----------------------------------|
| Core pattern | **SubPlan** per course row | **HashAggregate** over **Hash Join** |
| Enrollment scans | `loops=10` (once per course) | `loops=1` (single scan) |
| Extra work | `Filter` + **Rows Removed by Filter: 9** each loop | Join hash match, then aggregate |
| Planning Time | 3.708 ms | 0.501 ms |
| Execution Time | 0.817 ms | 0.273 ms |

Same row counts on a small dataset; the optimized plan avoids repeated subquery work as tables grow.

---

## Learning exercise

1. Call both endpoints after seeding — payloads should match.
2. Run `EXPLAIN ANALYZE` for each SQL above against the `school` database.
3. Compare **SubPlan** + per-row `loops` on the slow plan vs **HashAggregate** + `loops=1` on enrollments for the optimized plan.
