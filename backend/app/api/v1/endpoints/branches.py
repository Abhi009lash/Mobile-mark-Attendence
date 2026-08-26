from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.repositories.branch_repository import BranchRepository
from app.schemas.branch import BranchCreate, BranchUpdate, BranchResponse

router = APIRouter()


@router.get("", response_model=List[BranchResponse])
def list_branches(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user)
):
    """List all branches of the organization."""
    repo = BranchRepository(db)
    return repo.list_by_org(organization_id=tenant_id, skip=skip, limit=limit)


@router.post("", response_model=BranchResponse)
def create_branch(
    data: BranchCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value
    ))
):
    """Create a new branch."""
    repo = BranchRepository(db)
    branch_dict = data.model_dump()
    branch_dict["organization_id"] = tenant_id
    return repo.create(branch_dict)


@router.put("/{branch_id}", response_model=BranchResponse)
def update_branch(
    branch_id: int,
    data: BranchUpdate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value
    ))
):
    """Update branch details."""
    repo = BranchRepository(db)
    branch = repo.get_by_org(branch_id, tenant_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found.")
    return repo.update(branch, data.model_dump(exclude_unset=True))
