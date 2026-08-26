from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.attendance import (
    CheckInRequest,
    CheckOutRequest,
    AttendanceResponse,
    OfflineSyncBatchRequest,
    OfflineSyncBatchResponse,
)
from app.services.attendance_service import AttendanceService
from app.services.sync_service import SyncService

router = APIRouter()


@router.post("/check-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def check_in(
    data: CheckInRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Employee GPS Check-In.
    Validates mobile GPS coordinates against configured branch/location geofence radius.
    Evaluates late threshold according to organization attendance policy.
    """
    return AttendanceService.check_in(db=db, user=current_user, data=data)


@router.post("/check-out", response_model=AttendanceResponse)
def check_out(
    data: CheckOutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Employee GPS Check-Out.
    Updates the existing check-in attendance record for today.
    """
    return AttendanceService.check_out(db=db, user=current_user, data=data)


@router.get("/history", response_model=List[AttendanceResponse])
def get_attendance_history(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    tenant_id: int = Depends(get_current_tenant_id)
):
    """
    Get personal attendance history for the authenticated employee.
    """
    emp_repo = EmployeeRepository(db)
    emp = emp_repo.get_by_user_id(current_user.id)
    if not emp:
        return []

    att_repo = AttendanceRepository(db)
    return att_repo.list_by_employee(
        organization_id=tenant_id,
        employee_id=emp.id,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit
    )


@router.post("/sync", response_model=OfflineSyncBatchResponse)
def sync_offline_attendance(
    batch: OfflineSyncBatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Synchronize offline queued attendance records from mobile SQLite.
    Guarantees idempotency and prevents double-check-ins.
    """
    return SyncService.process_offline_batch(db=db, current_user=current_user, batch_req=batch)
