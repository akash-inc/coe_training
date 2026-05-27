import pytest


async def _create_user(client, user_payload_factory):
    response = await client.post("/users", json=user_payload_factory())
    assert response.status_code == 201
    return response.json()


@pytest.mark.asyncio
async def test_get_tasks_empty(client):
    response = await client.get("/tasks")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_task_success(client, user_payload_factory, task_payload_factory):
    user = await _create_user(client, user_payload_factory)
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
async def test_create_task_user_not_found(client, task_payload_factory):
    payload = task_payload_factory(user_id=9999)
    response = await client.post("/tasks", json=payload)

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


@pytest.mark.asyncio
async def test_get_task_by_id_success(client, user_payload_factory, task_payload_factory):
    user = await _create_user(client, user_payload_factory)
    created = await client.post("/tasks", json=task_payload_factory(user_id=user["id"]))
    task_id = created.json()["id"]

    response = await client.get(f"/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["id"] == task_id


@pytest.mark.asyncio
async def test_get_task_by_id_not_found(client):
    response = await client.get("/tasks/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


@pytest.mark.asyncio
async def test_put_replace_task(client, user_payload_factory, task_payload_factory):
    user = await _create_user(client, user_payload_factory)
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
async def test_patch_task_partial_update(client, user_payload_factory, task_payload_factory):
    user = await _create_user(client, user_payload_factory)
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
async def test_delete_task(client, user_payload_factory, task_payload_factory):
    user = await _create_user(client, user_payload_factory)
    created = await client.post("/tasks", json=task_payload_factory(user_id=user["id"]))
    task_id = created.json()["id"]

    delete_response = await client.delete(f"/tasks/{task_id}")
    assert delete_response.status_code == 204

    get_response = await client.get(f"/tasks/{task_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_task_validation_error_priority(client, user_payload_factory, task_payload_factory):
    user = await _create_user(client, user_payload_factory)
    payload = task_payload_factory(user_id=user["id"], priority=10)  # max allowed is 5

    response = await client.post("/tasks", json=payload)
    assert response.status_code == 422