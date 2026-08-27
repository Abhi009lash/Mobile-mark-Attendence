from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.employee import Employee
from app.models.leave import LeaveRequest, LeaveType, LeaveRequestStatus
from app.repositories.leave_repository import LeaveRepository
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.leave import LeaveRequestCreate, LeaveRequestStatusUpdate
from app.services.notification_service import NotificationService


class LeaveService:
    @staticmethod
    def apply_leave(
        db: Session,
        current_user: User,
        data: LeaveRequestCreate
    ) -> LeaveRequest:
        emp_repo = EmployeeRepository(db)
        employee = emp_repo.get_by_user_id(current_user.id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee profile not found for this user."
            )

        if data.end_date < data.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date cannot be earlier than start date."
            )

        leave_repo = LeaveRepository(db)
        leave_type = leave_repo.get_leave_type(data.leave_type_id, current_user.organization_id)
        if not leave_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Leave type not found."
            )

        return leave_repo.create_leave_request({
            "organization_id": current_user.organization_id,
            "employee_id": employee.id,
            "leave_type_id": data.leave_type_id,
            "start_date": data.start_date,
            "end_date": data.end_date,
            "reason": data.reason,
            "status": LeaveRequestStatus.PENDING.value
        })

    @staticmethod
    def update_request_status(
        db: Session,
        current_user: User,
        request_id: int,
        status_update: LeaveRequestStatusUpdate
    ) -> LeaveRequest:
        leave_repo = LeaveRepository(db)
        req = leave_repo.get_leave_request(request_id, current_user.organization_id)
        if not req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Leave request not found."
            )

        updated_req = leave_repo.update_leave_request(req, {
            "status": status_update.status,
            "approved_by": current_user.id
        })

        # Find employee user_id to send in-app notification
        emp = db.query(Employee).filter(Employee.id == req.employee_id).first()
        if emp and emp.user_id:
            is_approved = status_update.status == LeaveRequestStatus.APPROVED.value
            type_name = req.leave_type.name if req.leave_type else "Leave"
            NotificationService.send_leave_decision_alert(
                db=db,
                organization_id=current_user.organization_id,
                user_id=emp.user_id,
                leave_type=type_name,
                is_approved=is_approved,
                approver_name=current_user.name
            )

        return updated_req
