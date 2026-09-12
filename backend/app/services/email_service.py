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

    @classmethod
    def send_organization_onboarding_email(
        cls,
        recipient_email: str,
        name: str,
        slug: str,
        code: str,
        max_admins: int,
        max_employees: int,
    ) -> bool:
        subject = f"Welcome to Geopoint - {name} Registration Confirmed"
        text_body = (
            f"Hello,\n\n"
            f"Your organization '{name}' has been successfully onboarded to Geopoint.\n\n"
            f"Organization Code: {code}\n"
            f"Slug: {slug}\n"
            f"Allocated Admin Quota: {max_admins}\n"
            f"Allocated Employee Quota: {max_employees}\n\n"
            f"An attendance administrator will be provisioned by the platform shortly.\n\n"
            f"Best regards,\nGeopoint Platform Team"
        )
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #1657DE; margin: 0;">Welcome to Geopoint</h2>
                <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Multi-Tenant Workforce & Attendance Platform</p>
            </div>
            <p style="color: #334155; font-size: 15px;">Your organization <strong>{name}</strong> has been registered on the platform.</p>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #475569;">
                    <tr><td style="padding: 6px 0;"><strong>Company:</strong></td><td>{name}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Org Code:</strong></td><td><code style="background: #EFF6FF; color: #1D4ED8; padding: 2px 6px; border-radius: 4px;">{code}</code></td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Slug:</strong></td><td>{slug}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Allowed Admins:</strong></td><td>{max_admins}</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Allowed Employees:</strong></td><td>{max_employees}</td></tr>
                </table>
            </div>
            <p style="color: #64748B; font-size: 13px;">An organization administrator account will be provisioned by the platform shortly.</p>
            <p style="color: #94A3B8; font-size: 12px; margin-top: 24px; text-align: center;">Geopoint Platform &copy; 2026</p>
        </div>
        """
        return cls.send_email(recipient_email, subject, text_body, html_body)

    @classmethod
    def send_admin_credentials_email(
        cls,
        recipient_email: str,
        full_name: str,
        organization_name: str,
        temp_password: str,
    ) -> bool:
        subject = f"Your Geopoint Administrator Account - {organization_name}"
        text_body = (
            f"Hello {full_name},\n\n"
            f"You have been appointed as an Attendance Administrator for {organization_name} on Geopoint.\n\n"
            f"Login Email: {recipient_email}\n"
            f"Password: {temp_password}\n\n"
            f"Please sign in to configure your office settings and onboard your employees.\n\n"
            f"Best regards,\nGeopoint Platform Team"
        )
        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #1657DE; margin: 0;">Geopoint Administrator Access</h2>
                <p style="color: #64748B; font-size: 14px; margin-top: 4px;">{organization_name}</p>
            </div>
            <p style="color: #334155; font-size: 15px;">Hello <strong>{full_name}</strong>,</p>
            <p style="color: #475569; font-size: 14px;">An administrator account has been provisioned for you. Use the credentials below to access the Geopoint management portal:</p>
            <div style="background: #F1F5F9; border-radius: 8px; padding: 18px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; color: #475569; font-size: 14px;"><strong>Email:</strong> {recipient_email}</p>
                <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Password:</strong> <code style="background: #FFFFFF; border: 1px solid #CBD5E1; padding: 3px 8px; border-radius: 4px; color: #0F172A; font-weight: bold;">{temp_password}</code></p>
            </div>
            <p style="color: #64748B; font-size: 13px;">Once signed in, you can configure your office geofence location and manage your team members.</p>
            <p style="color: #94A3B8; font-size: 12px; margin-top: 24px; text-align: center;">Geopoint Security Team</p>
        </div>
        """
        return cls.send_email(recipient_email, subject, text_body, html_body)

