from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.models.shift import Shift, EmployeeShiftSchedule
from app.schemas.shift import (
    ShiftCreate,
    ShiftResponse,
    ShiftAssignRequest,
    EmployeeShiftScheduleResponse,
)
from app.services.shift_service import ShiftService

router = APIRouter()


@router.get("", response_model=List[ShiftResponse])
def list_shifts(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user)
):
    """List configured shifts for the organization."""
    return db.query(Shift).filter(Shift.organization_id == tenant_id).all()


@router.post("", response_model=ShiftResponse, status_code=status.HTTP_201_CREATED)
def create_shift(
    data: ShiftCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value,
        UserRole.ATTENDANCE_ADMIN.value
    ))
):
    """Create a new work shift (e.g. Morning, Evening, Night)."""
    return ShiftService.create_shift(db=db, organization_id=tenant_id, data=data)


@router.post("/assign", response_model=EmployeeShiftScheduleResponse, status_code=status.HTTP_201_CREATED)
def assign_shift_schedule(
    data: ShiftAssignRequest,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value,
        UserRole.BRANCH_MANAGER.value
    ))
):
    """Assign an effective-dated shift roster schedule to an employee."""
    return ShiftService.assign_shift_schedule(db=db, organization_id=tenant_id, data=data)
