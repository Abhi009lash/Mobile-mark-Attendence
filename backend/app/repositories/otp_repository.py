import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.models.otp import PasswordResetOTP


class OTPRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, otp_record: PasswordResetOTP) -> PasswordResetOTP:
        self.db.add(otp_record)
        self.db.commit()
        self.db.refresh(otp_record)
        return otp_record

    def get_latest_valid_otp(self, user_id: uuid.UUID) -> Optional[PasswordResetOTP]:
        now = datetime.now(timezone.utc)
        return (
            self.db.query(PasswordResetOTP)
            .filter(
                PasswordResetOTP.user_id == user_id,
                PasswordResetOTP.is_used == False,
                PasswordResetOTP.expires_at > now,
            )
            .order_by(PasswordResetOTP.created_at.desc())
            .first()
        )

    def increment_attempts(self, otp_record: PasswordResetOTP) -> None:
        otp_record.attempts += 1
        self.db.commit()

    def mark_used(self, otp_record: PasswordResetOTP) -> None:
        otp_record.is_used = True
        self.db.commit()

    def invalidate_all_user_otps(self, user_id: uuid.UUID) -> None:
        self.db.query(PasswordResetOTP).filter(
            PasswordResetOTP.user_id == user_id,
            PasswordResetOTP.is_used == False,
        ).update({"is_used": True})
        self.db.commit()
