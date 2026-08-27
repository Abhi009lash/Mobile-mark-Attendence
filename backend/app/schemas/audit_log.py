from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    user_id: Optional[int] = None
    action: str
    entity: str
    entity_id: Optional[int] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime
