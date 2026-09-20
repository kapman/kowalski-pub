"""Render generative art via Three.js + Puppeteer."""

import shutil
import subprocess
from pathlib import Path

from PIL import Image

REPO_DIR = Path(__file__).resolve().parent.parent
ART_DIR = REPO_DIR / "art"
IMAGES_DIR = ART_DIR / "images"


def _find_node():
    node = shutil.which("node")
    if node:
        return node
    # Fallback: fnm-managed Node (not in PATH in non-interactive shells)
    fnm_node = Path.home() / ".local" / "share" / "fnm" / "aliases" / "default" / "bin" / "node"
    if fnm_node.is_file():
        return str(fnm_node)
    raise RuntimeError("node not found")


def render(inky, arg=None):
    node = _find_node()
    result = subprocess.run(
        [node, str(ART_DIR / "src" / "render.mjs"), "--out", str(IMAGES_DIR)],
        cwd=ART_DIR,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        err = result.stderr.strip()
        print(f"[render.mjs exited {result.returncode}] stderr: {err}", flush=True)
        print(f"[render.mjs] stdout: {result.stdout.strip()}", flush=True)
        result.check_returncode()
    if result.stderr:
        print(f"[render.mjs stderr] {result.stderr.strip()}", flush=True)
    # stdout may have Chromium warnings before the actual path — take last line
    lines = [l for l in result.stdout.strip().split(chr(10)) if l.strip()]
    out_path = lines[-1].strip() if lines else ""
    return Image.open(out_path)
