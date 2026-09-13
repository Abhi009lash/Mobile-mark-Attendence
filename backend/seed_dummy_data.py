"""
Seed script to populate/clear realistic dummy Organizations and Attendance Admins
staggered day-by-day across September 2026 for testing graphs, KPIs, and status.
Strictly adheres to < 250 lines rule.
"""
import sys
from datetime import datetime, timezone
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.organization import Organization, OrganizationStatus
from app.models.user import User, UserRole, UserStatus

DUMMY_FLEET = [
    # (Day, Name, Code, Slug, Email, City, State, Status, MaxAdm, MaxEmp, [(AdminName, AdminEmail, AdminStatus)])
    (1, "Apex Logistics Ltd", "APEX", "apex-logistics", "ops@apexlogistics.com", "Mumbai", "Maharashtra", OrganizationStatus.ACTIVE, 3, 150, [
        ("Jane Doe", "jane.doe@apexlogistics.com", UserStatus.ACTIVE),
        ("Rohit Sharma", "rohit.s@apexlogistics.com", UserStatus.ACTIVE),
    ]),
    (2, "BlueWave Health Systems", "BWHS", "bluewave-health", "info@bluewavehealth.org", "Bengaluru", "Karnataka", OrganizationStatus.ACTIVE, 4, 250, [
        ("Dr. Priya Rao", "priya.rao@bluewavehealth.org", UserStatus.ACTIVE),
    ]),
    (3, "CloudMatrix Technologies", "CMTX", "cloudmatrix-tech", "hello@cloudmatrix.io", "Hyderabad", "Telangana", OrganizationStatus.ACTIVE, 2, 80, [
        ("Karthik Verma", "karthik.v@cloudmatrix.io", UserStatus.ACTIVE),
    ]),
    (4, "DeltaFin Financial Services", "DFIN", "deltafin-services", "support@deltafin.com", "Mumbai", "Maharashtra", OrganizationStatus.ACTIVE, 3, 180, [
        ("Ananya Deshmukh", "ananya.d@deltafin.com", UserStatus.ACTIVE),
        ("Vikram Singhania", "vikram.s@deltafin.com", UserStatus.ACTIVE),
    ]),
    (5, "EcoGreen Renewable Power", "EGRP", "ecogreen-power", "contact@ecogreenpower.in", "Pune", "Maharashtra", OrganizationStatus.TRIAL, 2, 40, [
        ("Siddharth Joshi", "siddharth.j@ecogreenpower.in", UserStatus.ACTIVE),
    ]),
    (6, "Falcon Aerospace Labs", "FAER", "falcon-aerospace", "lab@falconaero.space", "Bengaluru", "Karnataka", OrganizationStatus.ACTIVE, 3, 75, [
        ("Neha Saxena", "neha.s@falconaero.space", UserStatus.ACTIVE),
    ]),
    (7, "GlobalRetail Superstores", "GRET", "globalretail-stores", "service@globalretail.in", "Delhi", "Delhi", OrganizationStatus.ACTIVE, 5, 450, [
        ("Ramesh Gupta", "ramesh.g@globalretail.in", UserStatus.ACTIVE),
        ("Sunita Kapoor", "sunita.k@globalretail.in", UserStatus.ACTIVE),
    ]),
    (8, "Horizon Edutech Solutions", "HEDT", "horizon-edutech", "academic@horizonedu.co", "Chennai", "Tamil Nadu", OrganizationStatus.ACTIVE, 2, 90, [
        ("Aravind Swamy", "aravind.s@horizonedu.co", UserStatus.ACTIVE),
    ]),
    (9, "InnoVision Robotics", "INVR", "innovision-robotics", "team@innovision.ai", "Gurugram", "Haryana", OrganizationStatus.TRIAL, 2, 35, [
        ("Manish Malhotra", "manish.m@innovision.ai", UserStatus.ACTIVE),
    ]),
    (10, "MetroTransit Mobility", "MTRN", "metrotransit-mobility", "commute@metrotransit.in", "Noida", "Uttar Pradesh", OrganizationStatus.SUSPENDED, 2, 120, [
        ("Vikram Mehta", "vikram.m@metrotransit.in", UserStatus.SUSPENDED),
    ]),
    (11, "Nexus Industrial Automation", "NXIA", "nexus-automation", "factory@nexusind.com", "Coimbatore", "Tamil Nadu", OrganizationStatus.ACTIVE, 4, 200, [
        ("Deepa Krishnan", "deepa.k@nexusind.com", UserStatus.ACTIVE),
    ]),
    (12, "Omni Health Networks", "OMNI", "omni-health", "care@omnihealth.org", "Hyderabad", "Telangana", OrganizationStatus.ACTIVE, 3, 210, [
        ("Dr. Sneha Reddy", "sneha.r@omnihealth.org", UserStatus.ACTIVE),
        ("Manoj Kumar", "manoj.k@omnihealth.org", UserStatus.ACTIVE),
    ]),
]

PASSWORD_HASH = hash_password("Admin@123")


def seed_dummy_data():
    db = SessionLocal()
    orgs_created = 0
    admins_created = 0
    try:
        for item in DUMMY_FLEET:
            day, name, code, slug, email, city, state, status, max_adm, max_emp, admins = item
            created_dt = datetime(2026, 9, day, 10, 30, 0, tzinfo=timezone.utc)

            org = db.query(Organization).filter((Organization.slug == slug) | (Organization.code == code)).first()
            if not org:
                org = Organization(
                    name=name,
                    code=code,
                    slug=slug,
                    email=email,
                    city=city,
                    state=state,
                    country="India",
                    status=status,
                    max_admins=max_adm,
                    max_employees=max_emp,
                    created_at=created_dt,
                    updated_at=created_dt,
                )
                db.add(org)
                db.flush()
                orgs_created += 1
            else:
                org.created_at = created_dt
                org.status = status
                org.max_admins = max_adm
                org.max_employees = max_emp
                db.flush()

            for adm_name, adm_email, adm_status in admins:
                user = db.query(User).filter(User.email == adm_email).first()
                if not user:
                    user = User(
                        organization_id=org.id,
                        email=adm_email,
                        full_name=adm_name,
                        password_hash=PASSWORD_HASH,
                        role=UserRole.ATTENDANCE_ADMIN,
                        status=adm_status,
                        created_at=created_dt,
                        updated_at=created_dt,
                    )
                    db.add(user)
                    admins_created += 1
                else:
                    user.organization_id = org.id
                    user.status = adm_status
                    user.created_at = created_dt

        db.commit()
        total_orgs = db.query(Organization).count()
        total_admins = db.query(User).filter(User.role == UserRole.ATTENDANCE_ADMIN).count()
        print(f"Successfully seeded: {orgs_created} new orgs, {admins_created} new admins.")
        print(f"Current DB totals -> Organizations: {total_orgs}, Attendance Admins: {total_admins}")
    except Exception as e:
        db.rollback()
        print(f"Error seeding dummy data: {e}")
        raise
    finally:
        db.close()


def clear_dummy_data():
    db = SessionLocal()
    try:
        codes = [item[2] for item in DUMMY_FLEET]
        extra_codes = ["BWHS", "CMTX", "DFIN", "EGRP", "FAER", "GRET", "HEDT", "INVR", "JMDA", "KPB", "LCYB", "MTRN", "NXIA", "OBHZ", "PPFW", "QSAI", "RSOL", "STEL", "TMAC", "UNPG", "VRTX", "WPLG", "ZNCH", "ABPR", "BIAL", "CSRT", "DCLD", "EGAT", "FPAY"]
        all_codes = list(set(codes + extra_codes))

        dummy_orgs = db.query(Organization).filter(Organization.code.in_(all_codes)).all()
        dummy_org_ids = [org.id for org in dummy_orgs]

        if dummy_org_ids:
            deleted_users = db.query(User).filter(User.organization_id.in_(dummy_org_ids)).delete(synchronize_session=False)
            deleted_orgs = db.query(Organization).filter(Organization.id.in_(dummy_org_ids)).delete(synchronize_session=False)
        else:
            deleted_users = 0
            deleted_orgs = 0

        # Also purge any test super admins if present
        db.query(User).filter(User.email.in_(["dash_super_adm@platform.com", "super_adm_test@platform.com"])).delete(synchronize_session=False)

        db.commit()
        remaining_orgs = db.query(Organization).count()
        remaining_users = db.query(User).count()
        print(f"Successfully deleted {deleted_orgs} dummy organizations and {deleted_users} dummy users.")
        print(f"Remaining DB totals -> Organizations: {remaining_orgs}, Users: {remaining_users}")
    except Exception as e:
        db.rollback()
        print(f"Error clearing dummy data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ("--clear", "-c", "--delete"):
        clear_dummy_data()
    else:
        seed_dummy_data()
