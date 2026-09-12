"""add_website_to_organizations

Revision ID: 50fdb9db2e8b
Revises: 634049619754
Create Date: 2026-09-12 13:55:12.349755

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '50fdb9db2e8b'
down_revision: Union[str, None] = '634049619754'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('organizations', sa.Column('website', sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column('organizations', 'website')

