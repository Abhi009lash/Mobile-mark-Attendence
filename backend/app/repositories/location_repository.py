from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.location import Location
from app.repositories.base import BaseRepository


class LocationRepository(BaseRepository[Location]):
    def __init__(self, db: Session):
        super().__init__(Location, db)

    def list_active_locations(self, organization_id: int, branch_id: Optional[int] = None) -> List[Location]:
        query = self.db.query(Location).filter(
            Location.organization_id == organization_id,
            Location.status == "active"
        )
        if branch_id:
            query = query.filter(
                (Location.branch_id == branch_id) | (Location.branch_id.is_(None))
            )
        return query.all()
