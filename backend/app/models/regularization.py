import enum
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class RegularizationRequestType(str, enum.Enum):
    MISSED_CHECK_IN = "missed_check_in"
    MISSED_CHECK_OUT = "missed_check_out"
    MISSED_BOTH = "missed_both"
    ON_DUTY = "on_duty"
    LATE_WAIVER = "late_waiver"


class RegularizationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class AttendanceRegularization(Base, TimestampMixin):
    __tablename__ = "attendance_regularizations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    attendance_id = Column(Integer, ForeignKey("attendance.id", ondelete="SET NULL"), nullable=True, index=True)

    request_type = Column(String(50), nullable=False)
    attendance_date = Column(Date, nullable=False, index=True)
    requested_check_in = Column(DateTime(timezone=True), nullable=True)
    requested_check_out = Column(DateTime(timezone=True), nullable=True)

    reason = Column(Text, nullable=False)
    status = Column(String(50), default=RegularizationStatus.PENDING.value, nullable=False)

    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Prevent duplicate pending requests for same employee and date
    __table_args__ = (
        UniqueConstraint("organization_id", "employee_id", "attendance_date", name="uq_emp_date_reg"),
    )

    # Relationships
    organization = relationship("Organization")
    employee = relationship("Employee")
    attendance = relationship("Attendance")
    approver = relationship("User", foreign_keys=[approved_by])
