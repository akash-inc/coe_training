"""Resolve or create a local user from GitHub profile data."""

from datetime import datetime, timezone

from models import User
from permissions import DEFAULT_ROLE
from repositories import UserRepository


async def resolve_user_from_github(
    profile: dict,
    email: str | None,
    user_repository: UserRepository,
) -> User:
    github_id = str(profile["id"])
    existing = await user_repository.get_by_github_id(github_id)
    if existing is not None:
        return existing

    if email:
        by_email = await user_repository.get_by_email(email)
        if by_email is not None:
            return await user_repository.link_github_id(by_email.id, github_id)

    login = profile.get("login") or "github-user"
    name = profile.get("name") or login
    resolved_email = email or f"{login}@users.noreply.github.com"

    user = User(
        name=name,
        email=resolved_email,
        password_hash=None,
        github_id=github_id,
        role=DEFAULT_ROLE,
        created_at=datetime.now(timezone.utc),
    )
    return await user_repository.create(user)
