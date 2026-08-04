#!/usr/bin/env python3
"""Split job549-hein-color-018.jpg into 12 transparent animal PNGs + JS module.

Source sheet is not committed — keep it locally to re-extract.
License: docs/license-chinese-new-year-animals-16265752.pdf

Outputs:
  assets/animals/{rat…pig}.png
  src/data/animal-icons.js
"""

from __future__ import annotations

import base64
import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "job549-hein-color-018.jpg"
OUT_DIR = ROOT / "assets" / "animals"
JS_OUT = ROOT / "src" / "data" / "animal-icons.js"
SIZE = 256

ANIMALS = [
    "rat",
    "ox",
    "tiger",
    "rabbit",
    "dragon",
    "snake",
    "horse",
    "goat",
    "monkey",
    "rooster",
    "dog",
    "pig",
]


def to_square(rgba: Image.Image, size: int = SIZE, margin: float = 0.06) -> Image.Image:
    w, h = rgba.size
    side = max(w, h)
    pad = int(side * margin)
    canvas = Image.new("RGBA", (side + pad * 2, side + pad * 2), (0, 0, 0, 0))
    canvas.paste(rgba, (pad + (side - w) // 2, pad + (side - h) // 2), rgba)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def flood_clear_white_bg(rgb: Image.Image, white_thr: int = 245) -> Image.Image:
    """Make exterior white transparent; keep interior white cutouts."""
    a = np.array(rgb.convert("RGB"))
    h, w, _ = a.shape
    is_bg = (
        (a[:, :, 0] >= white_thr)
        & (a[:, :, 1] >= white_thr)
        & (a[:, :, 2] >= white_thr)
    )
    exterior = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg[y, x] and not exterior[y, x]:
                exterior[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg[y, x] and not exterior[y, x]:
                exterior[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not exterior[ny, nx] and is_bg[ny, nx]:
                exterior[ny, nx] = True
                q.append((ny, nx))
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = a
    rgba[:, :, 3] = np.where(exterior, 0, 255)
    return Image.fromarray(rgba, "RGBA")


def tight_on_mask(mask: np.ndarray, pad: int = 24):
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return 0, 0, mask.shape[1], mask.shape[0]
    return (
        max(0, int(xs.min()) - pad),
        max(0, int(ys.min()) - pad),
        min(mask.shape[1], int(xs.max()) + 1 + pad),
        min(mask.shape[0], int(ys.max()) + 1 + pad),
    )


def largest_component_mask(mask: np.ndarray) -> np.ndarray:
    h, w = mask.shape
    seen = np.zeros((h, w), dtype=bool)
    best = None
    best_size = 0
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or seen[y, x]:
                continue
            q: deque[tuple[int, int]] = deque([(y, x)])
            seen[y, x] = True
            cells: list[tuple[int, int]] = []
            while q:
                cy, cx = q.popleft()
                cells.append((cy, cx))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = cy + dy, cx + dx
                    if (
                        0 <= ny < h
                        and 0 <= nx < w
                        and mask[ny, nx]
                        and not seen[ny, nx]
                    ):
                        seen[ny, nx] = True
                        q.append((ny, nx))
            if len(cells) > best_size:
                best_size = len(cells)
                best = cells
    out = np.zeros((h, w), dtype=bool)
    if best:
        for cy, cx in best:
            out[cy, cx] = True
    return out


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source image: {SOURCE}")

    im = Image.open(SOURCE).convert("RGB")
    arr = np.array(im)
    mask = ~(
        (arr[:, :, 0] > 245) & (arr[:, :, 1] > 245) & (arr[:, :, 2] > 240)
    )
    col_dens = mask.mean(axis=0)

    def bands(dens: np.ndarray, thr: float = 0.005, min_w: int = 100):
        out = []
        inside = False
        start = 0
        for i, v in enumerate(dens):
            if v > thr and not inside:
                inside = True
                start = i
            elif v <= thr and inside:
                if i - start >= min_w:
                    out.append((start, i))
                inside = False
        if inside and len(dens) - start >= min_w:
            out.append((start, len(dens)))
        return out

    cols = bands(col_dens)
    if len(cols) != 3:
        W = im.size[0]
        cols = [(W * i // 3 + 80, W * (i + 1) // 3 - 80) for i in range(3)]
    W = im.size[0]
    cols = [(max(0, a - 140), min(W, b + 100)) for a, b in cols]

    ys = np.where(mask.mean(axis=1) > 0.01)[0]
    y0, y1 = int(ys.min()), int(ys.max())
    row_cuts = [y0, 1220, 2460, 3734, y1]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    icons: dict[str, str] = {}
    for i, name in enumerate(ANIMALS):
        r, c = divmod(i, 3)
        cx0, cx1 = cols[c]
        cy0, cy1 = row_cuts[r], row_cuts[r + 1]
        cell_mask = mask[cy0:cy1, cx0:cx1]
        if not cell_mask.any():
            raise SystemExit(f"No content for {name}")
        main_mask = largest_component_mask(cell_mask)
        tx0, ty0, tx1, ty1 = tight_on_mask(main_mask, pad=72)
        crop = im.crop((cx0 + tx0, cy0 + ty0, cx0 + tx1, cy0 + ty1))
        png = to_square(flood_clear_white_bg(crop))
        path = OUT_DIR / f"{name}.png"
        png.save(path, optimize=True)
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        icons[name] = f"data:image/png;base64,{b64}"
        print(f"{name}: {path.relative_to(ROOT)} ({path.stat().st_size} bytes)")

    JS_OUT.parent.mkdir(parents=True, exist_ok=True)
    JS_OUT.write_text(
        "/** Auto-generated by scripts/extract-animals.py — do not edit. */\n"
        f"export default {json.dumps(icons, indent=2)};\n",
        encoding="utf-8",
    )
    print(f"wrote {JS_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
