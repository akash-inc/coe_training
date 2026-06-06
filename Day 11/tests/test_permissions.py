import pytest

from tests.conftest import auth_headers_for_role, register_user, set_user_role


@pytest.mark.asyncio
async def test_new_user_gets_editor_role(client, user_payload_factory):
    user = await register_user(client, user_payload_factory)
    assert user["role"] == "editor"


@pytest.mark.asyncio
async def test_viewer_can_read_tasks_but_not_create(client, db_session, user_payload_factory, task_payload_factory):
    headers = await auth_headers_for_role(client, db_session, user_payload_factory, role="viewer")

    list_response = await client.get("/tasks", headers=headers)
    assert list_response.status_code == 200

    create_response = await client.post("/tasks", json=task_payload_factory(), headers=headers)
    assert create_response.status_code == 403
    assert create_response.json()["detail"] == "Missing permission: tasks:write"


@pytest.mark.asyncio
async def test_viewer_cannot_delete_own_task(client, db_session, user_payload_factory, task_payload_factory):
    headers = await auth_headers_for_role(client, db_session, user_payload_factory, role="editor")
    user = await client.get("/me", headers=headers)
    assert user.status_code == 200
    created = await client.post("/tasks", json=task_payload_factory(), headers=headers)
    task_id = created.json()["id"]

    await set_user_role(db_session, user.json()["id"], "viewer")

    response = await client.delete(f"/tasks/{task_id}", headers=headers)
    assert response.status_code == 403
    assert response.json()["detail"] == "Missing permission: tasks:delete"


@pytest.mark.asyncio
async def test_admin_can_delete_user(client, db_session, user_payload_factory):
    target = await register_user(
        client,
        user_payload_factory,
        name="Target",
        email="target@example.com",
    )
    admin_headers = await auth_headers_for_role(
        client,
        db_session,
        user_payload_factory,
        role="admin",
        name="Admin",
        email="admin@example.com",
    )

    response = await client.delete(f"/users/{target['id']}", headers=admin_headers)
    assert response.status_code == 204

    list_response = await client.get("/users", headers=admin_headers)
    assert all(user["id"] != target["id"] for user in list_response.json())


@pytest.mark.asyncio
async def test_editor_cannot_delete_user(client, db_session, user_payload_factory):
    target = await register_user(
        client,
        user_payload_factory,
        name="Target",
        email="target@example.com",
    )
    editor_headers = await auth_headers_for_role(client, db_session, user_payload_factory, role="editor")

    response = await client.delete(f"/users/{target['id']}", headers=editor_headers)
    assert response.status_code == 403
    assert response.json()["detail"] == "Missing permission: users:delete"


@pytest.mark.asyncio
async def test_admin_cannot_delete_self(client, db_session, user_payload_factory):
    admin = await register_user(
        client,
        user_payload_factory,
        name="Admin",
        email="admin@example.com",
    )
    await set_user_role(db_session, admin["id"], "admin")
    token_response = await client.post(
        "/token",
        data={"username": "admin@example.com", "password": "Secret1a"},
    )
    admin_headers = {"Authorization": f"Bearer {token_response.json()['access_token']}"}

    response = await client.delete(f"/users/{admin['id']}", headers=admin_headers)
    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot delete your own account"
