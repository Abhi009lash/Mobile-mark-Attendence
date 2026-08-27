from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class HolidayBase(BaseModel):
    name: str
    date: date
    branch_id: Optional[int] = None


class HolidayCreate(HolidayBase):
    pass


class HolidayResponse(HolidayBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    created_at: datetime
