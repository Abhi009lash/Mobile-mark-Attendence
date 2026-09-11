import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from jwt import PyJWTError, ExpiredSignatureError

from app.core.config import settings
from app.core.exceptions import GeopointException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.otp import PasswordResetOTP
from app.models.user import UserStatus
from app.repositories.otp_repository import OTPRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse, VerifyOTPResponse
from app.schemas.user import UserResponse
from app.services.email_service import EmailService


class AuthService:
    def __init__(self, user_repo: UserRepository, otp_repo: OTPRepository):
        self.user_repo = user_repo
        self.otp_repo = otp_repo

    @staticmethod
    def _hash_otp(otp: str) -> str:
        return hashlib.sha256(otp.encode("utf-8")).hexdigest()

    def login(self, email: str, password: str) -> TokenResponse:
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise GeopointException(
                message="Invalid email or password.",
                code="INVALID_CREDENTIALS",
                status_code=401,
            )

        if user.status != UserStatus.ACTIVE:
            raise GeopointException(
                message=f"User account is {user.status.lower()}.",
                code="ACCOUNT_INACTIVE",
                status_code=403,
            )

        role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
        access_token = create_access_token(
            subject=str(user.id),
            org_id=str(user.organization_id) if user.organization_id else None,
            role=role_str,
        )
        refresh_token = create_refresh_token(subject=str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    def refresh_tokens(self, refresh_token: str) -> Tuple[str, str]:
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise GeopointException("Invalid token type.", code="INVALID_TOKEN", status_code=401)
            user_id = uuid.UUID(payload["sub"])
        except ExpiredSignatureError:
            raise GeopointException("Refresh token has expired. Please log in again.", code="TOKEN_EXPIRED", status_code=401)
        except (PyJWTError, ValueError, KeyError):
            raise GeopointException("Invalid refresh token.", code="INVALID_TOKEN", status_code=401)

        user = self.user_repo.get_by_id(user_id)
        if not user or user.status != UserStatus.ACTIVE:
            raise GeopointException("User not found or inactive.", code="USER_NOT_FOUND", status_code=401)

        role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
        new_access_token = create_access_token(
            subject=str(user.id),
            org_id=str(user.organization_id) if user.organization_id else None,
            role=role_str,
        )
        new_refresh_token = create_refresh_token(subject=str(user.id))
        return new_access_token, new_refresh_token

    def request_password_reset_otp(self, email: str) -> Optional[str]:
        """
        Generates a 6-digit numeric OTP, stores its SHA-256 hash in DB,
        and dispatches it via SMTP EmailService.
        Returns the plaintext OTP for testing/logging purposes.
        """
        user = self.user_repo.get_by_email(email)
        if not user or user.status != UserStatus.ACTIVE:
            # Anti-enumeration: return quietly
            return None

        # Invalidate any prior active OTPs for this user
        self.otp_repo.invalidate_all_user_otps(user.id)

        # Generate cryptographically secure 6-digit numeric OTP
        raw_otp = "".join(str(secrets.randbelow(10)) for _ in range(6))
        otp_hash = self._hash_otp(raw_otp)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        otp_record = PasswordResetOTP(
            user_id=user.id,
            otp_hash=otp_hash,
            expires_at=expires_at,
            attempts=0,
            is_used=False,
        )
        self.otp_repo.create(otp_record)

        # Dispatch via SMTP EmailService
        EmailService.send_password_reset_otp(
            recipient_email=user.email,
            full_name=user.full_name,
            otp=raw_otp,
        )
        return raw_otp

    def verify_password_reset_otp(self, email: str, otp: str) -> VerifyOTPResponse:
        """
        Verifies the submitted 6-digit OTP against the stored hash.
        Enforces maximum attempt rate-limiting and expiration.
        Returns a signed reset token if valid.
        """
        user = self.user_repo.get_by_email(email)
        if not user or user.status != UserStatus.ACTIVE:
            raise GeopointException("Invalid email or verification code.", code="INVALID_OTP", status_code=400)

        otp_record = self.otp_repo.get_latest_valid_otp(user.id)
        if not otp_record:
            raise GeopointException(
                message="Verification code is expired or invalid. Please request a new code.",
                code="EXPIRED_OTP",
                status_code=400,
            )

        # Check maximum attempts lockout
        if otp_record.attempts >= settings.OTP_MAX_ATTEMPTS:
            self.otp_repo.mark_used(otp_record)
            raise GeopointException(
                message="Too many failed verification attempts. Please request a new code.",
                code="MAX_ATTEMPTS_EXCEEDED",
                status_code=429,
            )

        # Verify hash
        submitted_hash = self._hash_otp(otp)
        if submitted_hash != otp_record.otp_hash:
            self.otp_repo.increment_attempts(otp_record)
            remaining = settings.OTP_MAX_ATTEMPTS - (otp_record.attempts + 1)
            raise GeopointException(
                message=f"Incorrect verification code. {max(0, remaining)} attempts remaining.",
                code="INVALID_OTP",
                status_code=400,
            )

        # Mark OTP as consumed
        self.otp_repo.mark_used(otp_record)

        # Issue 15-minute single-purpose verified reset token
        from app.core.security import create_password_reset_token
        reset_token = create_password_reset_token(subject=str(user.id))

        return VerifyOTPResponse(
            reset_token=reset_token,
            message="Verification successful. You may now update your password.",
        )

    def reset_password(self, reset_token: str, new_password: str) -> None:
        """Consumes the verified reset token and sets the new bcrypt password hash."""
        try:
            payload = decode_token(reset_token)
            if payload.get("type") != "reset":
                raise GeopointException("Invalid reset token type.", code="INVALID_TOKEN", status_code=400)
            user_id = uuid.UUID(payload["sub"])
        except ExpiredSignatureError:
            raise GeopointException("Reset session has expired. Please verify OTP again.", code="TOKEN_EXPIRED", status_code=400)
        except (PyJWTError, ValueError, KeyError):
            raise GeopointException("Invalid or malformed reset token.", code="INVALID_TOKEN", status_code=400)

        user = self.user_repo.get_by_id(user_id)
        if not user or user.status != UserStatus.ACTIVE:
            raise GeopointException("User account not found or inactive.", code="USER_NOT_FOUND", status_code=404)

        hashed = hash_password(new_password)
        self.user_repo.update_password(user, hashed)
