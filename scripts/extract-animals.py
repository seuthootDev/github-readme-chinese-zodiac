#!/usr/bin/env python3
"""Split 2272.jpg into 12 transparent animal PNGs + JS module.

Animals vary in size, so we do NOT use a fixed equal grid. Per row we:
  1) find a white gutter between the two rows
  2) label connected components
  3) cluster them left→right into 6 animals

Source sheet is not committed — keep it locally to re-extract.
License: docs/license-chinese-zodiac-red-silhouettes-10722644.pdf

Outputs:
  assets/animals/{rat…pig}.png   (white silhouettes for SVG accent masking)
  src/data/animal-icons.js
"""

from __future__ import annotations

import base64
import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import binary_closing, find_objects, label

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "2272.jpg"
OUT_DIR = ROOT / "assets" / "animals"
JS_OUT = ROOT / "src" / "data" / "animal-icons.js"
SIZE = 256
PAD = 56

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


def to_square(rgba: Image.Image, size: int = SIZE, margin: float = 0.08) -> Image.Image:
    w, h = rgba.size
    side = max(w, h)
    pad = int(side * margin)
    canvas = Image.new("RGBA", (side + pad * 2, side + pad * 2), (0, 0, 0, 0))
    canvas.paste(rgba, (pad + (side - w) // 2, pad + (side - h) // 2), rgba)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def flood_clear_white_bg(rgb: Image.Image, white_thr: int = 245) -> Image.Image:
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


def to_accent_mask(rgba: Image.Image) -> Image.Image:
    """White silhouette for SVG accent masking; cutout whites become holes."""
    a = np.array(rgba.convert("RGBA"))
    rgb = a[..., :3].astype(np.int16)
    alpha = a[..., 3]
    near_white = (rgb.min(axis=2) > 220) & (rgb.max(axis=2) - rgb.min(axis=2) < 40)
    body = (alpha > 40) & ~near_white
    out = np.zeros_like(a)
    out[body, 0] = 255
    out[body, 1] = 255
    out[body, 2] = 255
    out[body, 3] = np.maximum(alpha[body], 200)
    return Image.fromarray(out, "RGBA")


def row_split_y(closed: np.ndarray) -> int:
    row = closed.mean(axis=1)
    h = closed.shape[0]
    best = h // 2
    best_v = 1.0
    for y in range(h // 3, 2 * h // 3):
        v = float(row[max(0, y - 20) : y + 20].mean())
        if v < best_v:
            best_v = v
            best = y
    return best


def components_in_row(closed: np.ndarray, y0: int, y1: int, min_area: int = 30000):
    sub = closed[y0:y1]
    labeled, _n = label(sub)
    boxes = []
    for i, sl in enumerate(find_objects(labeled), 1):
        if sl is None:
            continue
        ys, xs = sl
        area = int((labeled[sl] == i).sum())
        if area < min_area:
            continue
        boxes.append(
            {
                "y0": y0 + ys.start,
                "y1": y0 + ys.stop,
                "x0": xs.start,
                "x1": xs.stop,
                "cx": (xs.start + xs.stop) / 2,
                "area": area,
            }
        )
    return boxes


def merge_group(group: list[dict]) -> dict:
    return {
        "y0": min(b["y0"] for b in group),
        "y1": max(b["y1"] for b in group),
        "x0": min(b["x0"] for b in group),
        "x1": max(b["x1"] for b in group),
        "cx": float(np.mean([b["cx"] for b in group])),
        "area": sum(b["area"] for b in group),
    }


def cluster_six(boxes: list[dict]) -> list[dict]:
    """Merge fragment components into 6 left-to-right animals."""
    if not boxes:
        return []
    boxes = sorted(boxes, key=lambda b: b["cx"])
    widths = [b["x1"] - b["x0"] for b in boxes]
    thr = float(np.median(widths)) * 0.55
    groups: list[list[dict]] = [[boxes[0]]]
    for b in boxes[1:]:
        if b["cx"] - groups[-1][-1]["cx"] < thr:
            groups[-1].append(b)
        else:
            groups.append([b])
    merged = [merge_group(g) for g in groups]
    while len(merged) > 6:
        gaps = [merged[i + 1]["cx"] - merged[i]["cx"] for i in range(len(merged) - 1)]
        i = int(np.argmin(gaps))
        g = merge_group([merged[i], merged[i + 1]])
        merged = merged[:i] + [g] + merged[i + 2 :]
    if len(merged) != 6:
        raise SystemExit(f"Expected 6 animals in row, got {len(merged)}")
    return merged


def slot_cuts(centers: list[float], width: int) -> list[int]:
    cuts = [0]
    for i in range(len(centers) - 1):
        cuts.append(int((centers[i] + centers[i + 1]) / 2))
    cuts.append(width)
    return cuts


def slot_content_bbox(cell_mask: np.ndarray, min_frac: float = 0.08):
    """BBox covering major components in a slot (keeps split body parts)."""
    labeled, n = label(cell_mask)
    if n == 0:
        return None
    areas = [(i, int((labeled == i).sum())) for i in range(1, n + 1)]
    best_area = max(a for _, a in areas)
    keep = {i for i, a in areas if a >= best_area * min_frac}
    ys, xs = np.where(np.isin(labeled, list(keep)))
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source image: {SOURCE}")

    im = Image.open(SOURCE).convert("RGB")
    arr = np.array(im)
    mask = ~(
        (arr[:, :, 0] > 245) & (arr[:, :, 1] > 245) & (arr[:, :, 2] > 245)
    )
    closed = binary_closing(mask, structure=np.ones((9, 9)))
    h, w = mask.shape
    split = row_split_y(closed)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    icons: dict[str, str] = {}
    idx = 0
    for y0, y1 in ((0, split), (split, h)):
        centers = [b["cx"] for b in cluster_six(components_in_row(closed, y0, y1))]
        cuts = slot_cuts(centers, w)
        strip = closed[y0:y1]
        for ci in range(6):
            name = ANIMALS[idx]
            idx += 1
            x0, x1 = cuts[ci], cuts[ci + 1]
            bbox = slot_content_bbox(strip[:, x0:x1])
            if bbox is None:
                raise SystemExit(f"No content for {name}")
            lx0, ly0, lx1, ly1 = bbox
            bx0 = max(0, x0 + lx0 - PAD)
            by0 = max(0, y0 + ly0 - PAD)
            bx1 = min(w, x0 + lx1 + PAD)
            by1 = min(h, y0 + ly1 + PAD)
            crop = im.crop((bx0, by0, bx1, by1))
            png = to_accent_mask(to_square(flood_clear_white_bg(crop)))
            path = OUT_DIR / f"{name}.png"
            png.save(path, optimize=True)
            b64 = base64.b64encode(path.read_bytes()).decode("ascii")
            icons[name] = f"data:image/png;base64,{b64}"
            print(
                f"{name}: box=({bx0},{by0})-({bx1},{by1}) "
                f"-> {path.relative_to(ROOT)} ({path.stat().st_size} bytes)"
            )

    JS_OUT.parent.mkdir(parents=True, exist_ok=True)
    JS_OUT.write_text(
        "/** Auto-generated by scripts/extract-animals.py — do not edit. */\n"
        f"export default {json.dumps(icons, indent=2)};\n",
        encoding="utf-8",
    )
    print(f"wrote {JS_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
