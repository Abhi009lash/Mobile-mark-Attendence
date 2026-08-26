from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, TokenRefreshRequest, LogoutRequest
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter()
security = HTTPBearer(auto_error=False)


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return a 15-minute JWT access token and 90-day refresh token.
    """
    user = AuthService.authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    return AuthService.generate_token_pair(user)


@router.post("/refresh", response_model=TokenResponse)
def refresh_tokens(request: TokenRefreshRequest, db: Session = Depends(get_db)):
    """
    Refresh a 15-minute access token using a valid 90-day refresh token.
    Rotates the refresh token for maximum security.
    """
    return AuthService.refresh_tokens(db, request.refresh_token)


@router.post("/logout")
def logout(
    request: LogoutRequest,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
):
    """
    Logout the user and blacklist their active JWT and refresh tokens in Redis.
    """
    token_jti = None
    if credentials:
        try:
            payload = decode_token(credentials.credentials)
            token_jti = payload.get("jti")
        except Exception:
            pass

    AuthService.logout(token_jti=token_jti, refresh_token=request.refresh_token)
    return {"message": "Successfully logged out and revoked tokens."}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get profile information of the currently authenticated user.
    """
    return current_user
