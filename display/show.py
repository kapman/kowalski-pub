#!/usr/bin/env python3
"""Entrypoint for what gets shown on the Inky display. Defaults to the
show_generative renderer unless one is given.

Every other .py file in this directory is treated as a renderer and must
define a `render(inky, arg=None) -> PIL.Image` function.

Usage:
    show.py [renderer] [arg]   # e.g. show.py show_image assets/images/forest.jpg
"""

import importlib
import sys
from pathlib import Path

from inky.auto import auto

DISPLAY_DIR = Path(__file__).resolve().parent


def available_renderers():
    return sorted(
        p.stem for p in DISPLAY_DIR.glob("*.py") if p.stem not in ("show", "__init__")
    )


def main(renderer=None, arg=None):
    inky = auto()

    if renderer is None:
        renderer = "show_generative"
    try:
        module = importlib.import_module(renderer)
    except ModuleNotFoundError as e:
        raise RuntimeError(
            f"Unknown renderer '{renderer}'. Available: {', '.join(available_renderers())}"
        ) from e

    try:
        image = module.render(inky, arg)
    except Exception as e:
        raise RuntimeError(f"Renderer '{renderer}' failed: {e}") from e

    try:
        inky.set_image(image)
        inky.show()
    except Exception as e:
        raise RuntimeError(f"Failed to update display: {e}") from e


if __name__ == "__main__":
    if len(sys.argv) > 3:
        print(f"Warning: ignoring extra arguments: {sys.argv[3:]}", file=sys.stderr)
    main(*sys.argv[1:3])
