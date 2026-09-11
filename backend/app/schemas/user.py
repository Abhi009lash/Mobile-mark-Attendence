import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    organization_id: Optional[uuid.UUID] = None
    status: UserStatus
