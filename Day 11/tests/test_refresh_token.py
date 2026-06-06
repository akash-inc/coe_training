from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import select, text

from models import RefreshToken
from tests.conftest import register_user


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
async def test_refresh_token_rejects_expired_token(client, user_payload_factory, db_session):
    data = await _login_tokens(client, user_payload_factory)

    expired_at = datetime.now(timezone.utc) - timedelta(days=1)
    await db_session.execute(
        text("UPDATE refresh_tokens SET expires_at = :expired_at WHERE token = :token"),
        {"expired_at": expired_at, "token": data["refresh_token"]},
    )
    await db_session.commit()

    response = await client.post(
        "/token/refresh",
        json={"refresh_token": data["refresh_token"]},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Expired refresh token"

    result = await db_session.execute(
        select(RefreshToken).where(RefreshToken.token == data["refresh_token"])
    )
    assert result.scalar_one_or_none() is None


@pytest.mark.asyncio
async def test_refresh_token_rejects_invalid_token(client):
    response = await client.post(
        "/token/refresh",
        json={"refresh_token": "not-a-real-token"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_revokes_previous_refresh_tokens(client, user_payload_factory, db_session):
    first = await _login_tokens(client, user_payload_factory)

    second_response = await client.post(
        "/token",
        data={"username": "akash@example.com", "password": "Secret1a"},
    )
    assert second_response.status_code == 200
    second = second_response.json()
    assert first["refresh_token"] != second["refresh_token"]

    old_refresh = await client.post(
        "/token/refresh",
        json={"refresh_token": first["refresh_token"]},
    )
    assert old_refresh.status_code == 401

    new_refresh = await client.post(
        "/token/refresh",
        json={"refresh_token": second["refresh_token"]},
    )
    assert new_refresh.status_code == 200

    result = await db_session.execute(select(RefreshToken))
    assert len(result.scalars().all()) == 1


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
