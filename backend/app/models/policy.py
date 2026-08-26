from sqlalchemy import Column, Integer, Time, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class AttendancePolicy(Base, TimestampMixin):
    __tablename__ = "attendance_policies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    working_start_time = Column(Time, nullable=False)  # e.g., 09:00:00
    working_end_time = Column(Time, nullable=False)    # e.g., 18:00:00
    late_threshold = Column(Integer, default=15, nullable=False)  # minutes grace period
    overtime_enabled = Column(Boolean, default=False, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="policy")
