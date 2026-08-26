from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.organization import OrganizationCreate, OrganizationUpdate, OrganizationResponse

router = APIRouter()


@router.post("", response_model=OrganizationResponse)
def create_organization(
    data: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.SUPER_ADMIN.value))
):
    """Super Admin: Create a new customer organization."""
    repo = OrganizationRepository(db)
    existing = repo.get_by_email(data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Organization with this email already exists.")
    return repo.create(data.model_dump())


@router.get("/current", response_model=OrganizationResponse)
def get_my_organization(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id)
):
    """Get the organization details of the authenticated tenant."""
    repo = OrganizationRepository(db)
    org = repo.get(tenant_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return org


@router.put("/current", response_model=OrganizationResponse)
def update_my_organization(
    data: OrganizationUpdate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(UserRole.ORGANIZATION_OWNER.value, UserRole.SUPER_ADMIN.value))
):
    """Organization Owner: Update organization details."""
    repo = OrganizationRepository(db)
    org = repo.get(tenant_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")
    return repo.update(org, data.model_dump(exclude_unset=True))
