#!/usr/bin/env python3
"""Display an image on the Inky display. Defaults to a random image from
assets/images/, or pass a path to display a specific image.

Supported formats when picking randomly: .jpg, .jpeg, .png. A path passed
explicitly can be any format Pillow's Image.open() supports."""

import random
from pathlib import Path

from PIL import Image

IMAGES_DIR = Path(__file__).resolve().parent.parent / "assets" / "images"


def pick_random_image():
    if not IMAGES_DIR.is_dir():
        raise RuntimeError(f"Images directory not found: {IMAGES_DIR}")
    images = [p for p in IMAGES_DIR.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png")]
    if not images:
        raise RuntimeError(f"No images found in {IMAGES_DIR}")
    return random.choice(images)


def fit_to_display(image, size):
    """Resize to fit within size preserving aspect ratio, padding with white."""
    image = image.convert("RGB")
    fitted = Image.new("RGB", size, "white")
    scale = min(size[0] / image.width, size[1] / image.height)
    new_size = (round(image.width * scale), round(image.height * scale))
    resized = image.resize(new_size)
    offset = ((size[0] - new_size[0]) // 2, (size[1] - new_size[1]) // 2)
    fitted.paste(resized, offset)
    return fitted


def render(inky, path=None):
    path = path or pick_random_image()
    try:
        image = Image.open(path)
    except (OSError, ValueError) as e:
        raise RuntimeError(f"Could not open image {path}: {e}") from e
    return fit_to_display(image, inky.resolution)
