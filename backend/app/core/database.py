from typing import Generator
import logging
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger(__name__)

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def auto_migrate_schema(db_engine):
    """
    Safely inspects existing tables and automatically adds missing columns
    (e.g., push_token, user_limit) without requiring manual Alembic migrations.
    """
    try:
        inspector = inspect(db_engine)
        tables = inspector.get_table_names()

        with db_engine.connect() as conn:
            # 1. Check users.push_token
            if "users" in tables:
                columns = [c["name"] for c in inspector.get_columns("users")]
                if "push_token" not in columns:
                    logger.info("Migrating schema: Adding push_token to users table...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN push_token VARCHAR(255)"))
                    conn.commit()

            # 2. Check organizations.user_limit
            if "organizations" in tables:
                columns = [c["name"] for c in inspector.get_columns("organizations")]
                if "user_limit" not in columns:
                    logger.info("Migrating schema: Adding user_limit to organizations table...")
                    conn.execute(text("ALTER TABLE organizations ADD COLUMN user_limit INTEGER DEFAULT 50"))
                    conn.commit()
    except Exception as e:
        logger.warning(f"Auto-schema migration notice: {e}")


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session and ensures it is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
