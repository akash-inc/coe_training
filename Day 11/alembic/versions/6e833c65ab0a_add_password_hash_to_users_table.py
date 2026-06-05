"""add password hash to users table

Revision ID: 6e833c65ab0a
Revises: 070b6f988051
Create Date: 2026-06-05 13:36:46.673208

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6e833c65ab0a'
down_revision: Union[str, Sequence[str], None] = '070b6f988051'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("password_hash", sa.String(length=255), nullable=False, server_default=""),
    )
    op.alter_column("users", "password_hash", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "password_hash")
