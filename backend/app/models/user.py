import uuid
from enum import Enum
from typing import Optional
from sqlalchemy import String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ATTENDANCE_ADMIN = "ATTENDANCE_ADMIN"
    FIELD_EMPLOYEE = "FIELD_EMPLOYEE"


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(String(30), nullable=False)
    status: Mapped[UserStatus] = mapped_column(String(20), default=UserStatus.ACTIVE, nullable=False)

    organization = relationship("Organization", back_populates="users")
