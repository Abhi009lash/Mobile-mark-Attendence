from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    action = Column(String(100), nullable=False)        # e.g., REGULARIZATION_APPROVED, ATTENDANCE_MANUAL_EDIT
    entity = Column(String(50), nullable=False)         # e.g., attendance, regularization, employee, shift
    entity_id = Column(Integer, nullable=True)

    old_value = Column(Text, nullable=True)             # JSON string of previous state
    new_value = Column(Text, nullable=True)             # JSON string of updated state

    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    organization = relationship("Organization")
    user = relationship("User")
