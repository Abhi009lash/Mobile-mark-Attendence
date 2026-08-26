from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    # Access token expires in 15 minutes = 900 seconds
    expires_in: int = 900
    user_id: int
    email: str
    name: str
    role: str
    organization_id: Optional[int] = None
    branch_id: Optional[int] = None


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class TokenPayload(BaseModel):
    sub: str
    organization_id: Optional[int] = None
    role: Optional[str] = None
    type: str
    jti: str
    iat: int
    exp: int


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None
