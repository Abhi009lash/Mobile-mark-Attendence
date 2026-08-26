import logging
from typing import List
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.employee import Employee
from app.models.attendance import Attendance, AttendanceStatus, AttendanceSource
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.attendance import OfflineSyncBatchRequest, OfflineSyncBatchResponse, OfflineSyncItem
from app.core.redis import redis_service

logger = logging.getLogger(__name__)


class SyncService:
    @staticmethod
    def process_offline_batch(
        db: Session,
        current_user: User,
        batch_req: OfflineSyncBatchRequest
    ) -> OfflineSyncBatchResponse:
        """
        Process offline attendance records submitted when mobile reconnects.
        Ensures idempotency using client_id and unique org/employee/date constraint.
        """
        emp_repo = EmployeeRepository(db)
        att_repo = AttendanceRepository(db)

        synced_count = 0
        skipped_count = 0
        failed_count = 0
        details: List[dict] = []

        for item in batch_req.items:
            # 1. Check client_id idempotency key in Redis
            idempotency_key = f"sync_{current_user.organization_id}_{item.client_id}"
            if redis_service.cache_get(idempotency_key):
                skipped_count += 1
                details.append({
                    "client_id": item.client_id,
                    "status": "skipped",
                    "reason": "Duplicate sync request (already processed)"
                })
                continue

            try:
                # 2. Check employee belongs to current user/organization
                emp = emp_repo.get_by_org(item.employee_id, current_user.organization_id)
                if not emp:
                    failed_count += 1
                    details.append({
                        "client_id": item.client_id,
                        "status": "failed",
                        "reason": "Invalid employee or access denied"
                    })
                    continue

                # 3. Check if attendance already exists for that date
                existing = att_repo.get_by_employee_and_date(
                    current_user.organization_id, emp.id, item.date
                )

                if existing:
                    # Update check-out if not present
                    if item.check_out and not existing.check_out:
                        existing.check_out = item.check_out
                        existing.check_out_latitude = item.check_out_latitude
                        existing.check_out_longitude = item.check_out_longitude
                        db.commit()
                    skipped_count += 1
                    details.append({
                        "client_id": item.client_id,
                        "status": "merged",
                        "attendance_id": existing.id
                    })
                else:
                    # Create new attendance record
                    new_att = Attendance(
                        organization_id=current_user.organization_id,
                        employee_id=emp.id,
                        location_id=item.location_id,
                        date=item.date,
                        check_in=item.check_in,
                        check_in_latitude=item.check_in_latitude,
                        check_in_longitude=item.check_in_longitude,
                        check_out=item.check_out,
                        check_out_latitude=item.check_out_latitude,
                        check_out_longitude=item.check_out_longitude,
                        status=AttendanceStatus.PRESENT.value,
                        source=AttendanceSource.OFFLINE_SYNC.value
                    )
                    db.add(new_att)
                    db.commit()
                    db.refresh(new_att)

                    synced_count += 1
                    details.append({
                        "client_id": item.client_id,
                        "status": "synced",
                        "attendance_id": new_att.id
                    })

                # Mark as processed in Redis (7 days TTL)
                redis_service.cache_set(idempotency_key, "synced", ttl_seconds=7 * 86400)

            except Exception as e:
                db.rollback()
                failed_count += 1
                logger.error(f"Sync error for item {item.client_id}: {e}")
                details.append({
                    "client_id": item.client_id,
                    "status": "failed",
                    "reason": str(e)
                })

        return OfflineSyncBatchResponse(
            synced_count=synced_count,
            skipped_count=skipped_count,
            failed_count=failed_count,
            details=details
        )
