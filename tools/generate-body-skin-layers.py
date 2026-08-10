#!/usr/bin/env python3
"""Derive neutral skin diffuse and mask layers from accepted bald body atlases."""

from pathlib import Path

import numpy as np
from PIL import Image

DIRECTIONS = ["north", "north_east", "east", "south_east", "south", "south_west", "west", "north_west"]
ROOT = Path(__file__).resolve().parent.parent

for body in ("base-a", "base-b"):
    output = ROOT / "apps/client-godot/assets/characters/body" / body / "idle"
    (output / "skin-diffuse").mkdir(parents=True, exist_ok=True)
    (output / "skin-mask").mkdir(parents=True, exist_ok=True)
    for direction in DIRECTIONS:
        source = Image.open(output / f"{direction}.png").convert("RGBA")
        pixels = np.array(source)
        rgb = pixels[:, :, :3].astype(np.float32)
        alpha = pixels[:, :, 3]
        red, green, blue = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
        maximum = rgb.max(axis=2)
        minimum = rgb.min(axis=2)
        saturation = (maximum - minimum) / np.maximum(maximum, 1)
        skin = (alpha > 0) & (red > green * 1.045) & (green > blue * 1.055) & (saturation > .085)
        luminance = np.clip(red * .2126 + green * .7152 + blue * .0722, 0, 255).astype(np.uint8)

        diffuse = pixels.copy()
        diffuse[:, :, 0] = luminance
        diffuse[:, :, 1] = luminance
        diffuse[:, :, 2] = luminance
        diffuse[:, :, 3] = np.where(skin, alpha, 0).astype(np.uint8)
        Image.fromarray(diffuse, "RGBA").save(output / "skin-diffuse" / f"{direction}.png")

        mask = np.zeros_like(pixels)
        mask[:, :, :3] = 255
        mask[:, :, 3] = np.where(skin, alpha, 0).astype(np.uint8)
        Image.fromarray(mask, "RGBA").save(output / "skin-mask" / f"{direction}.png")

print("wrote 32 body skin runtime files")
