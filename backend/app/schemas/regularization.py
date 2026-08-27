from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class RegularizationCreate(BaseModel):
    attendance_date: date
    request_type: str = Field(..., description="missed_check_in, missed_check_out, missed_both, on_duty, late_waiver")
    requested_check_in: Optional[datetime] = None
    requested_check_out: Optional[datetime] = None
    reason: str = Field(..., min_length=5, description="Reason for regularization")


class RegularizationActionRequest(BaseModel):
    rejection_reason: Optional[str] = None


class RegularizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    employee_id: int
    attendance_id: Optional[int] = None
    request_type: str
    attendance_date: date
    requested_check_in: Optional[datetime] = None
    requested_check_out: Optional[datetime] = None
    reason: str
    status: str
    approved_by: Optional[int] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
