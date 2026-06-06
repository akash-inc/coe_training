from typing import Set

from fastapi import Depends, HTTPException

from auth import get_current_user
from models import User

ROLE_PERMISSIONS: dict[str, Set[str]] = {
    "admin": {
        "users:read",
        "users:write",
        "users:delete",
        "tasks:read",
        "tasks:write",
        "tasks:delete",
    },
    "editor": {
        "tasks:read",
        "tasks:write",
        "tasks:delete",
        "users:read",
    },
    "viewer": {
        "tasks:read",
        "users:read",
    },
}

DEFAULT_ROLE = "editor"


def get_permissions(role: str) -> Set[str]:
    return ROLE_PERMISSIONS.get(role, set())


def require_permission(permission: str):
    async def checker(current_user: User = Depends(get_current_user)) -> User:
        perms = get_permissions(current_user.role)
        if permission not in perms:
            raise HTTPException(
                status_code=403,
                detail=f"Missing permission: {permission}",
            )
        return current_user

    return checker
