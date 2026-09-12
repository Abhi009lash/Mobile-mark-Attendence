import uuid
from typing import Optional, List, Tuple
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.models.organization import Organization, OrganizationStatus
from app.models.user import User, UserRole, UserStatus


class OrganizationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, org_id: uuid.UUID) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.id == org_id).first()

    def get_by_id_locked(self, org_id: uuid.UUID) -> Optional[Organization]:
        """Locks the organization row for concurrency-safe quota enforcement."""
        return (
            self.db.query(Organization)
            .filter(Organization.id == org_id)
            .with_for_update()
            .first()
        )

    def get_by_slug(self, slug: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.slug == slug.lower().strip()).first()

    def get_by_code(self, code: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.code == code.upper().strip()).first()

    def create(self, organization: Organization) -> Organization:
        self.db.add(organization)
        self.db.commit()
        self.db.refresh(organization)
        return organization

    def list_all(
        self,
        search: Optional[str] = None,
        status: Optional[OrganizationStatus] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Organization], int]:
        query = self.db.query(Organization)

        if status:
            query = query.filter(Organization.status == status)

        if search:
            search_pattern = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(Organization.name).like(search_pattern),
                    func.lower(Organization.slug).like(search_pattern),
                    func.lower(Organization.code).like(search_pattern),
                    func.lower(Organization.email).like(search_pattern),
                )
            )

        total = query.count()
        items = (
            query.order_by(Organization.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return items, total

    def update(self, organization: Organization) -> Organization:
        self.db.commit()
        self.db.refresh(organization)
        return organization

    def delete(self, organization: Organization) -> None:
        self.db.delete(organization)
        self.db.commit()

    def count_admins(self, org_id: uuid.UUID) -> int:
        return (
            self.db.query(func.count(User.id))
            .filter(
                User.organization_id == org_id,
                User.role == UserRole.ATTENDANCE_ADMIN,
                User.status != UserStatus.INACTIVE,
            )
            .scalar()
            or 0
        )

    def count_employees(self, org_id: uuid.UUID) -> int:
        return (
            self.db.query(func.count(User.id))
            .filter(
                User.organization_id == org_id,
                User.role == UserRole.FIELD_EMPLOYEE,
                User.status != UserStatus.INACTIVE,
            )
            .scalar()
            or 0
        )

