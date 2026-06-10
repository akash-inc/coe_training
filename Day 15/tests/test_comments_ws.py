import pytest
from fastapi.testclient import TestClient

from main import app
from models.comments import reset_comments

client = TestClient(app)

DEMO_USER = {"email": "test@example.com", "password": "password"}


@pytest.fixture(autouse=True)
def clear_comments():
    reset_comments()
    yield
    reset_comments()


def login_token() -> str:
    response = client.post("/token", json=DEMO_USER)
    assert response.status_code == 200
    return response.json()["access_token"]


def test_ws_echo():
    with client.websocket_connect("/ws/echo") as websocket:
        websocket.send_text("hello")
        assert websocket.receive_text() == "Echo: hello"


def test_list_comments_requires_auth():
    response = client.get("/tasks/1/comments")
    assert response.status_code == 401


def test_post_and_list_comments():
    token = login_token()
    headers = {"Authorization": f"Bearer {token}"}

    empty = client.get("/tasks/1/comments", headers=headers)
    assert empty.status_code == 200
    assert empty.json() == []

    created = client.post(
        "/tasks/1/comments",
        json={"body": "REST comment"},
        headers=headers,
    )
    assert created.status_code == 200
    assert created.json()["body"] == "REST comment"

    listed = client.get("/tasks/1/comments", headers=headers)
    assert len(listed.json()) == 1


def test_ws_rejects_invalid_token():
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/tasks/1?token=invalid"):
            pass


def test_ws_snapshot_and_create():
    token = login_token()

    with client.websocket_connect(f"/ws/tasks/1?token={token}") as websocket:
        snapshot = websocket.receive_json()
        assert snapshot["type"] == "comments.snapshot"
        assert snapshot["comments"] == []

        websocket.send_json({"type": "comment.create", "body": "Live comment"})
        created = websocket.receive_json()
        assert created["type"] == "comment.created"
        assert created["comment"]["body"] == "Live comment"


def test_ws_broadcasts_to_second_client():
    token = login_token()

    with client.websocket_connect(f"/ws/tasks/1?token={token}") as first:
        first.receive_json()

        with client.websocket_connect(f"/ws/tasks/1?token={token}") as second:
            second.receive_json()
            first.send_json({"type": "comment.create", "body": "Shared update"})
            first_message = first.receive_json()
            second_message = second.receive_json()

    assert first_message["type"] == "comment.created"
    assert second_message["type"] == "comment.created"
    assert first_message["comment"]["id"] == second_message["comment"]["id"]


def test_ws_rejects_empty_comment():
    token = login_token()

    with client.websocket_connect(f"/ws/tasks/1?token={token}") as websocket:
        websocket.receive_json()
        websocket.send_json({"type": "comment.create", "body": "   "})
        error = websocket.receive_json()
        assert error["type"] == "error"
