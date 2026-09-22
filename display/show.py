#!/usr/bin/env python3
"""Entrypoint for what gets shown on the Inky display. Runs one display
mode (default: generative). Every module in modes/ defines a
`render(inky, arg=None) -> PIL.Image` function.

Usage:
    show.py [mode] [arg]   # e.g. show.py image assets/images/forest.jpg
"""

import importlib
import sys
from pathlib import Path

from inky.auto import auto

DISPLAY_DIR = Path(__file__).resolve().parent


def available_modes():
    return sorted(p.stem for p in (DISPLAY_DIR / "modes").glob("*.py"))


def main(mode=None, arg=None):
    inky = auto()

    if mode is None:
        mode = "generative"
    if mode not in available_modes():
        raise RuntimeError(
            f"Unknown mode '{mode}'. Available: {', '.join(available_modes())}"
        )
    try:
        image = importlib.import_module(f"modes.{mode}").render(inky, arg)
    except Exception as e:
        raise RuntimeError(f"Mode '{mode}' failed: {e}") from e

    try:
        inky.set_image(image)
        inky.show()
    except Exception as e:
        raise RuntimeError(f"Failed to update display: {e}") from e


if __name__ == "__main__":
    if len(sys.argv) > 3:
        print(f"Warning: ignoring extra arguments: {sys.argv[3:]}", file=sys.stderr)
    main(*sys.argv[1:3])