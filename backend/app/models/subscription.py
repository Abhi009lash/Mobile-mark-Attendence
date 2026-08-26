from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    max_employees = Column(Integer, default=50, nullable=False)
    max_admins = Column(Integer, default=5, nullable=False)
    max_locations = Column(Integer, default=5, nullable=False)
    price = Column(Float, default=0.0, nullable=False)
    billing_cycle = Column(String(50), default="monthly", nullable=False)  # monthly, yearly
    status = Column(String(50), default="active", nullable=False)

    subscriptions = relationship("Subscription", back_populates="plan")


class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id", ondelete="RESTRICT"), nullable=False, index=True)
    status = Column(String(50), default="active", nullable=False)  # active, past_due, cancelled, expired
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="subscription")
    plan = relationship("Plan", back_populates="subscriptions")
