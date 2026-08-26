from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.lower().strip()).first()

    def get_by_org_and_email(self, organization_id: int, email: str) -> Optional[User]:
        return self.db.query(User).filter(
            User.organization_id == organization_id,
            User.email == email.lower().strip()
        ).first()

    def list_by_role(self, organization_id: int, role: str) -> List[User]:
        return self.db.query(User).filter(
            User.organization_id == organization_id,
            User.role == role
        ).all()
