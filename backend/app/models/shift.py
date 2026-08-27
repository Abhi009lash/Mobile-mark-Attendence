from sqlalchemy import Column, Integer, String, Time, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Shift(Base, TimestampMixin):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id", ondelete="CASCADE"), nullable=True, index=True)

    name = Column(String(100), nullable=False)           # e.g., Morning Shift, Evening Shift, Night Shift
    start_time = Column(Time, nullable=False)            # e.g., 09:00:00 or 21:00:00
    end_time = Column(Time, nullable=False)              # e.g., 18:00:00 or 06:00:00
    grace_minutes = Column(Integer, default=15, nullable=False)
    is_night_shift = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), default="active", nullable=False)

    # Relationships
    organization = relationship("Organization")
    branch = relationship("Branch")
    schedules = relationship("EmployeeShiftSchedule", back_populates="shift", cascade="all, delete-orphan")


class EmployeeShiftSchedule(Base, TimestampMixin):
    __tablename__ = "employee_shift_schedules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False, index=True)

    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=True)               # NULL means ongoing permanent assignment

    # Relationships
    organization = relationship("Organization")
    employee = relationship("Employee")
    shift = relationship("Shift", back_populates="schedules")
