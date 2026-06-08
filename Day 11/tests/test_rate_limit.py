import pytest
from limits import parse

from main import limiter
from rate_limit import get_rate_limit_key
from tests.conftest import auth_headers_for_role


@pytest.fixture
def enabled_rate_limits():
    limiter.enabled = True
    me_limit = limiter._route_limits["main.read_current_user"][0]
    original_me_rate = me_limit.limit
    me_limit.limit = parse("2/minute")
    limiter.reset()
    yield
    limiter.enabled = False
    me_limit.limit = original_me_rate
    limiter.reset()


def test_rate_limit_key_uses_user_id_from_token():
    from auth import create_access_token
    from starlette.requests import Request

    token = create_access_token({"sub": "42"})
    scope = {
        "type": "http",
        "headers": [(b"authorization", f"Bearer {token}".encode())],
        "client": ("127.0.0.1", 12345),
    }
    request = Request(scope)

    assert get_rate_limit_key(request) == "user:42"


def test_rate_limit_key_falls_back_to_ip_without_token():
    from starlette.requests import Request

    scope = {"type": "http", "headers": [], "client": ("127.0.0.1", 12345)}
    request = Request(scope)

    assert get_rate_limit_key(request) == "127.0.0.1"


@pytest.mark.asyncio
async def test_rate_limit_is_per_user(client, user_payload_factory, db_session, enabled_rate_limits):
    user_a_headers = await auth_headers_for_role(
        client,
        db_session,
        user_payload_factory,
        role="editor",
        email="user-a@example.com",
    )
    user_b_headers = await auth_headers_for_role(
        client,
        db_session,
        user_payload_factory,
        role="editor",
        email="user-b@example.com",
    )
    limiter.reset()

    for _ in range(2):
        response = await client.get("/me", headers=user_a_headers)
        assert response.status_code == 200

    limited = await client.get("/me", headers=user_a_headers)
    assert limited.status_code == 429
    assert limited.json()["detail"] == "Rate limit exceeded"

    still_allowed = await client.get("/me", headers=user_b_headers)
    assert still_allowed.status_code == 200


@pytest.mark.asyncio
async def test_login_rate_limit_uses_client_ip(client, user_payload_factory, enabled_rate_limits):
    payload = user_payload_factory(email="login-limit@example.com")
    await client.post("/users", json=payload)

    for _ in range(10):
        response = await client.post(
            "/token",
            data={"username": payload["email"], "password": payload["password"]},
        )
        assert response.status_code == 200

    blocked = await client.post(
        "/token",
        data={"username": payload["email"], "password": payload["password"]},
    )
    assert blocked.status_code == 429


@pytest.mark.asyncio
async def test_register_rate_limit_uses_client_ip(client, user_payload_factory, enabled_rate_limits):
    for index in range(5):
        response = await client.post(
            "/users",
            json=user_payload_factory(email=f"register-{index}@example.com"),
        )
        assert response.status_code == 201

    blocked = await client.post(
        "/users",
        json=user_payload_factory(email="register-blocked@example.com"),
    )
    assert blocked.status_code == 429
