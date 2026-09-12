"""
Seed script to insert 30 dummy organizations into the database for testing pagination,
sorting, filtering, and responsive UI rendering. Strictly adheres to < 250 lines limit.
"""
from app.core.database import SessionLocal
from app.models.organization import Organization, OrganizationStatus

DUMMY_ORGS = [
    ("Apex Logistics Ltd", "APEX", "apex-logistics", "ops@apexlogistics.com", "https://apexlogistics.com", "+91 98765 00001", "Mumbai", "Maharashtra", "400001", OrganizationStatus.ACTIVE, 3, 120),
    ("BlueWave Health Systems", "BWHS", "bluewave-health", "info@bluewavehealth.org", "https://bluewavehealth.org", "+91 98765 00002", "Bengaluru", "Karnataka", "560001", OrganizationStatus.ACTIVE, 5, 250),
    ("CloudMatrix Technologies", "CMTX", "cloudmatrix-tech", "hello@cloudmatrix.io", "https://cloudmatrix.io", "+91 98765 00003", "Hyderabad", "Telangana", "500081", OrganizationStatus.ACTIVE, 2, 75),
    ("DeltaFin Financial Services", "DFIN", "deltafin-services", "support@deltafin.com", "https://deltafin.com", "+91 98765 00004", "Mumbai", "Maharashtra", "400051", OrganizationStatus.ACTIVE, 4, 180),
    ("EcoGreen Renewable Power", "EGRP", "ecogreen-power", "contact@ecogreenpower.in", "https://ecogreenpower.in", "+91 98765 00005", "Pune", "Maharashtra", "411001", OrganizationStatus.TRIAL, 1, 30),
    ("Falcon Aerospace Labs", "FAER", "falcon-aerospace", "lab@falconaero.space", "https://falconaero.space", "+91 98765 00006", "Bengaluru", "Karnataka", "560037", OrganizationStatus.ACTIVE, 2, 60),
    ("GlobalRetail Superstores", "GRET", "globalretail-stores", "service@globalretail.in", "https://globalretail.in", "+91 98765 00007", "Delhi", "Delhi", "110001", OrganizationStatus.ACTIVE, 6, 500),
    ("Horizon Edutech Solutions", "HEDT", "horizon-edutech", "academic@horizonedu.co", "https://horizonedu.co", "+91 98765 00008", "Chennai", "Tamil Nadu", "600001", OrganizationStatus.ACTIVE, 2, 90),
    ("InnoVision Robotics", "INVR", "innovision-robotics", "team@innovision.ai", "https://innovision.ai", "+91 98765 00009", "Gurugram", "Haryana", "122002", OrganizationStatus.TRIAL, 1, 25),
    ("Jupiter Media & Entertainment", "JMDA", "jupiter-media", "press@jupitermedia.net", "https://jupitermedia.net", "+91 98765 00010", "Mumbai", "Maharashtra", "400053", OrganizationStatus.ACTIVE, 3, 110),
    ("Krypton Biotech Research", "KPB", "krypton-biotech", "research@kryptonbio.org", "https://kryptonbio.org", "+91 98765 00011", "Hyderabad", "Telangana", "500032", OrganizationStatus.ACTIVE, 2, 45),
    ("Lumina CyberSecurity", "LCYB", "lumina-cybersec", "secops@luminasec.io", "https://luminasec.io", "+91 98765 00012", "Bengaluru", "Karnataka", "560102", OrganizationStatus.ACTIVE, 3, 85),
    ("MetroTransit Mobility", "MTRN", "metrotransit-mobility", "commute@metrotransit.in", "https://metrotransit.in", "+91 98765 00013", "Noida", "Uttar Pradesh", "201301", OrganizationStatus.SUSPENDED, 2, 150),
    ("Nexus Industrial Automation", "NXIA", "nexus-automation", "factory@nexusind.com", "https://nexusind.com", "+91 98765 00014", "Coimbatore", "Tamil Nadu", "641001", OrganizationStatus.ACTIVE, 4, 200),
    ("OceanBreeze Hospitality", "OBHZ", "oceanbreeze-hospitality", "stay@oceanbreeze.com", "https://oceanbreeze.com", "+91 98765 00015", "Goa", "Goa", "403001", OrganizationStatus.ACTIVE, 3, 140),
    ("PrimePulse Fitness & Wellness", "PPFW", "primepulse-wellness", "care@primepulse.fit", "https://primepulse.fit", "+91 98765 00016", "Chandigarh", "Chandigarh", "160017", OrganizationStatus.ACTIVE, 2, 50),
    ("QuantumSphere AI Labs", "QSAI", "quantumsphere-ai", "models@quantumsphere.ai", "https://quantumsphere.ai", "+91 98765 00017", "Bengaluru", "Karnataka", "560066", OrganizationStatus.ACTIVE, 5, 160),
    ("Radiant Solar Energy", "RSOL", "radiant-solar", "cleanpower@radiantsolar.in", "https://radiantsolar.in", "+91 98765 00018", "Ahmedabad", "Gujarat", "380015", OrganizationStatus.ACTIVE, 2, 95),
    ("Stellar Telecom Networks", "STEL", "stellar-telecom", "support@stellartelecom.in", "https://stellartelecom.in", "+91 98765 00019", "Kolkata", "West Bengal", "700001", OrganizationStatus.ACTIVE, 4, 300),
    ("Titan Heavy Machinery", "TMAC", "titan-machinery", "heavy@titanmachinery.com", "https://titanmachinery.com", "+91 98765 00020", "Jamshedpur", "Jharkhand", "831001", OrganizationStatus.ACTIVE, 3, 220),
    ("UrbanNest Property Group", "UNPG", "urbannest-properties", "estates@urbannest.co", "https://urbannest.co", "+91 98765 00021", "Jaipur", "Rajasthan", "302001", OrganizationStatus.ACTIVE, 2, 80),
    ("Vertex Semiconductor Fab", "VRTX", "vertex-semi", "silicon@vertexsemi.com", "https://vertexsemi.com", "+91 98765 00022", "Bengaluru", "Karnataka", "560048", OrganizationStatus.ACTIVE, 4, 350),
    ("WavePoint Logistics Global", "WPLG", "wavepoint-global", "cargo@wavepointglobal.com", "https://wavepointglobal.com", "+91 98765 00023", "Kochi", "Kerala", "682001", OrganizationStatus.ACTIVE, 2, 110),
    ("Zenith Chemical Industries", "ZNCH", "zenith-chemicals", "chem@zenithchemicals.com", "https://zenithchemicals.com", "+91 98765 00024", "Vadodara", "Gujarat", "390001", OrganizationStatus.TRIAL, 1, 40),
    ("Aura BioPharma Research", "ABPR", "aura-biopharma", "trials@aurabiopharma.com", "https://aurabiopharma.com", "+91 98765 00025", "Hyderabad", "Telangana", "500072", OrganizationStatus.ACTIVE, 3, 90),
    ("Beacon Insurance Alliance", "BIAL", "beacon-insurance", "claims@beaconinsure.in", "https://beaconinsure.in", "+91 98765 00026", "Mumbai", "Maharashtra", "400021", OrganizationStatus.ACTIVE, 3, 175),
    ("Coral Sands Resorts", "CSRT", "coral-sands", "welcome@coralsandsresort.com", "https://coralsandsresort.com", "+91 98765 00027", "Kochi", "Kerala", "682005", OrganizationStatus.SUSPENDED, 1, 35),
    ("Dynamic Cloud Infrastructure", "DCLD", "dynamic-cloud", "infra@dynamiccloud.io", "https://dynamiccloud.io", "+91 98765 00028", "Bengaluru", "Karnataka", "560100", OrganizationStatus.ACTIVE, 3, 130),
    ("Evergreen AgriTech Innovations", "EGAT", "evergreen-agritech", "crops@evergreenagri.in", "https://evergreenagri.in", "+91 98765 00029", "Indore", "Madhya Pradesh", "452001", OrganizationStatus.ACTIVE, 2, 65),
    ("FusionPay Financial Solutions", "FPAY", "fusionpay-solutions", "merchant@fusionpay.co", "https://fusionpay.co", "+91 98765 00030", "Gurugram", "Haryana", "122018", OrganizationStatus.ACTIVE, 4, 190),
]

def seed_organizations():
    db = SessionLocal()
    created_count = 0
    skipped_count = 0
    try:
        for item in DUMMY_ORGS:
            name, code, slug, email, website, phone, city, state, postal, status, max_adm, max_emp = item
            existing = db.query(Organization).filter(
                (Organization.slug == slug) | (Organization.code == code)
            ).first()
            if existing:
                skipped_count += 1
                continue
            org = Organization(
                name=name,
                code=code,
                slug=slug,
                email=email,
                website=website,
                phone=phone,
                address_line1=f"Suite {100 + created_count}, Commercial Tower",
                city=city,
                state=state,
                country="India",
                postal_code=postal,
                status=status,
                max_admins=max_adm,
                max_employees=max_emp,
            )
            db.add(org)
            created_count += 1
        db.commit()
        total = db.query(Organization).count()
        print(f"Successfully created: {created_count}, Skipped (existing): {skipped_count}, Total organizations in DB: {total}")
    except Exception as e:
        db.rollback()
        print(f"Error seeding organizations: {e}")
        raise
    finally:
        db.close()

def clear_dummy_organizations():
    db = SessionLocal()
    try:
        codes = [item[1] for item in DUMMY_ORGS]
        deleted = db.query(Organization).filter(Organization.code.in_(codes)).delete(synchronize_session=False)
        db.commit()
        remaining = db.query(Organization).count()
        print(f"Deleted {deleted} dummy organizations. Remaining in DB: {remaining}")
    except Exception as e:
        db.rollback()
        print(f"Error clearing dummy organizations: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] in ("--clear", "-c", "--delete"):
        clear_dummy_organizations()
    else:
        seed_organizations()

