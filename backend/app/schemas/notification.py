from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    body: str
    type: str = "announcement"


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    user_id: int
    title: str
    body: str
    type: str
    is_read: bool
    created_at: datetime
