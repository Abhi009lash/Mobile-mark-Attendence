from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse


class EmployeeBase(BaseModel):
    employee_code: str
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    branch_id: Optional[int] = None
    status: str = "active"


class EmployeeCreate(EmployeeBase):
    user_id: int


class EmployeeUpdate(BaseModel):
    employee_code: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    branch_id: Optional[int] = None
    status: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None
