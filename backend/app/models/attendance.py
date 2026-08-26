import enum
from sqlalchemy import Column, Integer, String, Float, Date, Time, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    LATE = "late"
    HALF_DAY = "half_day"
    ABSENT = "absent"
    ON_LEAVE = "on_leave"


class AttendanceSource(str, enum.Enum):
    MOBILE = "mobile"
    WEB = "web"
    OFFLINE_SYNC = "offline_sync"
    MANUAL = "manual"


class Attendance(Base, TimestampMixin):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="SET NULL"), nullable=True, index=True)

    date = Column(Date, nullable=False, index=True)
    check_in = Column(DateTime(timezone=True), nullable=True)
    check_out = Column(DateTime(timezone=True), nullable=True)

    check_in_latitude = Column(Float, nullable=True)
    check_in_longitude = Column(Float, nullable=True)
    check_out_latitude = Column(Float, nullable=True)
    check_out_longitude = Column(Float, nullable=True)

    status = Column(String(50), default=AttendanceStatus.PRESENT.value, nullable=False)
    source = Column(String(50), default=AttendanceSource.MOBILE.value, nullable=False)

    # Unique constraint per employee per date to prevent duplicates
    __table_args__ = (
        UniqueConstraint("organization_id", "employee_id", "date", name="uq_org_employee_date"),
    )

    # Relationships
    organization = relationship("Organization", back_populates="attendance_records")
    employee = relationship("Employee", back_populates="attendance_records")
    location = relationship("Location", back_populates="attendance_records")
