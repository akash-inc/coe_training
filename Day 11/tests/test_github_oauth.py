import pytest
from unittest.mock import AsyncMock, patch

from github_auth import resolve_user_from_github
from github_oauth import create_github_oauth_state, verify_github_oauth_state
from tests.conftest import register_user


@pytest.mark.asyncio
async def test_github_oauth_state_roundtrip():
    state = create_github_oauth_state()
    assert verify_github_oauth_state(state) is True
    assert verify_github_oauth_state("not-a-valid-state") is False


@pytest.mark.asyncio
async def test_resolve_user_from_github_creates_user(client, user_payload_factory, db_session):
    from repositories import SqlAlchemyUserRepository

    repository = SqlAlchemyUserRepository(db_session)
    profile = {"id": 424242, "login": "octocat", "name": "Octo Cat", "email": "octo@example.com"}

    user = await resolve_user_from_github(profile, "octo@example.com", repository)
    assert user.github_id == "424242"
    assert user.email == "octo@example.com"
    assert user.password_hash is None


@pytest.mark.asyncio
async def test_resolve_user_from_github_links_existing_email(client, user_payload_factory, db_session):
    from repositories import SqlAlchemyUserRepository

    repository = SqlAlchemyUserRepository(db_session)
    await register_user(client, user_payload_factory, email="existing@example.com")

    profile = {"id": 999001, "login": "linked", "name": "Linked User"}
    user = await resolve_user_from_github(profile, "existing@example.com", repository)

    assert user.email == "existing@example.com"
    assert user.github_id == "999001"


@pytest.mark.asyncio
async def test_github_login_redirects_when_configured(client):
    with patch("main.github_oauth_configured", return_value=True), patch(
        "main.build_github_authorize_url",
        return_value="https://github.com/login/oauth/authorize?client_id=test",
    ):
        response = await client.get("/auth/github/login", follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"].startswith("https://github.com/login/oauth/authorize")


@pytest.mark.asyncio
async def test_github_login_unavailable_when_not_configured(client):
    with patch("main.github_oauth_configured", return_value=False):
        response = await client.get("/auth/github/login")
    assert response.status_code == 503


@pytest.mark.asyncio
async def test_github_callback_issues_app_tokens(client, db_session):
    state = create_github_oauth_state()
    profile = {"id": 123456, "login": "ghuser", "name": "GH User", "email": "gh@example.com"}

    with patch("main.verify_github_oauth_state", return_value=True), patch(
        "main.exchange_github_code",
        new=AsyncMock(return_value="gh-access-token"),
    ), patch(
        "main.fetch_github_profile",
        new=AsyncMock(return_value=profile),
    ), patch(
        "main.fetch_github_primary_email",
        new=AsyncMock(return_value="gh@example.com"),
    ):
        response = await client.get(
            "/auth/github/callback",
            params={"code": "abc123", "state": state},
            follow_redirects=False,
        )

    assert response.status_code == 302
    assert "access_token=" in response.headers["location"]
    assert "refresh_token=" in response.headers["location"]
    assert response.headers["location"].startswith("http://127.0.0.1:5173/auth/callback")


@pytest.mark.asyncio
async def test_password_login_rejects_github_only_user(client, db_session, user_payload_factory):
    from repositories import SqlAlchemyUserRepository

    repository = SqlAlchemyUserRepository(db_session)
    profile = {"id": 777888, "login": "oauthonly", "name": "OAuth Only"}
    await resolve_user_from_github(profile, "oauthonly@example.com", repository)

    response = await client.post(
        "/token",
        data={"username": "oauthonly@example.com", "password": "Secret1a"},
    )
    assert response.status_code == 401
