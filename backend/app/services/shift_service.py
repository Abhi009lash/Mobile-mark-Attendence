from datetime import date
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.shift import Shift, EmployeeShiftSchedule
from app.models.employee import Employee
from app.schemas.shift import ShiftCreate, ShiftAssignRequest


class ShiftService:
    @staticmethod
    def create_shift(db: Session, organization_id: int, data: ShiftCreate) -> Shift:
        shift = Shift(organization_id=organization_id, **data.model_dump())
        db.add(shift)
        db.commit()
        db.refresh(shift)
        return shift

    @staticmethod
    def assign_shift_schedule(
        db: Session,
        organization_id: int,
        data: ShiftAssignRequest
    ) -> EmployeeShiftSchedule:
        # Verify employee belongs to tenant
        emp = db.query(Employee).filter(
            Employee.id == data.employee_id,
            Employee.organization_id == organization_id
        ).first()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found.")

        # Verify shift belongs to tenant
        shift = db.query(Shift).filter(
            Shift.id == data.shift_id,
            Shift.organization_id == organization_id
        ).first()
        if not shift:
            raise HTTPException(status_code=404, detail="Shift not found.")

        schedule = EmployeeShiftSchedule(
            organization_id=organization_id,
            employee_id=data.employee_id,
            shift_id=data.shift_id,
            start_date=data.start_date,
            end_date=data.end_date
        )
        db.add(schedule)
        db.commit()
        db.refresh(schedule)
        return schedule
