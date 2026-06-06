import pytest

from tests.conftest import login_user, register_user


async def _login_tokens(client, user_payload_factory):
    await register_user(client, user_payload_factory)
    response = await client.post(
        "/token",
        data={"username": "akash@example.com", "password": "Secret1a"},
    )
    assert response.status_code == 200
    return response.json()


@pytest.mark.asyncio
async def test_login_returns_refresh_token(client, user_payload_factory):
    data = await _login_tokens(client, user_payload_factory)
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_refresh_token_returns_new_access_token(client, user_payload_factory):
    data = await _login_tokens(client, user_payload_factory)

    response = await client.post(
        "/token/refresh",
        json={"refresh_token": data["refresh_token"]},
    )
    assert response.status_code == 200
    refreshed = response.json()
    assert refreshed["access_token"]
    assert refreshed["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_refresh_token_rejects_invalid_token(client):
    response = await client.post(
        "/token/refresh",
        json={"refresh_token": "not-a-real-token"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_logout_revokes_refresh_token(client, user_payload_factory):
    data = await _login_tokens(client, user_payload_factory)

    logout_response = await client.post(
        "/logout",
        json={"refresh_token": data["refresh_token"]},
    )
    assert logout_response.status_code == 204

    refresh_response = await client.post(
        "/token/refresh",
        json={"refresh_token": data["refresh_token"]},
    )
    assert refresh_response.status_code == 401
