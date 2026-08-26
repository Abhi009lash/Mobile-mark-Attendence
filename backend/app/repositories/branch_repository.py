from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.branch import Branch
from app.repositories.base import BaseRepository


class BranchRepository(BaseRepository[Branch]):
    def __init__(self, db: Session):
        super().__init__(Branch, db)

    def get_by_name(self, organization_id: int, name: str) -> Optional[Branch]:
        return self.db.query(Branch).filter(
            Branch.organization_id == organization_id,
            Branch.name == name
        ).first()
