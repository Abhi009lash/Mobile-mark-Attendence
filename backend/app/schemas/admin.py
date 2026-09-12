import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.models.user import UserRole, UserStatus


class AdminCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class AdminStatusUpdate(BaseModel):
    status: UserStatus


class AdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organization_id: uuid.UUID
    organization_name: Optional[str] = None
    organization_code: Optional[str] = None
    email: EmailStr
    full_name: str
    role: UserRole
    status: UserStatus
    created_at: datetime
    updated_at: datetime


class AdminListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[AdminResponse]
