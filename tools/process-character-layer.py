#!/usr/bin/env python3
"""Fit a pose-locked red/blue calibration atlas to an accepted body atlas.

The source is a chroma-removed 4x2 RGBA atlas ordered clockwise from south:
south, south-west, west, north-west, north, north-east, east, south-east.
Red is the primary tint channel and blue is the secondary tint channel.
"""

from argparse import ArgumentParser
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

DIRECTIONS = [
    "south", "south_west", "west", "north_west",
    "north", "north_east", "east", "south_east",
]


def bounds(alpha: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.where(alpha > 20)
    if not len(xs):
        raise ValueError("atlas cell has no opaque subject")
    return int(xs.min()), int(ys.min()), int(xs.max() + 1), int(ys.max() + 1)


def major_components(mask: np.ndarray, count: int = 2, minimum: int = 80) -> np.ndarray:
    labels, _ = ndimage.label(mask)
    sizes = np.bincount(labels.ravel())
    order = np.argsort(sizes[1:])[::-1] + 1
    result = np.zeros_like(mask, dtype=bool)
    for label in order[:count]:
        if sizes[label] >= minimum:
            result |= labels == label
    return ndimage.binary_closing(result, iterations=1)


def mask_image(mask: np.ndarray, alpha: np.ndarray) -> Image.Image:
    output = np.zeros((*mask.shape, 4), dtype=np.uint8)
    output[:, :, :3] = 255
    output[:, :, 3] = np.where(mask, alpha, 0).astype(np.uint8)
    return Image.fromarray(output, "RGBA")


def neutral_diffuse(source: np.ndarray, keep: np.ndarray, primary: np.ndarray) -> Image.Image:
    output = source.copy()
    rgb = output[:, :, :3].astype(np.float32)
    luminance = (rgb[:, :, 0] * .2126 + rgb[:, :, 1] * .7152 + rgb[:, :, 2] * .0722)
    primary_value = np.clip(78 + luminance * .68, 70, 230)
    secondary_value = np.clip(45 + luminance * .56, 42, 190)
    values = np.where(primary, primary_value, secondary_value).astype(np.uint8)
    output[:, :, 0] = values
    output[:, :, 1] = values
    output[:, :, 2] = values
    output[:, :, 3] = np.where(keep, output[:, :, 3], 0).astype(np.uint8)
    return Image.fromarray(output, "RGBA")


def main() -> None:
    parser = ArgumentParser()
    parser.add_argument("--source", required=True, help="Chroma-removed 1536x1024 RGBA atlas")
    parser.add_argument("--body", required=True, choices=["base-a", "base-b"])
    parser.add_argument("--layer", required=True)
    parser.add_argument("--root", default=".")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    source = Image.open(args.source).convert("RGBA")
    if source.size != (1536, 1024):
        raise ValueError(f"expected 1536x1024 source, got {source.size}")

    output_root = root / "apps/client-godot/assets/characters/outfits" / args.layer / args.body / "idle"
    for kind in ("diffuse", "primary-mask", "secondary-mask"):
        (output_root / kind).mkdir(parents=True, exist_ok=True)

    for index, direction in enumerate(DIRECTIONS):
        x = index % 4 * 384
        y = index // 4 * 512
        cell = source.crop((x, y, x + 384, y + 512)).convert("RGBA")
        body_path = root / "apps/client-godot/assets/characters/body" / args.body / "idle" / f"{direction}.png"
        body = Image.open(body_path).convert("RGBA")
        cell_box = bounds(np.array(cell)[:, :, 3])
        body_box = bounds(np.array(body)[:, :, 3])
        fitted = cell.crop(cell_box).resize(
            (body_box[2] - body_box[0], body_box[3] - body_box[1]),
            Image.Resampling.LANCZOS,
        )
        aligned = Image.new("RGBA", (384, 512), (0, 0, 0, 0))
        aligned.alpha_composite(fitted, (body_box[0], body_box[1]))
        pixels = np.array(aligned)
        alpha = pixels[:, :, 3]
        hsv = np.array(aligned.convert("HSV"))
        hue, saturation, value = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
        primary = (alpha > 0) & ((hue < 12) | (hue > 245)) & (saturation > 105) & (value > 32)
        secondary = (alpha > 0) & (hue >= 145) & (hue <= 190) & (saturation > 100) & (value > 30)
        primary = major_components(primary)
        secondary = major_components(secondary)
        keep = primary | secondary
        if keep.sum() < 1000:
            raise ValueError(f"{direction}: calibration channels cover only {keep.sum()} pixels")

        neutral_diffuse(pixels, keep, primary).save(output_root / "diffuse" / f"{direction}.png")
        mask_image(primary, alpha).save(output_root / "primary-mask" / f"{direction}.png")
        mask_image(secondary, alpha).save(output_root / "secondary-mask" / f"{direction}.png")

    print(f"wrote {len(DIRECTIONS) * 3} runtime files to {output_root.relative_to(root)}")


if __name__ == "__main__":
    main()
