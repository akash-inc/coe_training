import pytest

from tests.conftest import login_user, register_user


async def _current_user(client, auth_headers):
    response = await client.get("/me", headers=auth_headers)
    assert response.status_code == 200
    return response.json()


@pytest.mark.asyncio
async def test_get_tasks_returns_empty_list(client, auth_headers):
    response = await client.get("/tasks", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_post_tasks_creates_task(client, task_payload_factory, auth_headers):
    user = await _current_user(client, auth_headers)
    payload = task_payload_factory()

    response = await client.post("/tasks", json=payload, headers=auth_headers)
    assert response.status_code == 201

    data = response.json()
    assert data["title"] == payload["title"]
    assert data["user_id"] == user["id"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.asyncio
async def test_get_task_by_id_returns_task(client, task_payload_factory, auth_headers):
    await _current_user(client, auth_headers)
    created = await client.post("/tasks", json=task_payload_factory(), headers=auth_headers)
    task_id = created.json()["id"]

    response = await client.get(f"/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == task_id


@pytest.mark.asyncio
async def test_get_task_by_id_returns_404_when_missing(client, auth_headers):
    response = await client.get("/tasks/9999", headers=auth_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


@pytest.mark.asyncio
async def test_put_task_replaces_existing_task(client, task_payload_factory, auth_headers):
    await _current_user(client, auth_headers)
    created = await client.post("/tasks", json=task_payload_factory(), headers=auth_headers)
    task_id = created.json()["id"]

    payload = task_payload_factory(
        title="Replaced title",
        status="in_progress",
        priority=5,
    )
    response = await client.put(f"/tasks/{task_id}", json=payload, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Replaced title"
    assert data["status"] == "in_progress"
    assert data["priority"] == 5


@pytest.mark.asyncio
async def test_patch_task_updates_only_provided_fields(client, task_payload_factory, auth_headers):
    await _current_user(client, auth_headers)
    created = await client.post("/tasks", json=task_payload_factory(), headers=auth_headers)
    task_id = created.json()["id"]

    patch_payload = {"status": "done"}
    response = await client.patch(f"/tasks/{task_id}", json=patch_payload, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "done"
    assert data["title"] == "Learn pytest"


@pytest.mark.asyncio
async def test_delete_task_removes_task(client, task_payload_factory, auth_headers):
    await _current_user(client, auth_headers)
    created = await client.post("/tasks", json=task_payload_factory(), headers=auth_headers)
    task_id = created.json()["id"]

    delete_response = await client.delete(f"/tasks/{task_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    get_response = await client.get(f"/tasks/{task_id}", headers=auth_headers)
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_post_tasks_returns_422_for_invalid_priority(client, task_payload_factory, auth_headers):
    await _current_user(client, auth_headers)
    payload = task_payload_factory(priority=10)

    response = await client.post("/tasks", json=payload, headers=auth_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_put_task_returns_404_when_missing(client, task_payload_factory, auth_headers):
    await _current_user(client, auth_headers)
    payload = task_payload_factory()

    response = await client.put("/tasks/9999", json=payload, headers=auth_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


@pytest.mark.asyncio
async def test_patch_task_returns_404_when_missing(client, auth_headers):
    response = await client.patch("/tasks/9999", json={"status": "done"}, headers=auth_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


@pytest.mark.asyncio
async def test_delete_task_returns_404_when_missing(client, auth_headers):
    response = await client.delete("/tasks/9999", headers=auth_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


@pytest.mark.asyncio
async def test_post_tasks_returns_422_for_invalid_status(client, task_payload_factory, auth_headers):
    await _current_user(client, auth_headers)
    payload = task_payload_factory(status="invalid_status")

    response = await client.post("/tasks", json=payload, headers=auth_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_patch_task_returns_422_for_invalid_status(client, task_payload_factory, auth_headers):
    await _current_user(client, auth_headers)
    created = await client.post("/tasks", json=task_payload_factory(), headers=auth_headers)
    task_id = created.json()["id"]

    response = await client.patch(f"/tasks/{task_id}", json={"status": "invalid_status"}, headers=auth_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_user_cannot_access_another_users_task(client, user_payload_factory, task_payload_factory):
    await register_user(client, user_payload_factory, email="owner@example.com")
    owner_token = await login_user(client, email="owner@example.com")
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    created = await client.post("/tasks", json=task_payload_factory(), headers=owner_headers)
    task_id = created.json()["id"]

    await register_user(
        client,
        user_payload_factory,
        name="Other",
        email="other@example.com",
    )
    other_token = await login_user(client, email="other@example.com")
    other_headers = {"Authorization": f"Bearer {other_token}"}

    response = await client.get(f"/tasks/{task_id}", headers=other_headers)
    assert response.status_code == 403
