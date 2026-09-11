import logging
import sys
import os

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.core.init_db import (
    init_db,
    SUPERADMIN_EMAIL,
    SUPERADMIN_PASSWORD,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    DEFAULT_ORG_NAME,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seeder")


def main():
    logger.info("Initializing database with standard built-in accounts...")
    db = SessionLocal()
    try:
        init_db(db)
        logger.info("Database seeding completed successfully!")
        print("\n=======================================================")
        print("STANDARD ACCOUNTS CONFIGURED:")
        print(f"1. SUPER ADMIN (Platform Level):")
        print(f"   Email:    {SUPERADMIN_EMAIL}")
        print(f"   Password: {SUPERADMIN_PASSWORD}")
        print(f"2. ATTENDANCE ADMIN ({DEFAULT_ORG_NAME}):")
        print(f"   Email:    {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
        print("=======================================================\n")
    except Exception as e:
        logger.error(f"Seeding failed: {str(e)}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
