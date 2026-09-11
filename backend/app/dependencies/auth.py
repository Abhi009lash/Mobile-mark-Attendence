import uuid
from fastapi import Depends, Header
from jwt import ExpiredSignatureError, PyJWTError
from sqlalchemy.orm import Session

from app.core.exceptions import GeopointException
from app.core.security import decode_token
from app.dependencies.db import get_db
from app.models.user import User, UserStatus
from app.repositories.user_repository import UserRepository


def get_current_user(
    authorization: str = Header(..., description="Bearer <token>"),
    db: Session = Depends(get_db),
) -> User:
    """
    Extracts and cryptographically verifies the JWT from Authorization header.
    Returns the authenticated active User instance.
    """
    if not authorization.startswith("Bearer "):
        raise GeopointException(
            message="Invalid authorization header format. Expected 'Bearer <token>'.",
            code="INVALID_AUTH_HEADER",
            status_code=401,
        )

    token = authorization.split(" ")[1].strip()
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise GeopointException("Token is not an access token.", code="INVALID_TOKEN", status_code=401)
        user_id = uuid.UUID(payload["sub"])
    except ExpiredSignatureError:
        raise GeopointException("Access token has expired.", code="TOKEN_EXPIRED", status_code=401)
    except (PyJWTError, ValueError, KeyError):
        raise GeopointException("Invalid access token.", code="INVALID_TOKEN", status_code=401)

    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user:
        raise GeopointException("User no longer exists.", code="USER_NOT_FOUND", status_code=401)
    if user.status != UserStatus.ACTIVE:
        raise GeopointException("User account is inactive.", code="ACCOUNT_INACTIVE", status_code=403)

    return user
