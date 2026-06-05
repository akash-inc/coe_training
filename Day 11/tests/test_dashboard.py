import pytest


@pytest.mark.asyncio
async def test_dashboard_requires_auth(client):
    response = await client.get("/dashboard")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_dashboard_returns_user_and_task_counts(
    client,
    auth_headers,
    task_payload_factory,
):
    await client.post("/tasks", json=task_payload_factory(), headers=auth_headers)
    await client.post(
        "/tasks",
        json=task_payload_factory(status="done"),
        headers=auth_headers,
    )

    response = await client.get("/dashboard", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["user"]["email"] == "akash@example.com"
    assert data["task_counts"]["total"] == 2
    assert data["task_counts"]["open"] == 1
    assert data["task_counts"]["done"] == 1
