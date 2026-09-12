import uuid
from typing import Optional, List, Tuple
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.models.user import User, UserRole, UserStatus


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.lower().strip()).first()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_password(self, user: User, hashed_password: str) -> User:
        user.password_hash = hashed_password
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_status(self, user: User, status: UserStatus) -> User:
        user.status = status
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()

    def list_admins_by_org(self, org_id: uuid.UUID) -> List[User]:
        return (
            self.db.query(User)
            .filter(
                User.organization_id == org_id,
                User.role == UserRole.ATTENDANCE_ADMIN,
            )
            .order_by(User.created_at.desc())
            .all()
        )

    def list_platform_admins(
        self,
        search: Optional[str] = None,
        org_id: Optional[uuid.UUID] = None,
        status: Optional[UserStatus] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[User], int]:
        query = self.db.query(User).filter(User.role == UserRole.ATTENDANCE_ADMIN)

        if org_id:
            query = query.filter(User.organization_id == org_id)

        if status:
            query = query.filter(User.status == status)

        if search:
            search_pattern = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(User.full_name).like(search_pattern),
                    func.lower(User.email).like(search_pattern),
                )
            )

        total = query.count()
        items = (
            query.order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return items, total

