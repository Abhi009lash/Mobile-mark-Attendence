from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    user_limit = Column(Integer, default=50, nullable=False)        # Maximum allowed employees / users
    status = Column(String(50), default="active", nullable=False)  # active, inactive, suspended

    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    branches = relationship("Branch", back_populates="organization", cascade="all, delete-orphan")
    employees = relationship("Employee", back_populates="organization", cascade="all, delete-orphan")
    locations = relationship("Location", back_populates="organization", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="organization", cascade="all, delete-orphan")
    leave_types = relationship("LeaveType", back_populates="organization", cascade="all, delete-orphan")
    leave_requests = relationship("LeaveRequest", back_populates="organization", cascade="all, delete-orphan")
    policy = relationship("AttendancePolicy", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="organization", uselist=False, cascade="all, delete-orphan")
