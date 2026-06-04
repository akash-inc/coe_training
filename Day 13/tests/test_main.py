def test_home(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, World!"}


def test_get_students_empty(client):
    response = client.get("/students")
    assert response.status_code == 200
    assert response.json() == []


def test_populate_all(client, populate_payload):
    response = client.post("/populate-all", json=populate_payload)
    assert response.status_code == 200
    body = response.json()
    assert body["students_added"] == 1
    assert body["courses_added"] == 1
    assert body["enrollments_added"] == 1

    students_response = client.get("/students")
    assert students_response.status_code == 200
    assert len(students_response.json()) == 1
    assert students_response.json()[0]["email"] == "alice@example.com"


def test_populate_all_bulk_matches_row_counts(client, populate_payload):
    response = client.post("/populate-all-bulk", json=populate_payload)
    assert response.status_code == 200
    body = response.json()
    assert body["students_added"] == 1
    assert body["courses_added"] == 1
    assert body["enrollments_added"] == 1

    report = client.get("/report/course-enrollment-counts")
    assert report.status_code == 200
    assert report.json() == EXPECTED_ENROLLMENT_COUNTS


def test_populate_all_bulk_large_seed(client):
    payload = _build_large_seed_payload(course_count=50, enrollment_count=200, student_count=40)
    response = client.post("/populate-all-bulk", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["students_added"] == 40
    assert body["courses_added"] == 50
    assert body["enrollments_added"] == 200


def test_bulk_update_students(client, populate_payload):
    client.post("/populate-all", json=populate_payload)

    response = client.post(
        "/bulk-update",
        json={"students": [{"id": 1, "name": "Updated Alice"}], "courses": [], "enrollments": []},
    )
    assert response.status_code == 200
    assert response.json()["students_updated"] == 1

    students = client.get("/students").json()
    assert students[0]["name"] == "Updated Alice"


def test_student_pg_upsert_updates_existing_row(client, populate_payload):
    client.post("/populate-all", json=populate_payload)

    updated_payload = {
        **populate_payload["students"][0],
        "name": "Alice Updated Via PG",
    }
    response = client.post("/students/pg-upsert", json=updated_payload)
    assert response.status_code == 200
    assert response.json()["name"] == "Alice Updated Via PG"

    students = client.get("/students").json()
    assert len(students) == 1
    assert students[0]["email"] == "alice@example.com"
    assert students[0]["name"] == "Alice Updated Via PG"


def test_course_pg_upsert_updates_existing_row(client, populate_payload):
    client.post("/populate-all", json=populate_payload)

    updated_payload = {
        **populate_payload["courses"][0],
        "description": "Updated via ON CONFLICT",
    }
    response = client.post("/courses/pg-upsert", json=updated_payload)
    assert response.status_code == 200
    assert response.json()["description"] == "Updated via ON CONFLICT"

    courses = client.get("/courses").json()
    assert len(courses) == 1
    assert courses[0]["name"] == "CS101"


def _build_large_seed_payload(
    course_count: int = 50,
    enrollment_count: int = 200,
    student_count: int = 40,
) -> dict:
    students = [
        {
            "name": f"Student {index + 1}",
            "age": 18 + (index % 10),
            "email": f"student{index + 1}@lab.example",
            "phone": f"+1415555{3000 + index:04d}",
            "subjects": ["Math"],
            "subject_grades": {"Math": "B+"},
        }
        for index in range(student_count)
    ]
    courses = [
        {
            "name": f"Course {index + 1:03d}",
            "description": f"Benchmark course {index + 1}",
            "subjects": ["Math"],
        }
        for index in range(course_count)
    ]
    enrollments = []
    seen: set[str] = set()
    student_ref = 0
    course_ref = 0
    while len(enrollments) < enrollment_count:
        key = f"{student_ref}-{course_ref}"
        if key not in seen:
            seen.add(key)
            enrollments.append({"student_ref": student_ref, "course_ref": course_ref})
        course_ref = (course_ref + 1) % course_count
        if course_ref == 0:
            student_ref = (student_ref + 1) % student_count

    return {
        "reset": True,
        "students": students,
        "courses": courses,
        "enrollments": enrollments,
    }


EXPECTED_ENROLLMENT_COUNTS = [
    {"id": 1, "name": "CS101", "enrollment_count": 1},
]


def test_course_enrollment_counts_slow(client, populate_payload):
    client.post("/populate-all", json=populate_payload)

    response = client.get("/report/course-enrollment-counts-slow")
    assert response.status_code == 200
    assert response.json() == EXPECTED_ENROLLMENT_COUNTS


def test_course_enrollment_counts(client, populate_payload):
    client.post("/populate-all", json=populate_payload)

    response = client.get("/report/course-enrollment-counts")
    assert response.status_code == 200
    assert response.json() == EXPECTED_ENROLLMENT_COUNTS


def test_course_enrollment_counts_raw_matches_sqlalchemy(client, populate_payload):
    client.post("/populate-all", json=populate_payload)

    sqlalchemy_response = client.get("/report/course-enrollment-counts")
    raw_response = client.get("/report/course-enrollment-counts-raw")

    assert sqlalchemy_response.status_code == 200
    assert raw_response.status_code == 200
    assert raw_response.json() == sqlalchemy_response.json()
    assert int(sqlalchemy_response.headers["X-Sql-Queries"]) == 1
    assert int(raw_response.headers["X-Sql-Queries"]) == 1
    assert raw_response.headers["X-Db-Pool-Mode"] == "raw"


def test_populate_sets_sql_query_header(client, populate_payload):
    response = client.post("/populate-all", json=populate_payload)
    assert response.status_code == 200
    assert int(response.headers["X-Sql-Queries"]) > 0


def test_naive_endpoint_runs_more_sql_than_selectin(client, populate_payload):
    client.post("/populate-all", json=populate_payload)

    naive = client.get("/courses-with-students-naive")
    selectin = client.get("/courses-with-students-selectin")

    assert naive.status_code == 200
    assert selectin.status_code == 200
    assert "X-Sql-Queries" in naive.headers
    assert "X-Sql-Queries" in selectin.headers

    naive_sql = int(naive.headers["X-Sql-Queries"])
    selectin_sql = int(selectin.headers["X-Sql-Queries"])
    assert naive_sql > selectin_sql


def test_health_pool_returns_status(client):
    response = client.get("/health/pool")
    assert response.status_code == 200
    body = response.json()
    assert body["pool_class"] == "QueuePool"
    assert "pool_size" in body
    assert "checked_out" in body


def test_benchmark_db_ping_pooled_uses_queue_pool(client):
    response = client.get("/benchmark/db-ping-pooled")
    assert response.status_code == 200
    assert response.headers["X-Db-Pool-Mode"] == "pooled"
    assert response.json()["mode"] == "pooled"
    assert response.json()["pool"]["pool_class"] == "QueuePool"


def test_benchmark_db_ping_unpooled_uses_null_pool(client):
    response = client.get("/benchmark/db-ping-unpooled")
    assert response.status_code == 200
    assert response.headers["X-Db-Pool-Mode"] == "unpooled"
    assert response.json()["mode"] == "unpooled"
    assert response.json()["pool"]["pool_class"] == "NullPool"


def test_courses_with_students_selectin(client, populate_payload):
    client.post("/populate-all", json=populate_payload)

    response = client.get("/courses-with-students-selectin")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["name"] == "CS101"
    assert len(payload[0]["students"]) == 1
    assert payload[0]["students"][0]["email"] == "alice@example.com"
