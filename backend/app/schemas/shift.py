from datetime import time, date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ShiftBase(BaseModel):
    name: str
    start_time: time
    end_time: time
    grace_minutes: int = Field(default=15, ge=0)
    is_night_shift: bool = False
    branch_id: Optional[int] = None
    status: str = "active"


class ShiftCreate(ShiftBase):
    pass


class ShiftResponse(ShiftBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    created_at: datetime
    updated_at: datetime


class ShiftAssignRequest(BaseModel):
    employee_id: int
    shift_id: int
    start_date: date
    end_date: Optional[date] = None


class EmployeeShiftScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    employee_id: int
    shift_id: int
    start_date: date
    end_date: Optional[date] = None
    created_at: datetime
    shift: Optional[ShiftResponse] = None
