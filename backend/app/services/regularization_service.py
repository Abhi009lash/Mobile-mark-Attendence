from datetime import date, datetime, timezone, timedelta
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.employee import Employee
from app.models.attendance import Attendance, AttendanceStatus, AttendanceSource
from app.models.regularization import AttendanceRegularization, RegularizationStatus
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.attendance_repository import AttendanceRepository
from app.schemas.regularization import RegularizationCreate, RegularizationActionRequest
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService

MAX_MONTHLY_REGULARIZATIONS = 3
MAX_DAYS_WINDOW = 7


class RegularizationService:
    @staticmethod
    def apply(
        db: Session,
        current_user: User,
        data: RegularizationCreate
    ) -> AttendanceRegularization:
        emp_repo = EmployeeRepository(db)
        employee = emp_repo.get_by_user_id(current_user.id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee profile not found for this user."
            )

        today = datetime.now(timezone.utc).date()

        # Rule 1: Cannot regularize future dates
        if data.attendance_date > today:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot apply regularization for future dates."
            )

        # Rule 2: 7-day window limit
        days_diff = (today - data.attendance_date).days
        if days_diff > MAX_DAYS_WINDOW:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Regularization request expired. Must apply within {MAX_DAYS_WINDOW} days of occurrence."
            )

        # Rule 3: Monthly quota limit (3 per month)
        first_day_of_month = today.replace(day=1)
        monthly_count = db.query(AttendanceRegularization).filter(
            AttendanceRegularization.organization_id == current_user.organization_id,
            AttendanceRegularization.employee_id == employee.id,
            AttendanceRegularization.created_at >= first_day_of_month,
            AttendanceRegularization.status.in_([RegularizationStatus.PENDING.value, RegularizationStatus.APPROVED.value])
        ).count()

        if monthly_count >= MAX_MONTHLY_REGULARIZATIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Monthly regularization quota exceeded (Maximum {MAX_MONTHLY_REGULARIZATIONS} allowed per month)."
            )

        att_repo = AttendanceRepository(db)
        existing_att = att_repo.get_by_employee_and_date(
            current_user.organization_id, employee.id, data.attendance_date
        )

        reg_entry = AttendanceRegularization(
            organization_id=current_user.organization_id,
            employee_id=employee.id,
            attendance_id=existing_att.id if existing_att else None,
            request_type=data.request_type,
            attendance_date=data.attendance_date,
            requested_check_in=data.requested_check_in,
            requested_check_out=data.requested_check_out,
            reason=data.reason,
            status=RegularizationStatus.PENDING.value
        )
        db.add(reg_entry)
        db.commit()
        db.refresh(reg_entry)
        return reg_entry

    @staticmethod
    def approve(
        db: Session,
        current_user: User,
        request_id: int,
        ip_address: Optional[str] = None
    ) -> AttendanceRegularization:
        reg = db.query(AttendanceRegularization).filter(
            AttendanceRegularization.id == request_id,
            AttendanceRegularization.organization_id == current_user.organization_id
        ).first()

        if not reg:
            raise HTTPException(status_code=404, detail="Regularization request not found.")

        if reg.status != RegularizationStatus.PENDING.value:
            raise HTTPException(status_code=400, detail=f"Request is already {reg.status}.")

        old_state = {"status": reg.status, "approved_by": reg.approved_by}

        reg.status = RegularizationStatus.APPROVED.value
        reg.approved_by = current_user.id

        att_repo = AttendanceRepository(db)
        att = att_repo.get_by_employee_and_date(
            current_user.organization_id, reg.employee_id, reg.attendance_date
        )

        old_att_state = None
        if att:
            old_att_state = {
                "check_in": str(att.check_in),
                "check_out": str(att.check_out),
                "status": att.status,
                "source": att.source,
            }
            if reg.requested_check_in:
                att.check_in = reg.requested_check_in
            if reg.requested_check_out:
                att.check_out = reg.requested_check_out
            att.status = AttendanceStatus.PRESENT.value
            att.source = AttendanceSource.MANUAL.value
        else:
            att = Attendance(
                organization_id=current_user.organization_id,
                employee_id=reg.employee_id,
                date=reg.attendance_date,
                check_in=reg.requested_check_in,
                check_out=reg.requested_check_out,
                status=AttendanceStatus.PRESENT.value,
                source=AttendanceSource.MANUAL.value
            )
            db.add(att)

        db.commit()
        db.refresh(reg)

        AuditService.log_action(
            db=db,
            organization_id=current_user.organization_id,
            user_id=current_user.id,
            action="REGULARIZATION_APPROVED",
            entity="attendance_regularization",
            entity_id=reg.id,
            old_value=old_att_state,
            new_value={
                "regularization_id": reg.id,
                "attendance_date": str(reg.attendance_date),
                "check_in": str(att.check_in),
                "check_out": str(att.check_out),
                "status": att.status,
                "source": att.source,
            },
            ip_address=ip_address
        )

        # Trigger In-App Notification
        emp = db.query(Employee).filter(Employee.id == reg.employee_id).first()
        if emp and emp.user_id:
            NotificationService.send_regularization_decision_alert(
                db=db,
                organization_id=current_user.organization_id,
                user_id=emp.user_id,
                date_str=str(reg.attendance_date),
                is_approved=True,
                approver_name=current_user.name
            )

        return reg

    @staticmethod
    def reject(
        db: Session,
        current_user: User,
        request_id: int,
        rejection_reason: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> AttendanceRegularization:
        reg = db.query(AttendanceRegularization).filter(
            AttendanceRegularization.id == request_id,
            AttendanceRegularization.organization_id == current_user.organization_id
        ).first()

        if not reg:
            raise HTTPException(status_code=404, detail="Regularization request not found.")

        reg.status = RegularizationStatus.REJECTED.value
        reg.approved_by = current_user.id
        reg.rejection_reason = rejection_reason

        db.commit()
        db.refresh(reg)

        AuditService.log_action(
            db=db,
            organization_id=current_user.organization_id,
            user_id=current_user.id,
            action="REGULARIZATION_REJECTED",
            entity="attendance_regularization",
            entity_id=reg.id,
            new_value={"status": "rejected", "reason": rejection_reason},
            ip_address=ip_address
        )

        # Trigger In-App Notification
        emp = db.query(Employee).filter(Employee.id == reg.employee_id).first()
        if emp and emp.user_id:
            NotificationService.send_regularization_decision_alert(
                db=db,
                organization_id=current_user.organization_id,
                user_id=emp.user_id,
                date_str=str(reg.attendance_date),
                is_approved=False,
                approver_name=current_user.name,
                reason=rejection_reason
            )

        return reg
