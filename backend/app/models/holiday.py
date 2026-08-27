from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Holiday(Base, TimestampMixin):
    __tablename__ = "holidays"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id", ondelete="CASCADE"), nullable=True, index=True)  # NULL for org-wide

    name = Column(String(200), nullable=False)
    date = Column(Date, nullable=False, index=True)

    # Relationships
    organization = relationship("Organization")
    branch = relationship("Branch")
