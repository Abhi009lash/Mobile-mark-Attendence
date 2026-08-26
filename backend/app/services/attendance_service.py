from datetime import date, datetime, timezone, time
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.employee import Employee
from app.models.attendance import Attendance, AttendanceStatus, AttendanceSource
from app.models.location import Location
from app.models.policy import AttendancePolicy
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.location_repository import LocationRepository
from app.schemas.attendance import CheckInRequest, CheckOutRequest
from app.utils.geofence import is_within_geofence, haversine_distance


class AttendanceService:
    @staticmethod
    def _find_matching_location(
        db: Session,
        organization_id: int,
        user_lat: float,
        user_lon: float,
        location_id: Optional[int] = None,
        branch_id: Optional[int] = None
    ) -> Tuple[Location, float]:
        """Find the target location and verify user is within geofence."""
        loc_repo = LocationRepository(db)

        if location_id:
            loc = loc_repo.get_by_org(location_id, organization_id)
            if not loc or loc.status != "active":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Specified location not found or inactive."
                )
            inside, dist = is_within_geofence(
                user_lat, user_lon, loc.latitude, loc.longitude, loc.radius
            )
            if not inside:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Outside allowed geofence area. You are {dist:.1f}m away from '{loc.name}' (allowed radius: {loc.radius}m)."
                )
            return loc, dist

        # Find best active location in branch/organization
        locations = loc_repo.list_active_locations(organization_id, branch_id=branch_id)
        if not locations:
            # Also check all organization locations
            locations = loc_repo.list_active_locations(organization_id)

        if not locations:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active work locations configured for this organization."
            )

        best_loc: Optional[Location] = None
        min_dist = float("inf")

        for loc in locations:
            dist = haversine_distance(user_lat, user_lon, loc.latitude, loc.longitude)
            if dist < min_dist:
                min_dist = dist
                best_loc = loc

        if not best_loc or min_dist > best_loc.radius:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Outside geofence area. Nearest location '{best_loc.name if best_loc else 'N/A'}' is {min_dist:.1f}m away (allowed: {best_loc.radius if best_loc else 100}m)."
            )

        return best_loc, min_dist

    @staticmethod
    def _evaluate_attendance_status(
        db: Session,
        organization_id: int,
        check_in_dt: datetime
    ) -> str:
        """Determine whether check-in is on-time or late based on policy."""
        policy = db.query(AttendancePolicy).filter(
            AttendancePolicy.organization_id == organization_id
        ).first()

        if not policy or not policy.working_start_time:
            return AttendanceStatus.PRESENT.value

        start_time: time = policy.working_start_time
        # Convert check-in time to minutes from midnight
        check_in_minutes = check_in_dt.hour * 60 + check_in_dt.minute
        start_minutes = start_time.hour * 60 + start_time.minute
        late_threshold = policy.late_threshold or 15

        if check_in_minutes > (start_minutes + late_threshold):
            return AttendanceStatus.LATE.value
        return AttendanceStatus.PRESENT.value

    @staticmethod
    def check_in(
        db: Session,
        user: User,
        data: CheckInRequest,
        source: str = AttendanceSource.MOBILE.value
    ) -> Attendance:
        emp_repo = EmployeeRepository(db)
        employee = emp_repo.get_by_user_id(user.id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee profile not found for this user."
            )

        now_utc = data.client_timestamp or datetime.now(timezone.utc)
        today = now_utc.date()

        att_repo = AttendanceRepository(db)
        existing = att_repo.get_by_employee_and_date(
            user.organization_id, employee.id, today
        )
        if existing and existing.check_in is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attendance already marked for today."
            )

        # Validate Geofence
        location, _ = AttendanceService._find_matching_location(
            db=db,
            organization_id=user.organization_id,
            user_lat=data.latitude,
            user_lon=data.longitude,
            location_id=data.location_id,
            branch_id=employee.branch_id
        )

        status_val = AttendanceService._evaluate_attendance_status(
            db, user.organization_id, now_utc
        )

        if existing:
            # Update existing placeholder
            existing.check_in = now_utc
            existing.check_in_latitude = data.latitude
            existing.check_in_longitude = data.longitude
            existing.location_id = location.id
            existing.status = status_val
            existing.source = source
            db.commit()
            db.refresh(existing)
            return existing

        # Create new attendance record
        new_att = Attendance(
            organization_id=user.organization_id,
            employee_id=employee.id,
            location_id=location.id,
            date=today,
            check_in=now_utc,
            check_in_latitude=data.latitude,
            check_in_longitude=data.longitude,
            status=status_val,
            source=source
        )
        db.add(new_att)
        db.commit()
        db.refresh(new_att)
        return new_att

    @staticmethod
    def check_out(
        db: Session,
        user: User,
        data: CheckOutRequest
    ) -> Attendance:
        emp_repo = EmployeeRepository(db)
        employee = emp_repo.get_by_user_id(user.id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee profile not found for this user."
            )

        now_utc = data.client_timestamp or datetime.now(timezone.utc)
        today = now_utc.date()

        att_repo = AttendanceRepository(db)
        existing = att_repo.get_by_employee_and_date(
            user.organization_id, employee.id, today
        )
        if not existing or existing.check_in is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot check out without checking in first today."
            )

        if existing.check_out is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already checked out for today."
            )

        existing.check_out = now_utc
        existing.check_out_latitude = data.latitude
        existing.check_out_longitude = data.longitude
        db.commit()
        db.refresh(existing)
        return existing
