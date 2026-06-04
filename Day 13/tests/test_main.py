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
