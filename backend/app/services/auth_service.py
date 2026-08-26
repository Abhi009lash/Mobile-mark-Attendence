from datetime import timedelta
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.redis import redis_service
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse


class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        repo = UserRepository(db)
        user = repo.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated or suspended."
            )
        return user

    @staticmethod
    def generate_token_pair(user: User) -> TokenResponse:
        """
        Generate a 15-minute access token and 90-day refresh token.
        """
        access_token = create_access_token(
            subject=user.id,
            organization_id=user.organization_id,
            role=user.role,
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            custom_claims={"email": user.email, "name": user.name}
        )

        refresh_token = create_refresh_token(
            subject=user.id,
            organization_id=user.organization_id,
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # 900 seconds
            user_id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            organization_id=user.organization_id,
            branch_id=user.branch_id
        )

    @staticmethod
    def refresh_tokens(db: Session, refresh_token: str) -> TokenResponse:
        """
        Validate 90-day refresh token, rotate it, and issue a fresh 15-minute access token.
        """
        try:
            payload = decode_token(refresh_token)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type."
            )

        jti = payload.get("jti")
        if jti and redis_service.is_token_blacklisted(jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has been revoked."
            )

        user_id = int(payload.get("sub"))
        repo = UserRepository(db)
        user = repo.get(user_id)
        if not user or user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive."
            )

        # Blacklist the old refresh token (rotation)
        if jti:
            redis_service.blacklist_token(jti, exp_seconds=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400)

        # Issue new token pair
        return AuthService.generate_token_pair(user)

    @staticmethod
    def logout(token_jti: Optional[str] = None, refresh_token: Optional[str] = None) -> bool:
        """Revoke access token and refresh token in Redis."""
        if token_jti:
            redis_service.blacklist_token(token_jti, exp_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        if refresh_token:
            try:
                payload = decode_token(refresh_token)
                ref_jti = payload.get("jti")
                if ref_jti:
                    redis_service.blacklist_token(ref_jti, exp_seconds=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400)
            except Exception:
                pass
        return True
