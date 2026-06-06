"""add github oauth to users

Revision ID: c3f1a8b2d9e0
Revises: b8e4a1c92d0f
Create Date: 2026-06-06 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c3f1a8b2d9e0"
down_revision: Union[str, Sequence[str], None] = "b8e4a1c92d0f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("github_id", sa.String(length=255), nullable=True))
    op.create_unique_constraint("uq_users_github_id", "users", ["github_id"])
    op.alter_column("users", "password_hash", existing_type=sa.String(length=255), nullable=True)


def downgrade() -> None:
    op.alter_column("users", "password_hash", existing_type=sa.String(length=255), nullable=False)
    op.drop_constraint("uq_users_github_id", "users", type_="unique")
    op.drop_column("users", "github_id")
