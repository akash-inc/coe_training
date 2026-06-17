def test_list_tasks_requires_auth(client):
    response = client.get("/tasks")
    assert response.status_code == 401


def test_list_tasks_returns_seed_task(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}

    response = client.get("/tasks", headers=headers)
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 1
    assert tasks[0]["id"] == 1
    assert tasks[0]["title"] == "Task 1"


def test_create_task(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}

    response = client.post(
        "/tasks",
        json={"title": "New task", "description": "Details"},
        headers=headers,
    )
    assert response.status_code == 201
    task = response.json()
    assert task["title"] == "New task"
    assert task["completed"] is False


def test_update_task(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}

    created = client.post(
        "/tasks",
        json={"title": "To update", "description": ""},
        headers=headers,
    )
    task_id = created.json()["id"]

    updated = client.patch(
        f"/tasks/{task_id}",
        json={"completed": True, "title": "Renamed"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["completed"] is True
    assert updated.json()["title"] == "Renamed"


def test_delete_task(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}

    created = client.post(
        "/tasks",
        json={"title": "To delete", "description": ""},
        headers=headers,
    )
    task_id = created.json()["id"]

    deleted = client.delete(f"/tasks/{task_id}", headers=headers)
    assert deleted.status_code == 204

    listed = client.get("/tasks", headers=headers)
    assert all(item["id"] != task_id for item in listed.json())


def test_delete_task_removes_comments(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}

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


def test_get_task_not_found(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}

    response = client.get("/tasks/999", headers=headers)
    assert response.status_code == 404


def test_patch_task_not_found(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}

    response = client.patch("/tasks/999", json={"title": "Ghost"}, headers=headers)
    assert response.status_code == 404


def test_delete_task_not_found(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}

    response = client.delete("/tasks/999", headers=headers)
    assert response.status_code == 404
