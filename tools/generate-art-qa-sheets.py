#!/usr/bin/env python3
"""Build durable contact sheets for every reviewed production-art batch."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "apps/client-godot/assets"
OUTPUT = ROOT / "planning/art-qa"
DIRECTIONS = ["north", "north_east", "east", "south_east", "south", "south_west", "west", "north_west"]
PRIMARY = (40, 104, 148)
SECONDARY = (196, 117, 54)


def font(size: int) -> ImageFont.ImageFont:
    for path in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    return ImageFont.load_default()


def checker(size: tuple[int, int], cell: int = 12) -> Image.Image:
    image = Image.new("RGBA", size, (31, 36, 39, 255))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=(44, 50, 54, 255))
    return image


def fit(source: Image.Image, box: tuple[int, int]) -> Image.Image:
    image = source.copy().convert("RGBA")
    image.thumbnail(box, Image.Resampling.LANCZOS)
    return image


def tint_layer(diffuse: Image.Image, primary: Image.Image, secondary: Image.Image) -> Image.Image:
    diffuse = diffuse.convert("RGBA")
    primary = primary.convert("RGBA")
    secondary = secondary.convert("RGBA")
    result = Image.new("RGBA", diffuse.size, (0, 0, 0, 0))
    dp = diffuse.load(); pp = primary.load(); sp = secondary.load(); rp = result.load()
    for y in range(diffuse.height):
        for x in range(diffuse.width):
            dr, dg, db, da = dp[x, y]
            if da == 0:
                continue
            light = (dr + dg + db) / (3 * 128)
            if pp[x, y][3] > 0:
                color = PRIMARY
            elif sp[x, y][3] > 0:
                color = SECONDARY
            else:
                color = (dr, dg, db)
                light = 1
            rp[x, y] = tuple(min(255, round(channel * light)) for channel in color) + (da,)
    return result


def character_frame(body: str, direction: str, outfit: str | None = None) -> Image.Image:
    body_image = Image.open(ASSETS / f"characters/body/{body}/idle/{direction}.png").convert("RGBA")
    if outfit is None:
        return body_image
    root = ASSETS / f"characters/outfits/{outfit}/{body}/idle"
    garment = tint_layer(
        Image.open(root / f"diffuse/{direction}.png"),
        Image.open(root / f"primary-mask/{direction}.png"),
        Image.open(root / f"secondary-mask/{direction}.png"),
    )
    composite = body_image.copy()
    composite.alpha_composite(garment)
    return composite


def contact_sheet(title: str, frames: list[tuple[str, Image.Image]], destination: Path, cell_size=(230, 300), gameplay_height=72) -> None:
    columns = 4
    rows = (len(frames) + columns - 1) // columns
    width = columns * cell_size[0]
    height = 66 + rows * cell_size[1] + 120
    sheet = Image.new("RGBA", (width, height), (20, 24, 27, 255))
    draw = ImageDraw.Draw(sheet)
    draw.text((22, 17), title, fill=(241, 235, 216, 255), font=font(24))
    for index, (label, source) in enumerate(frames):
        x = (index % columns) * cell_size[0]
        y = 66 + (index // columns) * cell_size[1]
        panel = checker((cell_size[0] - 12, cell_size[1] - 38))
        rendered = fit(source, (panel.width - 18, panel.height - 18))
        panel.alpha_composite(rendered, ((panel.width - rendered.width) // 2, (panel.height - rendered.height) // 2))
        sheet.alpha_composite(panel, (x + 6, y + 28))
        draw.text((x + 10, y + 4), label, fill=(190, 205, 205, 255), font=font(15))

    strip_y = 66 + rows * cell_size[1] + 34
    draw.text((10, strip_y - 27), f"Gameplay-scale strip ({gameplay_height}px subject height)", fill=(190, 205, 205, 255), font=font(14))
    slot_width = width // len(frames)
    for index, (_, source) in enumerate(frames):
        bbox = source.getchannel("A").getbbox()
        subject = source.crop(bbox) if bbox else source
        rendered = fit(subject, (slot_width - 8, gameplay_height))
        x = index * slot_width + (slot_width - rendered.width) // 2
        sheet.alpha_composite(rendered, (x, strip_y))

    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.convert("RGB").save(destination, quality=94)


def main() -> None:
    furniture = []
    furniture_root = ASSETS / "objects/directional/furniture-six-burner-range"
    for direction in ("north", "east", "south", "west"):
        furniture.append((direction, Image.open(furniture_root / f"{direction}.png").convert("RGBA")))
    contact_sheet("Furniture pilot 001 — six-burner range", furniture, OUTPUT / "furniture-pilot-001.png", (310, 330), 72)

    for body, batch in (("base-a", "character-foundation-001"), ("base-b", "character-foundation-002")):
        frames = [(direction, character_frame(body, direction)) for direction in DIRECTIONS]
        contact_sheet(f"{batch} — {body} elevated source poses", frames, OUTPUT / f"{batch}.png")

    for outfit, batch in (("classic", "character-modular-classic-001"), ("apron", "character-modular-apron-001")):
        frames = []
        for body in ("base-a", "base-b"):
            for direction in DIRECTIONS:
                frames.append((f"{body} / {direction}", character_frame(body, direction, outfit)))
        contact_sheet(f"{batch} — body→outfit runtime-order composites", frames, OUTPUT / f"{batch}.png", (230, 300), 64)

    print(f"wrote 5 QA sheets to {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
