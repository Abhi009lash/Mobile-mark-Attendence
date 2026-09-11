from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.repositories.otp_repository import OTPRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
)
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter()


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    user_repo = UserRepository(db)
    otp_repo = OTPRepository(db)
    return AuthService(user_repo, otp_repo)


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(request: LoginRequest, auth_service: AuthService = Depends(get_auth_service)):
    """Authenticate user with email and password, returning access and refresh tokens."""
    return auth_service.login(email=request.email, password=request.password)


@router.post("/logout", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def logout(current_user: User = Depends(get_current_user)):
    """Log out authenticated user and acknowledge session termination."""
    return MessageResponse(message="Successfully logged out.")


@router.post("/forgot-password", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def forgot_password(
    request: ForgotPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Initiate password reset by dispatching a 6-digit OTP to the registered email.
    Always returns success to prevent user email enumeration.
    """
    raw_otp = auth_service.request_password_reset_otp(email=request.email)
    dev_otp = raw_otp if (settings.ENVIRONMENT == "development" and not settings.EMAILS_ENABLED) else None
    return MessageResponse(
        message="If this email is registered, a 6-digit verification code has been dispatched to your inbox.",
        dev_otp=dev_otp,
    )


@router.post("/verify-otp", response_model=VerifyOTPResponse, status_code=status.HTTP_200_OK)
def verify_otp(
    request: VerifyOTPRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Verify the 6-digit OTP sent to the user's email.
    Returns a single-use verified reset_token upon successful validation.
    """
    return auth_service.verify_password_reset_otp(email=request.email, otp=request.otp)


@router.post("/reset-password", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def reset_password(
    request: ResetPasswordRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Update password using the verified reset_token obtained from OTP verification.
    """
    auth_service.reset_password(reset_token=request.reset_token, new_password=request.new_password)
    return MessageResponse(message="Password has been successfully updated. You may now log in.")


@router.post("/refresh", status_code=status.HTTP_200_OK)
def refresh(
    request: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Exchange a valid refresh token for a new access token and refresh token."""
    access_token, refresh_token = auth_service.refresh_tokens(request.refresh_token)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve the profile of the currently authenticated user."""
    return UserResponse.model_validate(current_user)
