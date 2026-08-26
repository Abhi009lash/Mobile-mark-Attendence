from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class LeaveTypeBase(BaseModel):
    name: str
    days_allowed: int = Field(default=12, ge=1)
    status: str = "active"


class LeaveTypeCreate(LeaveTypeBase):
    pass


class LeaveTypeResponse(LeaveTypeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    created_at: datetime


class LeaveRequestCreate(BaseModel):
    leave_type_id: int
    start_date: date
    end_date: date
    reason: Optional[str] = None


class LeaveRequestStatusUpdate(BaseModel):
    status: str  # approved, rejected, cancelled


class LeaveRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    employee_id: int
    leave_type_id: int
    start_date: date
    end_date: date
    reason: Optional[str] = None
    status: str
    approved_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    leave_type: Optional[LeaveTypeResponse] = None
