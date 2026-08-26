from datetime import time, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class AttendancePolicyBase(BaseModel):
    working_start_time: time
    working_end_time: time
    late_threshold: int = Field(default=15, ge=0, description="Grace period in minutes")
    overtime_enabled: bool = False


class AttendancePolicyCreate(AttendancePolicyBase):
    pass


class AttendancePolicyUpdate(BaseModel):
    working_start_time: Optional[time] = None
    working_end_time: Optional[time] = None
    late_threshold: Optional[int] = Field(None, ge=0)
    overtime_enabled: Optional[bool] = None


class AttendancePolicyResponse(AttendancePolicyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    created_at: datetime
    updated_at: datetime
