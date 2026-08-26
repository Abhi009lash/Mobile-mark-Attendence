from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse

router = APIRouter()


@router.get("", response_model=List[EmployeeResponse])
def list_employees(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value,
        UserRole.ATTENDANCE_ADMIN.value,
        UserRole.BRANCH_MANAGER.value
    ))
):
    """List employees of the organization."""
    repo = EmployeeRepository(db)
    return repo.list_by_org(organization_id=tenant_id, skip=skip, limit=limit)


@router.post("", response_model=EmployeeResponse)
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value
    ))
):
    """Create an employee profile linked to an existing user."""
    repo = EmployeeRepository(db)
    existing_user_emp = repo.get_by_user_id(data.user_id)
    if existing_user_emp:
        raise HTTPException(status_code=400, detail="Employee profile already exists for this user.")

    emp_dict = data.model_dump()
    emp_dict["organization_id"] = tenant_id
    return repo.create(emp_dict)


@router.get("/me", response_model=EmployeeResponse)
def get_my_employee_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the employee profile of the authenticated user."""
    repo = EmployeeRepository(db)
    emp = repo.get_by_user_id(current_user.id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found.")
    return emp
