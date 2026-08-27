from typing import List, Optional
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.models.regularization import AttendanceRegularization
from app.models.employee import Employee
from app.schemas.regularization import (
    RegularizationCreate,
    RegularizationResponse,
    RegularizationActionRequest,
)
from app.services.regularization_service import RegularizationService

router = APIRouter()


@router.post("/requests", response_model=RegularizationResponse, status_code=status.HTTP_201_CREATED)
def apply_regularization(
    data: RegularizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Employee submits an attendance regularization request for missed punches or on-duty work.
    Enforces 7-day limit and monthly quota cap.
    """
    return RegularizationService.apply(db=db, current_user=current_user, data=data)


@router.get("/requests", response_model=List[RegularizationResponse])
def list_regularization_requests(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user)
):
    """
    List regularization requests:
    - Employees see their own requests
    - Admins and Managers see organization/branch pending requests
    """
    query = db.query(AttendanceRegularization).filter(
        AttendanceRegularization.organization_id == tenant_id
    )

    if current_user.role == UserRole.EMPLOYEE.value:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if not emp:
            return []
        query = query.filter(AttendanceRegularization.employee_id == emp.id)
    elif status_filter:
        query = query.filter(AttendanceRegularization.status == status_filter)

    return query.order_by(AttendanceRegularization.created_at.desc()).all()


@router.put("/requests/{request_id}/approve", response_model=RegularizationResponse)
def approve_regularization(
    request_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value,
        UserRole.ATTENDANCE_ADMIN.value,
        UserRole.BRANCH_MANAGER.value
    ))
):
    """
    Manager / HR approves regularization request.
    Automatically regularizes attendance record and writes to audit log.
    """
    client_ip = request.client.host if request.client else None
    return RegularizationService.approve(
        db=db,
        current_user=current_user,
        request_id=request_id,
        ip_address=client_ip
    )


@router.put("/requests/{request_id}/reject", response_model=RegularizationResponse)
def reject_regularization(
    request_id: int,
    action_data: RegularizationActionRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value,
        UserRole.ATTENDANCE_ADMIN.value,
        UserRole.BRANCH_MANAGER.value
    ))
):
    """
    Manager / HR rejects regularization request with reason.
    """
    client_ip = request.client.host if request.client else None
    return RegularizationService.reject(
        db=db,
        current_user=current_user,
        request_id=request_id,
        rejection_reason=action_data.rejection_reason,
        ip_address=client_ip
    )
