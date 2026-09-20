#!/usr/bin/env python3
"""Render the current date/time on the Inky display, e.g. "17:51:26 18th July 2026"."""

from datetime import datetime

from PIL import Image, ImageDraw, ImageFont


def ordinal(day):
    if 11 <= day <= 13:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")
    return f"{day}{suffix}"


def format_now():
    now = datetime.now()
    return now.strftime(f"%H:%M:%S {ordinal(now.day)} %B %Y")


def render(inky, arg=None):
    # arg unused: this renderer takes no extra config, kept for a consistent
    # interface with other renderers.
    text = format_now()

    image = Image.new("P", inky.resolution, inky.WHITE)
    draw = ImageDraw.Draw(image)

    font = ImageFont.load_default(size=60)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (inky.resolution[0] - text_width) // 2
    y = (inky.resolution[1] - text_height) // 2

    draw.text((x, y), text, fill=inky.BLACK, font=font)

    return image
