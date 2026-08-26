from datetime import date
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.dependencies.tenant import get_current_tenant_id
from app.models.user import User, UserRole
from app.models.attendance import Attendance, AttendanceStatus
from app.models.employee import Employee

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
