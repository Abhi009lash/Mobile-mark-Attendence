from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class OrganizationBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    user_limit: int = Field(default=50, ge=1, description="Maximum allowed employees")
    status: str = "active"


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    user_limit: Optional[int] = Field(None, ge=1)
    status: Optional[str] = None


class OrganizationResponse(OrganizationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class PlatformAnalyticsOverview(BaseModel):
    total_organizations: int
    active_organizations: int
    suspended_organizations: int
    total_users: int
    total_employees: int
    total_branches: int
    today_punches: int
