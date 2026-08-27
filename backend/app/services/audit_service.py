import json
from typing import Any, Optional
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        organization_id: int,
        user_id: Optional[int],
        action: str,
        entity: str,
        entity_id: Optional[int] = None,
        old_value: Optional[Any] = None,
        new_value: Optional[Any] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """Create an immutable audit log record."""
        old_json = json.dumps(old_value, default=str) if old_value is not None else None
        new_json = json.dumps(new_value, default=str) if new_value is not None else None

        log_entry = AuditLog(
            organization_id=organization_id,
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            old_value=old_json,
            new_value=new_json,
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
