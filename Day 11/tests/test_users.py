import pytest


@pytest.mark.asyncio
async def test_get_users_empty(client):
    response = await client.get("/users")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_user_success(client, user_payload_factory):
    payload = user_payload_factory()
    response = await client.post("/users", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_user_validation_error(client):
    # name must be min_length=1
    payload = {"name": "", "email": "a@b.com"}
    response = await client.post("/users", json=payload)

    assert response.status_code == 422