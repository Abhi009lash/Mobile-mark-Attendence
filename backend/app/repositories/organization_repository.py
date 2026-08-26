from typing import Optional
from sqlalchemy.orm import Session
from app.models.organization import Organization
from app.repositories.base import BaseRepository


class OrganizationRepository(BaseRepository[Organization]):
    def __init__(self, db: Session):
        super().__init__(Organization, db)

    def get_by_email(self, email: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.email == email.lower().strip()).first()
