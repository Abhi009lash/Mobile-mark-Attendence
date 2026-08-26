from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.repositories.leave_repository import LeaveRepository
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.leave import (
    LeaveTypeCreate,
    LeaveTypeResponse,
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveRequestStatusUpdate,
)
from app.services.leave_service import LeaveService

router = APIRouter()


@router.get("/types", response_model=List[LeaveTypeResponse])
def list_leave_types(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user)
):
    """List available leave types for the organization."""
    repo = LeaveRepository(db)
    return repo.list_leave_types(tenant_id)


@router.post("/types", response_model=LeaveTypeResponse)
def create_leave_type(
    data: LeaveTypeCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value
    ))
):
    """Create a new leave type."""
    repo = LeaveRepository(db)
    return repo.create_leave_type(tenant_id, data.name, data.days_allowed)


@router.get("/requests", response_model=List[LeaveRequestResponse])
def list_leave_requests(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user)
):
    """
    List leave requests:
    - Employees see their own requests
    - Admins/HR see organization requests
    """
    repo = LeaveRepository(db)
    if current_user.role == UserRole.EMPLOYEE.value:
        emp_repo = EmployeeRepository(db)
        emp = emp_repo.get_by_user_id(current_user.id)
        if not emp:
            return []
        return repo.list_requests_by_employee(tenant_id, emp.id)
    return repo.list_requests_by_organization(tenant_id, status=status_filter)


@router.post("/requests", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
def apply_for_leave(
    data: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Employee submits a leave application."""
    return LeaveService.apply_leave(db=db, current_user=current_user, data=data)


@router.put("/requests/{request_id}/status", response_model=LeaveRequestResponse)
def update_leave_status(
    request_id: int,
    data: LeaveRequestStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value,
        UserRole.BRANCH_MANAGER.value
    ))
):
    """Admin / HR approves or rejects a leave request."""
    return LeaveService.update_request_status(
        db=db,
        current_user=current_user,
        request_id=request_id,
        status_update=data
    )
