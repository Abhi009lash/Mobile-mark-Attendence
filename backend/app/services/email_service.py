import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def _send_email(
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None
    ) -> bool:
        """Internal helper to dispatch emails via SMTP with fallback logger in dev/testing."""
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.info(
                f"[EMAIL MOCK] To: {to_email} | Subject: {subject}\n{html_body}"
            )
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg["To"] = to_email

            if text_body:
                msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, to_email, msg.as_string())
            logger.info(f"Email successfully sent to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    @classmethod
    def send_organization_credentials(
        cls,
        org_name: str,
        org_email: str,
        admin_email: str,
        temporary_password: str,
        portal_url: str = "http://localhost:8000"
    ) -> bool:
        """Scenario 1: Send login credentials when an organization is created."""
        subject = f"Welcome to GeoPunch - Credentials for {org_name}"
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1E293B;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; background: #FFFFFF;">
              <h2 style="color: #2563EB; margin-top: 0;">Welcome to GeoPunch!</h2>
              <p>Hello <strong>{org_name}</strong> Team,</p>
              <p>Your multi-tenant workforce attendance organization has been successfully provisioned.</p>
              
              <div style="background: #F8FAFC; border-left: 4px solid #2563EB; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #0F172A;">Your Administrator Credentials:</h3>
                <p style="margin: 4px 0;"><strong>Portal URL:</strong> <a href="{portal_url}">{portal_url}</a></p>
                <p style="margin: 4px 0;"><strong>Admin Email:</strong> {admin_email}</p>
                <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <code style="background: #E2E8F0; padding: 2px 6px; border-radius: 4px;">{temporary_password}</code></p>
              </div>
              
              <p>Please log in and configure your attendance policy, branches, and GPS geofences.</p>
              <p style="color: #64748B; font-size: 12px; margin-top: 30px;">GeoPunch Workforce SaaS • Automated Notification</p>
            </div>
          </body>
        </html>
        """
        return cls._send_email(to_email=org_email, subject=subject, html_body=html_body)

    @classmethod
    def send_user_account_created_email(
        cls,
        user_name: str,
        user_email: str,
        role: str,
        temporary_password: str,
        organization_name: str = "Your Organization",
        portal_url: str = "http://localhost:8000"
    ) -> bool:
        """Universal: Send login credentials whenever ANY account is created."""
        subject = f"Your GeoPunch Account Credentials - {organization_name}"
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1E293B;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; background: #FFFFFF;">
              <h2 style="color: #2563EB; margin-top: 0;">Welcome to GeoPunch, {user_name}!</h2>
              <p>An account has been created for you at <strong>{organization_name}</strong>.</p>
              
              <div style="background: #F8FAFC; border-left: 4px solid #2563EB; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #0F172A;">Your Login Credentials:</h3>
                <p style="margin: 4px 0;"><strong>Assigned Role:</strong> {role.replace('_', ' ').title()}</p>
                <p style="margin: 4px 0;"><strong>Login Email:</strong> {user_email}</p>
                <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <code style="background: #E2E8F0; padding: 2px 6px; border-radius: 4px;">{temporary_password}</code></p>
                <p style="margin: 4px 0;"><strong>Login Portal:</strong> <a href="{portal_url}">{portal_url}</a></p>
              </div>
              
              <p>Please download the mobile app or open the portal to mark attendance and manage your shifts.</p>
              <p style="color: #64748B; font-size: 12px; margin-top: 30px;">GeoPunch Workforce SaaS • Automated Notification</p>
            </div>
          </body>
        </html>
        """
        return cls._send_email(to_email=user_email, subject=subject, html_body=html_body)

    @classmethod
    def send_monthly_attendance_report(
        cls,
        org_name: str,
        org_email: str,
        month_name: str,
        stats: Dict[str, Any]
    ) -> bool:
        """Scenario 2: Send monthly attendance summary report to organization email."""
        subject = f"Monthly Attendance Report ({month_name}) - {org_name}"
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1E293B;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; background: #FFFFFF;">
              <h2 style="color: #2563EB; margin-top: 0;">Monthly Attendance Summary</h2>
              <p>Dear Management Team at <strong>{org_name}</strong>,</p>
              <p>Here is your aggregated workforce attendance digest for <strong>{month_name}</strong>:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #F1F5F9;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #E2E8F0;">Metric</th>
                  <th style="padding: 10px; text-align: right; border: 1px solid #E2E8F0;">Count</th>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #E2E8F0;">Total Registered Staff</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #E2E8F0; font-weight: bold;">{stats.get('total_staff', 0)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #E2E8F0; color: #10B981;">Total Present Days</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #E2E8F0; font-weight: bold; color: #10B981;">{stats.get('present_days', 0)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #E2E8F0; color: #F59E0B;">Late Arrivals</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #E2E8F0; font-weight: bold; color: #F59E0B;">{stats.get('late_days', 0)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #E2E8F0; color: #EF4444;">Absent Days</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #E2E8F0; font-weight: bold; color: #EF4444;">{stats.get('absent_days', 0)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #E2E8F0; color: #6366F1;">Regularized Records</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #E2E8F0; font-weight: bold; color: #6366F1;">{stats.get('regularized_days', 0)}</td>
                </tr>
              </table>
              
              <p>For itemized CSV / Excel payroll exports, please visit your <a href="http://localhost:8000">GeoPunch Admin Portal</a>.</p>
              <p style="color: #64748B; font-size: 12px; margin-top: 30px;">GeoPunch Workforce SaaS • Automated Monthly Report</p>
            </div>
          </body>
        </html>
        """
        return cls._send_email(to_email=org_email, subject=subject, html_body=html_body)
