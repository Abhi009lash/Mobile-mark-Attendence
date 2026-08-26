from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class OrganizationBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    status: str = "active"


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None


class OrganizationResponse(OrganizationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
