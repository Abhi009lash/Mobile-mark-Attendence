import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.models.organization import OrganizationStatus


class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    slug: Optional[str] = Field(None, min_length=2, max_length=100)
    code: Optional[str] = Field(None, min_length=2, max_length=50)
    website: Optional[str] = None
    logo_url: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    postal_code: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    max_admins: int = Field(default=1, ge=1)
    max_employees: int = Field(default=50, ge=1)


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    code: Optional[str] = Field(None, min_length=2, max_length=50)
    website: Optional[str] = None
    logo_url: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    status: Optional[OrganizationStatus] = None


class OrganizationLimitsUpdate(BaseModel):
    max_admins: Optional[int] = Field(None, ge=1)
    max_employees: Optional[int] = Field(None, ge=1)


class OrganizationResponse(OrganizationBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    code: str
    status: OrganizationStatus
    max_admins: int
    max_employees: int
    current_admins: int = 0
    current_employees: int = 0
    created_at: datetime
    updated_at: datetime


class OrganizationListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[OrganizationResponse]
