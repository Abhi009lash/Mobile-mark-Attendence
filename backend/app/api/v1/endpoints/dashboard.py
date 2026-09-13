import calendar
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.dependencies.db import get_db
from app.dependencies.rbac import require_super_admin
from app.models.user import User, UserRole
from app.models.organization import Organization, OrganizationStatus
from app.schemas.dashboard import (
    DashboardMetricsResponse,
    KpiStats,
    OrgStatusStats,
    DailyTrendPoint,
)

router = APIRouter()

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@router.get("/metrics", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(
    year: Optional[int] = Query(None, description="Filter year (defaults to current year)"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter month 1-12 (defaults to current month)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    """
    Returns platform-wide metrics, KPIs, month-wise trend, and organization account status
    up to the selected past or current year and month. Future dates are strictly rejected.
    """
    now = datetime.now(timezone.utc)
    target_year = year if year is not None else now.year
    target_month = month if month is not None else now.month

    # Enforce rule: only previous/current periods allowed
    if target_year > now.year:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Future year {target_year} is not allowed. Max year is {now.year}.",
        )
    if target_year == now.year and target_month > now.month:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Future month {target_month} for year {target_year} is not allowed. Max month is {now.month}.",
        )

    # Cutoff datetime at the end of the selected month
    last_day = calendar.monthrange(target_year, target_month)[1]
    cutoff_dt = datetime(target_year, target_month, last_day, 23, 59, 59, 999999, tzinfo=timezone.utc)

    # 1. Total Organizations
    total_orgs = (
        db.query(func.count(Organization.id))
        .filter(Organization.created_at <= cutoff_dt)
        .scalar()
        or 0
    )

    # 2. Total Attendance Admins
    total_admins = (
        db.query(func.count(User.id))
        .filter(
            User.role == UserRole.ATTENDANCE_ADMIN,
            User.created_at <= cutoff_dt,
        )
        .scalar()
        or 0
    )

    # 3. Total Employees (Licensed capacity across organizations)
    total_employees = (
        db.query(func.coalesce(func.sum(Organization.max_employees), 0))
        .filter(Organization.created_at <= cutoff_dt)
        .scalar()
        or 0
    )

    # 4. Status Breakdown for Organizations as of cutoff
    status_rows = (
        db.query(Organization.status, func.count(Organization.id))
        .filter(Organization.created_at <= cutoff_dt)
        .group_by(Organization.status)
        .all()
    )
    status_dict = {s: c for s, c in status_rows}

    active_count = status_dict.get(OrganizationStatus.ACTIVE, 0)
    trial_count = status_dict.get(OrganizationStatus.TRIAL, 0)
    suspended_count = status_dict.get(OrganizationStatus.SUSPENDED, 0)

    # 5. Day-wise Trend Data (Days 1 to max_day in selected month)
    last_day_of_month = calendar.monthrange(target_year, target_month)[1]
    if target_year == now.year and target_month == now.month:
        max_day = min(now.day, last_day_of_month)
    else:
        max_day = last_day_of_month

    org_records = (
        db.query(Organization.created_at, Organization.max_employees)
        .filter(Organization.created_at <= cutoff_dt)
        .all()
    )

    daily_trends: List[DailyTrendPoint] = []
    month_name = MONTH_NAMES[target_month - 1]

    for d in range(1, max_day + 1):
        day_cutoff = datetime(target_year, target_month, d, 23, 59, 59, 999999, tzinfo=timezone.utc)
        d_orgs = sum(1 for o in org_records if o.created_at <= day_cutoff)
        d_emps = sum(o.max_employees for o in org_records if o.created_at <= day_cutoff)
        daily_trends.append(
            DailyTrendPoint(
                day=d,
                date=f"{target_year}-{target_month:02d}-{d:02d}",
                day_label=f"{month_name} {d}",
                organizations=d_orgs,
                employees=d_emps,
            )
        )

    return DashboardMetricsResponse(
        selected_year=target_year,
        selected_month=target_month,
        kpis=KpiStats(
            total_organizations=total_orgs,
            total_admins=total_admins,
            total_employees=total_employees,
        ),
        organization_status=OrgStatusStats(
            active=active_count,
            trial=trial_count,
            suspended=suspended_count,
            total=total_orgs,
        ),
        daily_trends=daily_trends,
    )
