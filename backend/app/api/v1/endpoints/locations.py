from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.repositories.location_repository import LocationRepository
from app.schemas.location import LocationCreate, LocationUpdate, LocationResponse

router = APIRouter()


@router.get("", response_model=List[LocationResponse])
def list_locations(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(get_current_user)
):
    """List active locations for attendance geofencing."""
    repo = LocationRepository(db)
    return repo.list_active_locations(organization_id=tenant_id, branch_id=current_user.branch_id)


@router.post("", response_model=LocationResponse)
def create_location(
    data: LocationCreate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.ATTENDANCE_ADMIN.value
    ))
):
    """Create a new work location with GPS coordinates and geofence radius."""
    repo = LocationRepository(db)
    loc_dict = data.model_dump()
    loc_dict["organization_id"] = tenant_id
    return repo.create(loc_dict)


@router.put("/{location_id}", response_model=LocationResponse)
def update_location(
    location_id: int,
    data: LocationUpdate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.ATTENDANCE_ADMIN.value
    ))
):
    """Update location coordinates or radius."""
    repo = LocationRepository(db)
    loc = repo.get_by_org(location_id, tenant_id)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found.")
    return repo.update(loc, data.model_dump(exclude_unset=True))
