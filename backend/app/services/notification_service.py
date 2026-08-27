from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.services.push_notification_service import PushNotificationService


class NotificationService:
    @staticmethod
    def send_notification(
        db: Session,
        organization_id: int,
        user_id: int,
        title: str,
        body: str,
        notif_type: str = NotificationType.ANNOUNCEMENT.value
    ) -> Notification:
        # 1. In-App Notification record
        notif = Notification(
            organization_id=organization_id,
            user_id=user_id,
            title=title,
            body=body,
            type=notif_type,
            is_read=False
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)

        # 2. Dispatch Native Mobile Push Notification (System Status Bar Alert)
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.push_token:
            PushNotificationService.send_mobile_push(
                push_token=user.push_token,
                title=title,
                body=body,
                data={"type": notif_type, "notification_id": notif.id}
            )

        return notif

    @classmethod
    def send_check_in_alert(cls, db: Session, organization_id: int, user_id: int, start_time: str = "09:00 AM"):
        """Native Mobile & In-app Check-in reminder alert."""
        return cls.send_notification(
            db=db,
            organization_id=organization_id,
            user_id=user_id,
            title="⏰ Check-In Reminder",
            body=f"Your shift begins at {start_time}. Don't forget to GPS punch-in to avoid late mark.",
            notif_type=NotificationType.CHECK_IN_ALERT.value
        )

    @classmethod
    def send_check_out_alert(cls, db: Session, organization_id: int, user_id: int):
        """Native Mobile & In-app Check-out reminder alert."""
        return cls.send_notification(
            db=db,
            organization_id=organization_id,
            user_id=user_id,
            title="🏁 Shift Completed",
            body="Your work shift has ended. Remember to GPS punch-out before leaving premises.",
            notif_type=NotificationType.CHECK_OUT_ALERT.value
        )

    @classmethod
    def send_leave_decision_alert(
        cls,
        db: Session,
        organization_id: int,
        user_id: int,
        leave_type: str,
        is_approved: bool,
        approver_name: str,
        comment: Optional[str] = None
    ):
        """Native Mobile & In-app Leave decision alert."""
        status_text = "APPROVED" if is_approved else "REJECTED"
        notif_type = NotificationType.LEAVE_APPROVED.value if is_approved else NotificationType.LEAVE_REJECTED.value
        body = f"Your {leave_type} request was {status_text} by {approver_name}."
        if comment:
            body += f" Note: {comment}"

        return cls.send_notification(
            db=db,
            organization_id=organization_id,
            user_id=user_id,
            title=f"🌴 Leave Request {status_text}",
            body=body,
            notif_type=notif_type
        )

    @classmethod
    def send_regularization_decision_alert(
        cls,
        db: Session,
        organization_id: int,
        user_id: int,
        date_str: str,
        is_approved: bool,
        approver_name: str,
        reason: Optional[str] = None
    ):
        """Native Mobile & In-app Regularization decision alert."""
        status_text = "APPROVED" if is_approved else "REJECTED"
        notif_type = (
            NotificationType.REGULARIZATION_APPROVED.value
            if is_approved
            else NotificationType.REGULARIZATION_REJECTED.value
        )
        body = f"Your attendance regularization for {date_str} has been {status_text} by {approver_name}."
        if reason:
            body += f" Feedback: {reason}"

        return cls.send_notification(
            db=db,
            organization_id=organization_id,
            user_id=user_id,
            title=f"⏳ Regularization {status_text}",
            body=body,
            notif_type=notif_type
        )
