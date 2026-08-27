from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse

router = APIRouter()


@router.get("", response_model=List[NotificationResponse])
def list_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all in-app notifications for the logged-in user."""
    return db.query(Notification).filter(
        Notification.organization_id == current_user.organization_id,
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a specific notification as read."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.organization_id == current_user.organization_id,
        Notification.user_id == current_user.id
    ).first()

    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif
