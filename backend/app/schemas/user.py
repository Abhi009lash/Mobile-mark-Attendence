from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "employee"
    branch_id: Optional[int] = None
    status: str = "active"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    organization_id: Optional[int] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    branch_id: Optional[int] = None
    status: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)
