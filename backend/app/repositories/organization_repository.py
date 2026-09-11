import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app.models.organization import Organization


class OrganizationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, org_id: uuid.UUID) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.id == org_id).first()

    def get_by_slug(self, slug: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.slug == slug.lower().strip()).first()

    def create(self, organization: Organization) -> Organization:
        self.db.add(organization)
        self.db.commit()
        self.db.refresh(organization)
        return organization
