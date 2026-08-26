from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class CheckInRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    location_id: Optional[int] = None
    client_timestamp: Optional[datetime] = None


class CheckOutRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    client_timestamp: Optional[datetime] = None


class AttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    employee_id: int
    location_id: Optional[int] = None
    date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    check_in_latitude: Optional[float] = None
    check_in_longitude: Optional[float] = None
    check_out_latitude: Optional[float] = None
    check_out_longitude: Optional[float] = None
    status: str
    source: str
    created_at: datetime
    updated_at: datetime


class OfflineSyncItem(BaseModel):
    client_id: str  # Client-side UUID for idempotency
    employee_id: int
    date: date
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    check_in_latitude: Optional[float] = None
    check_in_longitude: Optional[float] = None
    check_out_latitude: Optional[float] = None
    check_out_longitude: Optional[float] = None
    location_id: Optional[int] = None


class OfflineSyncBatchRequest(BaseModel):
    items: List[OfflineSyncItem]


class OfflineSyncBatchResponse(BaseModel):
    synced_count: int
    skipped_count: int
    failed_count: int
    details: List[dict]
