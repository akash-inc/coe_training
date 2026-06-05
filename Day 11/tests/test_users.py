import pytest

from tests.conftest import register_user


@pytest.mark.asyncio
async def test_get_users_empty(client, auth_headers):
    response = await client.get("/users", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


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
    assert "password" not in data


@pytest.mark.asyncio
async def test_create_user_validation_error(client):
    payload = {"name": "", "email": "a@b.com", "password": "secret123"}
    response = await client.post("/users", json=payload)

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_users_requires_auth(client, user_payload_factory):
    await register_user(client, user_payload_factory)
    response = await client.get("/users")
    assert response.status_code == 401
