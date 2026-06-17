from datetime import datetime, timezone

import pytest
from starlette.websockets import WebSocketDisconnect

from orm_models import CommentModel


def test_ws_echo(client):
    with client.websocket_connect("/ws/echo") as websocket:
        websocket.send_text("hello")
        assert websocket.receive_text() == "Echo: hello"


def test_list_comments_requires_auth(client):
    response = client.get("/tasks/1/comments")
    assert response.status_code == 401


def test_post_and_list_comments(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}

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


def test_patch_and_delete_comment(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}

    created = client.post(
        "/tasks/1/comments",
        json={"body": "Original"},
        headers=headers,
    )
    comment_id = created.json()["id"]

    updated = client.patch(
        f"/tasks/1/comments/{comment_id}",
        json={"body": "Updated"},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["body"] == "Updated"

    deleted = client.delete(f"/tasks/1/comments/{comment_id}", headers=headers)
    assert deleted.status_code == 204

    listed = client.get("/tasks/1/comments", headers=headers)
    assert listed.json() == []


def test_post_comment_on_nonexistent_task(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}
    response = client.post("/tasks/999/comments", json={"body": "Hello"}, headers=headers)
    assert response.status_code == 404


def test_patch_comment_by_other_user_returns_403(client, login_token, session_factory):
    with session_factory() as session:
        comment = CommentModel(
            task_id=1,
            body="Not your comment",
            author_email="other@example.com",
            created_at=datetime.now(timezone.utc),
        )
        session.add(comment)
        session.commit()
        comment_id = comment.id

    headers = {"Authorization": f"Bearer {login_token}"}
    response = client.patch(
        f"/tasks/1/comments/{comment_id}",
        json={"body": "Hijack"},
        headers=headers,
    )
    assert response.status_code == 403


def test_delete_comment_by_other_user_returns_403(client, login_token, session_factory):
    with session_factory() as session:
        comment = CommentModel(
            task_id=1,
            body="Not your comment",
            author_email="other@example.com",
            created_at=datetime.now(timezone.utc),
        )
        session.add(comment)
        session.commit()
        comment_id = comment.id

    headers = {"Authorization": f"Bearer {login_token}"}
    response = client.delete(f"/tasks/1/comments/{comment_id}", headers=headers)
    assert response.status_code == 403


def test_ws_rejects_invalid_token(client):
    with client.websocket_connect("/ws/tasks/1?token=invalid") as websocket:
        with pytest.raises(WebSocketDisconnect) as exc_info:
            websocket.receive_json()
    assert exc_info.value.code == 1008


def test_ws_snapshot_and_create(client, login_token):
    with client.websocket_connect(f"/ws/tasks/1?token={login_token}") as websocket:
        snapshot = websocket.receive_json()
        assert snapshot["type"] == "comments.snapshot"
        assert snapshot["comments"] == []

        websocket.send_json({"type": "comment.create", "body": "Live comment"})
        created = websocket.receive_json()
        assert created["type"] == "comment.created"
        assert created["comment"]["body"] == "Live comment"


def test_ws_broadcasts_to_second_client(client, login_token):
    with client.websocket_connect(f"/ws/tasks/1?token={login_token}") as first:
        first.receive_json()

        with client.websocket_connect(f"/ws/tasks/1?token={login_token}") as second:
            second.receive_json()
            first.send_json({"type": "comment.create", "body": "Shared update"})
            first_message = first.receive_json()
            second_message = second.receive_json()

    assert first_message["type"] == "comment.created"
    assert second_message["type"] == "comment.created"
    assert first_message["comment"]["id"] == second_message["comment"]["id"]


def test_ws_rejects_empty_comment(client, login_token):
    with client.websocket_connect(f"/ws/tasks/1?token={login_token}") as websocket:
        websocket.receive_json()
        websocket.send_json({"type": "comment.create", "body": "   "})
        error = websocket.receive_json()
        assert error["type"] == "error"


def test_comment_update_broadcasts_over_ws(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}

    created = client.post(
        "/tasks/1/comments",
        json={"body": "Before"},
        headers=headers,
    )
    comment_id = created.json()["id"]

    with client.websocket_connect(f"/ws/tasks/1?token={login_token}") as websocket:
        websocket.receive_json()

        client.patch(
            f"/tasks/1/comments/{comment_id}",
            json={"body": "After"},
            headers=headers,
        )

        message = websocket.receive_json()
        assert message["type"] == "comment.updated"
        assert message["comment"]["body"] == "After"


def test_comment_delete_broadcasts_over_ws(client, login_token):
    headers = {"Authorization": f"Bearer {login_token}"}

    created = client.post(
        "/tasks/1/comments",
        json={"body": "To delete"},
        headers=headers,
    )
    comment_id = created.json()["id"]

    with client.websocket_connect(f"/ws/tasks/1?token={login_token}") as websocket:
        websocket.receive_json()

        client.delete(f"/tasks/1/comments/{comment_id}", headers=headers)

        message = websocket.receive_json()
        assert message["type"] == "comment.deleted"
        assert message["comment_id"] == comment_id
