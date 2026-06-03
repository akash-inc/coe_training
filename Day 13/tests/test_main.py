def test_home(client):
    response = client.get("/")
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


def test_courses_with_students_selectin(client, populate_payload):
    client.post("/populate-all", json=populate_payload)

    response = client.get("/courses-with-students-selectin")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["name"] == "CS101"
    assert len(payload[0]["students"]) == 1
    assert payload[0]["students"][0]["email"] == "alice@example.com"
