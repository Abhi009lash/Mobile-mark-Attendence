import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class NotificationType(str, enum.Enum):
    CHECK_IN_ALERT = "check_in_alert"
    CHECK_OUT_ALERT = "check_out_alert"
    PUNCH_SUCCESS = "punch_success"
    LEAVE_REQUEST = "leave_request"
    LEAVE_APPROVED = "leave_approved"
    LEAVE_REJECTED = "leave_rejected"
    REGULARIZATION_REQUEST = "regularization_request"
    REGULARIZATION_APPROVED = "regularization_approved"
    REGULARIZATION_REJECTED = "regularization_rejected"
    ANNOUNCEMENT = "announcement"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    type = Column(String(50), default=NotificationType.ANNOUNCEMENT.value, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    organization = relationship("Organization")
    user = relationship("User")
