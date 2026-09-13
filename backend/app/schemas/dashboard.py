from typing import List
from pydantic import BaseModel


class KpiStats(BaseModel):
    total_organizations: int
    total_admins: int
    total_employees: int


class OrgStatusStats(BaseModel):
    active: int
    trial: int
    suspended: int
    total: int


class DailyTrendPoint(BaseModel):
    day: int
    date: str
    day_label: str
    organizations: int
    employees: int


class DashboardMetricsResponse(BaseModel):
    selected_year: int
    selected_month: int
    kpis: KpiStats
    organization_status: OrgStatusStats
    daily_trends: List[DailyTrendPoint]
