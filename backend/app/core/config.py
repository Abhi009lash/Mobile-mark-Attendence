import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # General
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "GeoPunch - Workforce Attendance SaaS"
    API_V1_STR: str = "/api/v1"

    # Security & Tokens
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 90
    JWT_SECRET_KEY: str = "geopunch_super_secret_jwt_key_secure_change_in_production_2026"
    JWT_ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = "sqlite:///./attendance.db"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "attendance_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # SMTP Email Configuration
    SMTP_HOST: Optional[str] = "smtp.mailtrap.io"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = True
    EMAILS_FROM_EMAIL: str = "no-reply@geopunch.io"
    EMAILS_FROM_NAME: str = "GeoPunch Workforce Platform"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:8000",
        "*"
    ]


settings = Settings()
