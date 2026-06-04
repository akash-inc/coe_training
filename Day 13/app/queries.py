ENROLLMENT_COUNT_BY_COURSE_SQL = """
SELECT c.id, c.name, COUNT(e.id) AS enrollment_count
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY c.id, c.name
ORDER BY c.id
"""

ENROLLMENT_COUNT_BY_COURSE_SLOW_SQL = """
SELECT c.id, c.name,
  (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrollment_count
FROM courses c
ORDER BY c.id
"""
