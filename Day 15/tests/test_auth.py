from datetime import datetime, timedelta, timezone

import auth

DEMO_USER = {"email": "test@example.com", "password": "password"}


def test_token_refresh_returns_new_access_token(client):
    login_response = client.post("/token", json=DEMO_USER)
    refresh_token = login_response.json()["refresh_token"]

    response = client.post("/token/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_refresh_token_new_access_token_is_valid(client):
    login_response = client.post("/token", json=DEMO_USER)
    refresh_token = login_response.json()["refresh_token"]

    refresh_response = client.post("/token/refresh", json={"refresh_token": refresh_token})
    new_access_token = refresh_response.json()["access_token"]

    response = client.get("/me", headers={"Authorization": f"Bearer {new_access_token}"})
    assert response.status_code == 200
    assert response.json()["email"] == DEMO_USER["email"]


def test_refresh_with_invalid_token_returns_401(client):
    response = client.post("/token/refresh", json={"refresh_token": "not-a-real-token"})
    assert response.status_code == 401


def test_refresh_with_expired_token_returns_401(client):
    login_response = client.post("/token", json=DEMO_USER)
    refresh_token = login_response.json()["refresh_token"]

    email, _ = auth._refresh_tokens[refresh_token]
    auth._refresh_tokens[refresh_token] = (email, datetime.now(timezone.utc) - timedelta(seconds=1))

    response = client.post("/token/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 401


def test_login_revokes_previous_refresh_token(client):
    first_response = client.post("/token", json=DEMO_USER)
    first_refresh = first_response.json()["refresh_token"]

    # Second login for the same user must revoke the first refresh token
    client.post("/token", json=DEMO_USER)

    response = client.post("/token/refresh", json={"refresh_token": first_refresh})
    assert response.status_code == 401


def test_logout_invalidates_refresh_token(client):
    login_response = client.post("/token", json=DEMO_USER)
    refresh_token = login_response.json()["refresh_token"]

    logout_response = client.post("/logout", json={"refresh_token": refresh_token})
    assert logout_response.status_code == 204

    response = client.post("/token/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 401


def test_logout_with_unknown_token_is_noop(client):
    response = client.post("/logout", json={"refresh_token": "unknown-token"})
    assert response.status_code == 204
