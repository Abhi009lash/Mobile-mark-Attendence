from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.leave import LeaveType, LeaveRequest
from app.repositories.base import BaseRepository


class LeaveRepository:
    def __init__(self, db: Session):
        self.db = db

    # Leave Types
    def get_leave_type(self, leave_type_id: int, organization_id: int) -> Optional[LeaveType]:
        return self.db.query(LeaveType).filter(
            LeaveType.id == leave_type_id,
            LeaveType.organization_id == organization_id
        ).first()

    def list_leave_types(self, organization_id: int) -> List[LeaveType]:
        return self.db.query(LeaveType).filter(
            LeaveType.organization_id == organization_id,
            LeaveType.status == "active"
        ).all()

    def create_leave_type(self, organization_id: int, name: str, days_allowed: int) -> LeaveType:
        lt = LeaveType(organization_id=organization_id, name=name, days_allowed=days_allowed)
        self.db.add(lt)
        self.db.commit()
        self.db.refresh(lt)
        return lt

    # Leave Requests
    def get_leave_request(self, request_id: int, organization_id: int) -> Optional[LeaveRequest]:
        return self.db.query(LeaveRequest).filter(
            LeaveRequest.id == request_id,
            LeaveRequest.organization_id == organization_id
        ).first()

    def list_requests_by_employee(self, organization_id: int, employee_id: int) -> List[LeaveRequest]:
        return self.db.query(LeaveRequest).filter(
            LeaveRequest.organization_id == organization_id,
            LeaveRequest.employee_id == employee_id
        ).order_by(LeaveRequest.created_at.desc()).all()

    def list_requests_by_organization(
        self,
        organization_id: int,
        status: Optional[str] = None
    ) -> List[LeaveRequest]:
        query = self.db.query(LeaveRequest).filter(
            LeaveRequest.organization_id == organization_id
        )
        if status:
            query = query.filter(LeaveRequest.status == status)
        return query.order_by(LeaveRequest.created_at.desc()).all()

    def create_leave_request(self, obj_in: dict) -> LeaveRequest:
        req = LeaveRequest(**obj_in)
        self.db.add(req)
        self.db.commit()
        self.db.refresh(req)
        return req

    def update_leave_request(self, req: LeaveRequest, obj_in: dict) -> LeaveRequest:
        for k, v in obj_in.items():
            if hasattr(req, k) and v is not None:
                setattr(req, k, v)
        self.db.commit()
        self.db.refresh(req)
        return req
