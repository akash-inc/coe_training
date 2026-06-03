# EXPLAIN ANALYZE — `/report/course-enrollment-counts-slow`

This report endpoint runs a **correlated subquery**: for each course row, PostgreSQL counts matching enrollments. That pattern scales poorly as data grows (one subplan execution per course).

**Implementation:** `app/main.py` — `course_enrollment_counts_slow`

## SQL

```sql
SELECT c.id, c.name,
  (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollment_count
FROM courses c
ORDER BY c.id;
```

## How to reproduce

Seed data first (for example `POST /populate-all`), then in `psql` against the `school` database:

```sql
EXPLAIN ANALYZE
SELECT c.id, c.name,
  (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollment_count
FROM courses c
ORDER BY c.id;
```

Or call the API: `GET http://127.0.0.1:8000/report/course-enrollment-counts-slow`

## Result

Sample run with a small dataset (10 courses, 10 enrollments):

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

## What to notice

- **SubPlan 1** runs **once per course row** (`loops=10` on the aggregate and enrollment scan).
- Each subplan does a **sequential scan** on `enrollments` with `Filter: (course_id = c.id)` instead of using a targeted index lookup at scale.
- **Rows Removed by Filter: 9** — for each course, PostgreSQL reads enrollment rows and discards non-matches (wasteful when the table is large).
- Total time is low here because the dataset is tiny; the plan shape is what matters for learning.

## Better approach (direction)

Replace the correlated subquery with a **single grouped query** or a **JOIN + GROUP BY**, and ensure indexes on `enrollments(course_id)` (already present on the model) are used under realistic row counts.
