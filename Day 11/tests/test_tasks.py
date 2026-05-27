import pytest


async def _create_user_for_task_tests(client, user_payload_factory):
    response = await client.post("/users", json=user_payload_factory())
    assert response.status_code == 201
    return response.json()


@pytest.mark.asyncio
async def test_get_tasks_returns_empty_list(client):
    response = await client.get("/tasks")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_post_tasks_creates_task(client, user_payload_factory, task_payload_factory):
    user = await _create_user_for_task_tests(client, user_payload_factory)
    payload = task_payload_factory(user_id=user["id"])

    response = await client.post("/tasks", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["title"] == payload["title"]
    assert data["user_id"] == user["id"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.asyncio
async def test_post_tasks_returns_404_when_user_not_found(client, task_payload_factory):
    payload = task_payload_factory(user_id=9999)
    response = await client.post("/tasks", json=payload)

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.asyncio
async def test_get_task_by_id_returns_task(client, user_payload_factory, task_payload_factory):
    user = await _create_user_for_task_tests(client, user_payload_factory)
    created = await client.post("/tasks", json=task_payload_factory(user_id=user["id"]))
    task_id = created.json()["id"]

    response = await client.get(f"/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["id"] == task_id


@pytest.mark.asyncio
async def test_get_task_by_id_returns_404_when_missing(client):
    response = await client.get("/tasks/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


@pytest.mark.asyncio
async def test_put_task_replaces_existing_task(client, user_payload_factory, task_payload_factory):
    user = await _create_user_for_task_tests(client, user_payload_factory)
    created = await client.post("/tasks", json=task_payload_factory(user_id=user["id"]))
    task_id = created.json()["id"]

    payload = task_payload_factory(
        user_id=user["id"],
        title="Replaced title",
        status="in_progress",
        priority=5,
    )
    response = await client.put(f"/tasks/{task_id}", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Replaced title"
    assert data["status"] == "in_progress"
    assert data["priority"] == 5


@pytest.mark.asyncio
async def test_patch_task_updates_only_provided_fields(client, user_payload_factory, task_payload_factory):
    user = await _create_user_for_task_tests(client, user_payload_factory)
    created = await client.post("/tasks", json=task_payload_factory(user_id=user["id"]))
    task_id = created.json()["id"]

    patch_payload = {"status": "done"}
    response = await client.patch(f"/tasks/{task_id}", json=patch_payload)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "done"
    # unchanged field check
    assert data["title"] == "Learn pytest"


@pytest.mark.asyncio
async def test_delete_task_removes_task(client, user_payload_factory, task_payload_factory):
    user = await _create_user_for_task_tests(client, user_payload_factory)
    created = await client.post("/tasks", json=task_payload_factory(user_id=user["id"]))
    task_id = created.json()["id"]

    delete_response = await client.delete(f"/tasks/{task_id}")
    assert delete_response.status_code == 204

    get_response = await client.get(f"/tasks/{task_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_post_tasks_returns_422_for_invalid_priority(client, user_payload_factory, task_payload_factory):
    user = await _create_user_for_task_tests(client, user_payload_factory)
    payload = task_payload_factory(user_id=user["id"], priority=10)  # max allowed is 5

    response = await client.post("/tasks", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_put_task_returns_404_when_missing(client, user_payload_factory, task_payload_factory):
    user = await _create_user_for_task_tests(client, user_payload_factory)
    payload = task_payload_factory(user_id=user["id"])

    response = await client.put("/tasks/9999", json=payload)
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


@pytest.mark.asyncio
async def test_patch_task_returns_404_when_missing(client):
    response = await client.patch("/tasks/9999", json={"status": "done"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


@pytest.mark.asyncio
async def test_delete_task_returns_404_when_missing(client):
    response = await client.delete("/tasks/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


@pytest.mark.asyncio
async def test_post_tasks_returns_422_for_invalid_status(client, user_payload_factory, task_payload_factory):
    user = await _create_user_for_task_tests(client, user_payload_factory)
    payload = task_payload_factory(user_id=user["id"], status="invalid_status")

    response = await client.post("/tasks", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_patch_task_returns_422_for_invalid_status(client, user_payload_factory, task_payload_factory):
    user = await _create_user_for_task_tests(client, user_payload_factory)
    created = await client.post("/tasks", json=task_payload_factory(user_id=user["id"]))
    task_id = created.json()["id"]

    response = await client.patch(f"/tasks/{task_id}", json={"status": "invalid_status"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_post_tasks_returns_422_for_non_positive_user_id(client, task_payload_factory):
    payload = task_payload_factory(user_id=0)
    response = await client.post("/tasks", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_put_task_returns_422_for_non_positive_user_id(client, user_payload_factory, task_payload_factory):
    user = await _create_user_for_task_tests(client, user_payload_factory)
    created = await client.post("/tasks", json=task_payload_factory(user_id=user["id"]))
    task_id = created.json()["id"]

    payload = task_payload_factory(user_id=-1)
    response = await client.put(f"/tasks/{task_id}", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_patch_task_returns_422_for_non_positive_user_id(client, user_payload_factory, task_payload_factory):
    user = await _create_user_for_task_tests(client, user_payload_factory)
    created = await client.post("/tasks", json=task_payload_factory(user_id=user["id"]))
    task_id = created.json()["id"]

    response = await client.patch(f"/tasks/{task_id}", json={"user_id": 0})
    assert response.status_code == 422