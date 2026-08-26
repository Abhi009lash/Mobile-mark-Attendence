import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ORGANIZATION_OWNER = "organization_owner"
    HR_ADMIN = "hr_admin"
    ATTENDANCE_ADMIN = "attendance_admin"
    BRANCH_MANAGER = "branch_manager"
    EMPLOYEE = "employee"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.EMPLOYEE.value, nullable=False, index=True)
    status = Column(String(50), default="active", nullable=False)  # active, inactive, suspended

    # Relationships
    organization = relationship("Organization", back_populates="users")
    branch = relationship("Branch", back_populates="users", foreign_keys=[branch_id])
    employee_profile = relationship("Employee", back_populates="user", uselist=False, cascade="all, delete-orphan")
