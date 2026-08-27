from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    organizations,
    users,
    branches,
    employees,
    locations,
    attendance,
    leaves,
    policies,
    reports,
    regularizations,
    audit_logs,
    shifts,
    holidays,
    notifications,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(branches.router, prefix="/branches", tags=["Branches"])
api_router.include_router(employees.router, prefix="/employees", tags=["Employees"])
api_router.include_router(locations.router, prefix="/locations", tags=["Locations"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(leaves.router, prefix="/leaves", tags=["Leaves"])
api_router.include_router(policies.router, prefix="/policies", tags=["Attendance Policies"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Analytics"])
api_router.include_router(regularizations.router, prefix="/regularizations", tags=["Attendance Regularizations"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["Audit Logs"])
api_router.include_router(shifts.router, prefix="/shifts", tags=["Shifts & Rosters"])
api_router.include_router(holidays.router, prefix="/holidays", tags=["Holidays"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
