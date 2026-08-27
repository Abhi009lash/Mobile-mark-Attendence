import calendar
from datetime import date, datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.models.organization import Organization
from app.models.attendance import Attendance, AttendanceStatus
from app.models.employee import Employee
from app.services.email_service import EmailService

router = APIRouter()


@router.get("/daily")
def get_daily_attendance_report(
    report_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value,
        UserRole.ATTENDANCE_ADMIN.value,
        UserRole.BRANCH_MANAGER.value
    ))
) -> Dict[str, Any]:
    """Get daily attendance metrics (total employees, present, late, absent)."""
    total_employees = db.query(Employee).filter(
        Employee.organization_id == tenant_id,
        Employee.status == "active"
    ).count()

    attendance_records = db.query(Attendance).filter(
        Attendance.organization_id == tenant_id,
        Attendance.date == report_date
    ).all()

    present_count = sum(1 for r in attendance_records if r.status == AttendanceStatus.PRESENT.value)
    late_count = sum(1 for r in attendance_records if r.status == AttendanceStatus.LATE.value)
    half_day_count = sum(1 for r in attendance_records if r.status == AttendanceStatus.HALF_DAY.value)
    absent_count = max(0, total_employees - len(attendance_records))

    return {
        "date": report_date.isoformat(),
        "total_employees": total_employees,
        "present": present_count,
        "late": late_count,
        "half_day": half_day_count,
        "absent": absent_count,
        "records_count": len(attendance_records)
    }


@router.post("/monthly/email")
def send_monthly_report_email(
    year: int = Query(default_factory=lambda: datetime.now(timezone.utc).year),
    month: int = Query(default_factory=lambda: datetime.now(timezone.utc).month, ge=1, le=12),
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    current_user: User = Depends(require_roles(
        UserRole.ORGANIZATION_OWNER.value,
        UserRole.HR_ADMIN.value
    ))
):
    """
    Scenario 2: Compute monthly attendance digest and dispatch report email to organization.
    """
    org = db.query(Organization).filter(Organization.id == tenant_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found.")

    _, num_days = calendar.monthrange(year, month)
    start_date = date(year, month, 1)
    end_date = date(year, month, num_days)

    total_staff = db.query(Employee).filter(
        Employee.organization_id == tenant_id,
        Employee.status == "active"
    ).count()

    records = db.query(Attendance).filter(
        Attendance.organization_id == tenant_id,
        Attendance.date >= start_date,
        Attendance.date <= end_date
    ).all()

    present_days = sum(1 for r in records if r.status == AttendanceStatus.PRESENT.value)
    late_days = sum(1 for r in records if r.status == AttendanceStatus.LATE.value)
    regularized_days = sum(1 for r in records if r.source in ["regularized", "manual"])
    absent_days = max(0, (total_staff * num_days) - len(records))

    month_name = f"{calendar.month_name[month]} {year}"
    stats = {
        "total_staff": total_staff,
        "present_days": present_days,
        "late_days": late_days,
        "absent_days": absent_days,
        "regularized_days": regularized_days
    }

    sent = EmailService.send_monthly_attendance_report(
        org_name=org.name,
        org_email=org.email,
        month_name=month_name,
        stats=stats
    )

    return {
        "success": sent,
        "recipient": org.email,
        "month": month_name,
        "stats": stats
    }
