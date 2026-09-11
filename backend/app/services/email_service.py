import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Enterprise SMTP email dispatch service with graceful fallback logging."""

    @staticmethod
    def send_email(
        recipient_email: str,
        subject: str,
        text_body: str,
        html_body: Optional[str] = None,
    ) -> bool:
        if not settings.EMAILS_ENABLED or not settings.SMTP_HOST:
            logger.info(
                f"[DEV EMAIL LOG] To: {recipient_email} | Subject: {subject} | Body: {text_body}"
            )
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = recipient_email

            msg.attach(MIMEText(text_body, "plain", "utf-8"))
            if html_body:
                msg.attach(MIMEText(html_body, "html", "utf-8"))

            if settings.SMTP_SSL:
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
                if settings.SMTP_TLS:
                    server.starttls()

            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)

            server.sendmail(settings.SMTP_FROM_EMAIL, [recipient_email], msg.as_string())
            server.quit()
            logger.info(f"Email successfully dispatched to {recipient_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to dispatch email to {recipient_email}: {str(e)}")
            return False

    @classmethod
    def send_password_reset_otp(cls, recipient_email: str, full_name: str, otp: str) -> bool:
        subject = "Geopoint - Password Reset Verification Code"
        text_body = (
            f"Hello {full_name},\n\n"
            f"Your verification code for resetting your Geopoint password is: {otp}\n\n"
            f"This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.\n"
            f"If you did not request a password reset, please ignore this email.\n\n"
            f"Best regards,\nGeopoint Security Team"
        )
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #1657DE; margin-bottom: 8px;">Geopoint Security</h2>
            <p style="color: #475569; font-size: 15px;">Hello <strong>{full_name}</strong>,</p>
            <p style="color: #475569; font-size: 15px;">You requested a password reset for your account. Please use the following 6-digit One-Time Password (OTP):</p>
            <div style="background: #F1F5F9; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0F172A;">{otp}</span>
            </div>
            <p style="color: #64748B; font-size: 13px;">This OTP is valid for <strong>{settings.OTP_EXPIRE_MINUTES} minutes</strong> and can only be used once.</p>
            <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">If you did not request this code, no action is needed.</p>
        </div>
        """
        return cls.send_email(recipient_email, subject, text_body, html_body)
