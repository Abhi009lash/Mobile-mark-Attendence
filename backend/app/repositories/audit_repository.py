import uuid
from typing import Optional, List, Tuple, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


class AuditLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def log_event(
        self,
        action: str,
        entity_type: str,
        entity_id: str,
        organization_id: Optional[uuid.UUID] = None,
        actor_user_id: Optional[uuid.UUID] = None,
        old_values: Optional[Any] = None,
        new_values: Optional[Any] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        audit_entry = AuditLog(
            organization_id=organization_id,
            actor_user_id=actor_user_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id),
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.add(audit_entry)
        self.db.commit()
        self.db.refresh(audit_entry)
        return audit_entry

    def list_logs(
        self,
        organization_id: Optional[uuid.UUID] = None,
        action: Optional[str] = None,
        entity_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[AuditLog], int]:
        query = self.db.query(AuditLog)

        if organization_id:
            query = query.filter(AuditLog.organization_id == organization_id)

        if action:
            query = query.filter(AuditLog.action == action)

        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type)

        total = query.count()
        items = (
            query.order_by(AuditLog.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return items, total
