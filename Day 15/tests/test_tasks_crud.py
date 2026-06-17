DEMO_USER = {"email": "test@example.com", "password": "password"}


def login_token(client) -> str:
    response = client.post("/token", json=DEMO_USER)
    assert response.status_code == 200
    return response.json()["access_token"]


def test_list_tasks_requires_auth(client):
    response = client.get("/tasks")
    assert response.status_code == 401


def test_list_tasks_returns_seed_task(client):
    token = login_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/tasks", headers=headers)
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 1
    assert tasks[0]["id"] == 1
    assert tasks[0]["title"] == "Task 1"


def test_create_update_delete_task(client):
    token = login_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    created = client.post(
        "/tasks",
        json={"title": "New task", "description": "Details"},
        headers=headers,
    )
    assert created.status_code == 201
    task = created.json()
    assert task["title"] == "New task"
    assert task["completed"] is False

    updated = client.patch(
        f"/tasks/{task['id']}",
        json={"completed": True, "title": "Renamed"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["completed"] is True
    assert updated.json()["title"] == "Renamed"

    deleted = client.delete(f"/tasks/{task['id']}", headers=headers)
    assert deleted.status_code == 204

    listed = client.get("/tasks", headers=headers)
    assert all(item["id"] != task["id"] for item in listed.json())


def test_delete_task_removes_comments(client):
    token = login_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    created = client.post(
        "/tasks",
        json={"title": "Temporary", "description": ""},
        headers=headers,
    )
    task_id = created.json()["id"]

    client.post(
        f"/tasks/{task_id}/comments",
        json={"body": "Gone with task"},
        headers=headers,
    )

    listed = client.get(f"/tasks/{task_id}/comments", headers=headers)
    assert len(listed.json()) == 1

    client.delete(f"/tasks/{task_id}", headers=headers)

    comments_after = client.get(f"/tasks/{task_id}/comments", headers=headers)
    assert comments_after.status_code == 404


def test_get_task_not_found(client):
    token = login_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/tasks/999", headers=headers)
    assert response.status_code == 404
