from datetime import date, datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.attendance import Attendance
from app.repositories.base import BaseRepository


class AttendanceRepository(BaseRepository[Attendance]):
    def __init__(self, db: Session):
        super().__init__(Attendance, db)

    def get_by_employee_and_date(
        self,
        organization_id: int,
        employee_id: int,
        record_date: date
    ) -> Optional[Attendance]:
        return self.db.query(Attendance).filter(
            Attendance.organization_id == organization_id,
            Attendance.employee_id == employee_id,
            Attendance.date == record_date
        ).first()

    def list_by_employee(
        self,
        organization_id: int,
        employee_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Attendance]:
        query = self.db.query(Attendance).filter(
            Attendance.organization_id == organization_id,
            Attendance.employee_id == employee_id
        )
        if start_date:
            query = query.filter(Attendance.date >= start_date)
        if end_date:
            query = query.filter(Attendance.date <= end_date)
        return query.order_by(Attendance.date.desc()).offset(skip).limit(limit).all()

    def list_by_organization_and_date(
        self,
        organization_id: int,
        record_date: date
    ) -> List[Attendance]:
        return self.db.query(Attendance).filter(
            Attendance.organization_id == organization_id,
            Attendance.date == record_date
        ).all()
