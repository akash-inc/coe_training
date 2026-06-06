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
async def test_admin_can_access_another_users_task(
    client,
    db_session,
    user_payload_factory,
    task_payload_factory,
):
    owner_headers = await auth_headers_for_role(
        client,
        db_session,
        user_payload_factory,
        role="editor",
        email="owner@example.com",
    )
    created = await client.post("/tasks", json=task_payload_factory(), headers=owner_headers)
    task_id = created.json()["id"]

    admin_headers = await auth_headers_for_role(
        client,
        db_session,
        user_payload_factory,
        role="admin",
        name="Admin",
        email="admin@example.com",
    )

    response = await client.get(f"/tasks/{task_id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["id"] == task_id

    patch_response = await client.patch(
        f"/tasks/{task_id}",
        json={"status": "done"},
        headers=admin_headers,
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["status"] == "done"


@pytest.mark.asyncio
async def test_admin_can_list_user_tasks_with_query_param(
    client,
    db_session,
    user_payload_factory,
    task_payload_factory,
):
    owner_headers = await auth_headers_for_role(
        client,
        db_session,
        user_payload_factory,
        role="editor",
        email="owner@example.com",
    )
    owner_user = await client.get("/me", headers=owner_headers)
    owner_id = owner_user.json()["id"]
    await client.post("/tasks", json=task_payload_factory(title="Owner task"), headers=owner_headers)

    admin_headers = await auth_headers_for_role(
        client,
        db_session,
        user_payload_factory,
        role="admin",
        name="Admin",
        email="admin@example.com",
    )
    await client.post("/tasks", json=task_payload_factory(title="Admin task"), headers=admin_headers)

    owner_tasks = await client.get("/tasks", params={"user_id": owner_id}, headers=admin_headers)
    assert owner_tasks.status_code == 200
    assert {task["title"] for task in owner_tasks.json()} == {"Owner task"}

    own_tasks = await client.get("/tasks", headers=admin_headers)
    assert own_tasks.status_code == 200
    assert {task["title"] for task in own_tasks.json()} == {"Admin task"}


@pytest.mark.asyncio
async def test_non_admin_cannot_list_other_users_tasks(
    client,
    db_session,
    user_payload_factory,
    task_payload_factory,
):
    owner_headers = await auth_headers_for_role(
        client,
        db_session,
        user_payload_factory,
        role="editor",
        email="owner@example.com",
    )
    owner_user = await client.get("/me", headers=owner_headers)
    owner_id = owner_user.json()["id"]

    other_headers = await auth_headers_for_role(
        client,
        db_session,
        user_payload_factory,
        role="editor",
        name="Other",
        email="other@example.com",
    )

    response = await client.get("/tasks", params={"user_id": owner_id}, headers=other_headers)
    assert response.status_code == 403


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
