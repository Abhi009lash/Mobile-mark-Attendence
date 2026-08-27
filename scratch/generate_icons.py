import math
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
ASSETS_DIR = FRONTEND_DIR / "assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)
RES_DIR = FRONTEND_DIR / "android" / "app" / "src" / "main" / "res"


def create_geopunch_base_image(size: int = 1024, is_round: bool = False) -> Image.Image:
    # 1. Dark Obsidian Background
    img = Image.new("RGBA", (size, size), (15, 23, 42, 255))
    draw = ImageDraw.Draw(img)

    center_x = size // 2
    center_y = int(size * 0.44)

    # 2. Outer Geofence Ring
    ring_radius = int(size * 0.38)
    draw.ellipse(
        [
            (center_x - ring_radius, center_y - ring_radius),
            (center_x + ring_radius, center_y + ring_radius)
        ],
        outline=(56, 189, 248, 120),
        width=int(size * 0.01)
    )

    inner_ring = int(size * 0.32)
    draw.ellipse(
        [
            (center_x - inner_ring, center_y - inner_ring),
            (center_x + inner_ring, center_y + inner_ring)
        ],
        outline=(37, 99, 235, 180),
        width=int(size * 0.015)
    )

    # 3. GPS Pin Body (Shield style)
    pin_w = int(size * 0.28)
    pin_top = center_y - int(size * 0.26)
    pin_bottom = center_y + int(size * 0.28)

    # Draw pin top circle
    draw.ellipse(
        [(center_x - pin_w, pin_top), (center_x + pin_w, center_y + int(size * 0.10))],
        fill=(37, 99, 235, 255),
        outline=(56, 189, 248, 255),
        width=int(size * 0.01)
    )
    # Draw pin bottom point
    draw.polygon(
        [
            (center_x - int(pin_w * 0.95), center_y),
            (center_x + int(pin_w * 0.95), center_y),
            (center_x, pin_bottom)
        ],
        fill=(29, 78, 216, 255)
    )

    # 4. Inner Clock Circle
    clock_r = int(size * 0.16)
    draw.ellipse(
        [
            (center_x - clock_r, center_y - int(size * 0.09) - clock_r),
            (center_x + clock_r, center_y - int(size * 0.09) + clock_r)
        ],
        fill=(15, 23, 42, 255),
        outline=(56, 189, 248, 255),
        width=int(size * 0.015)
    )

    # Clock center Y
    clock_cy = center_y - int(size * 0.09)

    # 5. Emerald Verification Checkmark
    check_pts = [
        (center_x - int(size * 0.07), clock_cy),
        (center_x - int(size * 0.01), clock_cy + int(size * 0.06)),
        (center_x + int(size * 0.08), clock_cy - int(size * 0.06))
    ]
    draw.line(check_pts, fill=(16, 185, 129, 255), width=int(size * 0.035), joint="curve")

    # If round icon requested, apply circle mask
    if is_round:
        mask = Image.new("L", (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([(0, 0), (size, size)], fill=255)
        rounded_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        rounded_img.paste(img, (0, 0), mask=mask)
        return rounded_img

    return img


def generate_all_icons():
    print("[*] Generating master GeoPunch icons...")
    master_icon = create_geopunch_base_image(1024, is_round=False)
    master_round = create_geopunch_base_image(1024, is_round=True)

    # Save to frontend/assets/
    master_icon.save(ASSETS_DIR / "icon.png")
    master_icon.save(ASSETS_DIR / "adaptive-icon.png")
    master_icon.save(ASSETS_DIR / "splash.png")
    master_icon.save(FRONTEND_DIR / "src" / "assets" / "logo.png")
    print("[+] Saved frontend/assets/icon.png, adaptive-icon.png, splash.png")

    # Android mipmaps
    resolutions = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    if RES_DIR.exists():
        for folder, res in resolutions.items():
            dest_dir = RES_DIR / folder
            dest_dir.mkdir(parents=True, exist_ok=True)

            # Square launcher icon
            resized_icon = master_icon.resize((res, res), Image.Resampling.LANCZOS)
            resized_icon.save(dest_dir / "ic_launcher.png")

            # Round launcher icon
            resized_round = master_round.resize((res, res), Image.Resampling.LANCZOS)
            resized_round.save(dest_dir / "ic_launcher_round.png")

            print(f"[+] Updated Android {folder}/ic_launcher.png ({res}x{res})")


if __name__ == "__main__":
    generate_all_icons()
