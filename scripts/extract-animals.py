#!/usr/bin/env python3
"""Split animal sheet into 12 PNGs.

Modes
-----
accent (default)
  Source: 2272.jpg — red silhouettes on white, 2×6 layout.
  Writes white mask PNGs + src/data/animal-icons.js for SVG title tinting.

gold (--gold)
  Source: job549-hein-gold-018.jpg — gold paper-cuts on dark red, 4×3 layout.
  Writes full-color transparent crops + HTML preview for manual review.

gold --install-gold
  After review: resize scripts/out/gold-animals → assets/animals-gold
  and regenerate src/data/animal-gold-icons.js for the card center emblem.

Animals vary in size, so we do NOT use a fixed equal grid alone. Per row we:
  1) find gutters between rows
  2) label connected components
  3) cluster them left→right into N animals
  4) tight bbox + PAD (may still clip — check the preview)

License (red sheet): docs/license-chinese-zodiac-red-silhouettes-10722644.pdf
"""

from __future__ import annotations

import argparse
import base64
import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import binary_closing, binary_dilation, find_objects, label

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ACCENT = ROOT / "2272.jpg"
SOURCE_GOLD = ROOT / "job549-hein-gold-018.jpg"
OUT_ACCENT = ROOT / "assets" / "animals"
OUT_GOLD = ROOT / "scripts" / "out" / "gold-animals"
OUT_GOLD_ASSETS = ROOT / "assets" / "animals-gold"
JS_OUT = ROOT / "src" / "data" / "animal-icons.js"
JS_GOLD_OUT = ROOT / "src" / "data" / "animal-gold-icons.js"
SIZE = 256
GOLD_CARD_MAX = 360
PAD_ACCENT = 56
PAD_GOLD = 72

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


def flood_clear_mask(rgb: Image.Image, exterior_seed: np.ndarray) -> Image.Image:
    """Clear exterior (True) to transparent; keep everything else opaque."""
    a = np.array(rgb.convert("RGB"))
    h, w, _ = a.shape
    exterior = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for y, x in zip(*np.where(exterior_seed)):
        if y in (0, h - 1) or x in (0, w - 1):
            exterior[y, x] = True
            q.append((y, x))
    # Also seed any edge pixel that looks like background
    for x in range(w):
        for y in (0, h - 1):
            if exterior_seed[y, x] and not exterior[y, x]:
                exterior[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if exterior_seed[y, x] and not exterior[y, x]:
                exterior[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not exterior[ny, nx] and exterior_seed[ny, nx]:
                exterior[ny, nx] = True
                q.append((ny, nx))
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = a
    rgba[:, :, 3] = np.where(exterior, 0, 255)
    return Image.fromarray(rgba, "RGBA")


def flood_clear_white_bg(rgb: Image.Image, white_thr: int = 245) -> Image.Image:
    a = np.array(rgb.convert("RGB"))
    is_bg = (
        (a[:, :, 0] >= white_thr)
        & (a[:, :, 1] >= white_thr)
        & (a[:, :, 2] >= white_thr)
    )
    return flood_clear_mask(rgb, is_bg)


def flood_clear_dark_red_bg(rgb: Image.Image, green_thr: int = 45) -> Image.Image:
    """Gold sheet: background is dark red (high R, near-zero G/B); gold has green."""
    a = np.array(rgb.convert("RGB"))
    is_bg = a[:, :, 1] < green_thr
    return flood_clear_mask(rgb, is_bg)


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


def foreground_mask_white_bg(arr: np.ndarray) -> np.ndarray:
    return ~(
        (arr[:, :, 0] > 245) & (arr[:, :, 1] > 245) & (arr[:, :, 2] > 245)
    )


def foreground_mask_gold(arr: np.ndarray, green_thr: int = 45) -> np.ndarray:
    return arr[:, :, 1] >= green_thr


def row_split_ys(closed: np.ndarray, n_rows: int) -> list[int]:
    """Return n_rows+1 y boundaries (0 … h) by finding low-density gutters."""
    h = closed.shape[0]
    if n_rows == 2:
        row = closed.mean(axis=1)
        best = h // 2
        best_v = 1.0
        for y in range(h // 3, 2 * h // 3):
            v = float(row[max(0, y - 20) : y + 20].mean())
            if v < best_v:
                best_v = v
                best = y
        return [0, best, h]

    # Equal-ish bands, then snap each internal cut to local density minimum
    row = closed.mean(axis=1)
    cuts = [0]
    for i in range(1, n_rows):
        ideal = int(h * i / n_rows)
        lo = max(1, ideal - h // (n_rows * 3))
        hi = min(h - 1, ideal + h // (n_rows * 3))
        best = ideal
        best_v = 1.0
        win = max(8, h // 80)
        for y in range(lo, hi):
            v = float(row[max(0, y - win) : y + win].mean())
            if v < best_v:
                best_v = v
                best = y
        cuts.append(best)
    cuts.append(h)
    return cuts


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


def cluster_n(boxes: list[dict], n: int) -> list[dict]:
    """Merge fragment components into n left-to-right animals."""
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
    while len(merged) > n:
        gaps = [merged[i + 1]["cx"] - merged[i]["cx"] for i in range(len(merged) - 1)]
        i = int(np.argmin(gaps))
        g = merge_group([merged[i], merged[i + 1]])
        merged = merged[:i] + [g] + merged[i + 2 :]
    if len(merged) != n:
        raise SystemExit(f"Expected {n} animals in row, got {len(merged)}")
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


def slot_content_bbox_anchored(
    closed: np.ndarray,
    x0: int,
    x1: int,
    y0: int,
    y1: int,
    ey0: int,
    ey1: int,
    min_frac: float = 0.08,
):
    """BBox in an expanded strip, keeping only components that touch the nominal row.

    Prevents rabbit/horse (same column) from swallowing each other when gutters overlap.
    Returns box in full-image coordinates, or None.
    """
    strip = closed[ey0:ey1, x0:x1]
    labeled, n = label(strip)
    if n == 0:
        return None
    # y offset of nominal row inside the expanded strip
    nom0 = y0 - ey0
    nom1 = y1 - ey0
    keep = set()
    best_in_row = 0
    areas_in_row: dict[int, int] = {}
    for i in range(1, n + 1):
        ys, xs = np.where(labeled == i)
        if len(ys) == 0:
            continue
        in_row = int(((ys >= nom0) & (ys < nom1)).sum())
        areas_in_row[i] = in_row
        best_in_row = max(best_in_row, in_row)
    if best_in_row == 0:
        return None
    for i, in_row in areas_in_row.items():
        if in_row >= best_in_row * min_frac:
            keep.add(i)
    ys, xs = np.where(np.isin(labeled, list(keep)))
    if len(xs) == 0:
        return None
    return (
        x0 + int(xs.min()),
        ey0 + int(ys.min()),
        x0 + int(xs.max()) + 1,
        ey0 + int(ys.max()) + 1,
    )


def components_all(closed: np.ndarray, min_area: int) -> list[dict]:
    labeled, _n = label(closed)
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
                "y0": ys.start,
                "y1": ys.stop,
                "x0": xs.start,
                "x1": xs.stop,
                "cx": (xs.start + xs.stop) / 2,
                "cy": (ys.start + ys.stop) / 2,
                "area": area,
            }
        )
    return boxes


def sort_grid(boxes: list[dict], n_rows: int, per_row: int) -> list[dict]:
    """Assign components to a row-major grid by center y then x."""
    expect = n_rows * per_row
    if len(boxes) != expect:
        raise SystemExit(f"Expected {expect} animal components, got {len(boxes)}")
    # Cluster into rows by cy gaps
    by_cy = sorted(boxes, key=lambda b: b["cy"])
    rows: list[list[dict]] = []
    for b in by_cy:
        if not rows:
            rows.append([b])
            continue
        row_cy = float(np.mean([x["cy"] for x in rows[-1]]))
        # New row when jump is large vs typical in-row spread
        if b["cy"] - row_cy > (by_cy[-1]["cy"] - by_cy[0]["cy"]) / (n_rows * 1.6):
            rows.append([b])
        else:
            rows[-1].append(b)
    if len(rows) != n_rows:
        # Fallback: equal quantiles by cy rank
        rows = [by_cy[i * per_row : (i + 1) * per_row] for i in range(n_rows)]
    ordered: list[dict] = []
    for row in rows:
        if len(row) != per_row:
            raise SystemExit(
                f"Expected {per_row} animals in a row, got {len(row)} "
                f"(cy={[round(b['cy']) for b in row]})"
            )
        ordered.extend(sorted(row, key=lambda b: b["cx"]))
    return ordered


def extract_gold_sheet(
    *,
    source: Path,
    out_dir: Path,
    pad: int,
    min_area: int,
) -> None:
    """4×3 gold sheet: label 12 global components (avoids tall-dragon gutter bugs)."""
    if not source.exists():
        raise SystemExit(f"Missing source image: {source}")

    im = Image.open(source).convert("RGB")
    arr = np.array(im)
    mask = foreground_mask_gold(arr)
    # Slightly stronger close so thin necks (horse) stay one component
    closed = binary_closing(mask, structure=np.ones((11, 11)))
    h, w = mask.shape
    labeled, _n = label(closed)
    raw_boxes = components_all(closed, min_area=min_area)
    boxes = sort_grid(raw_boxes, n_rows=4, per_row=3)

    # Map each sorted box back to its label id (by matching bbox)
    def label_id_for(box: dict) -> int:
        cy, cx = int(box["cy"]), int(box["cx"])
        lid = int(labeled[cy, cx])
        if lid == 0:
            # fallback: any nonzero in the tight box
            region = labeled[box["y0"] : box["y1"], box["x0"] : box["x1"]]
            vals, counts = np.unique(region[region > 0], return_counts=True)
            if len(vals) == 0:
                raise SystemExit(f"No label at cy={cy} cx={cx}")
            lid = int(vals[int(np.argmax(counts))])
        return lid

    out_dir.mkdir(parents=True, exist_ok=True)
    crops_meta: list[tuple[str, Path, tuple[int, int, int, int]]] = []
    debug_boxes: list[tuple[str, tuple[int, int, int, int]]] = []

    print(f"source={source.name} size={w}x{h} mode=gold-components pad={pad}")
    for name, b in zip(ANIMALS, boxes):
        lid = label_id_for(b)
        bx0 = max(0, b["x0"] - pad)
        by0 = max(0, b["y0"] - pad)
        bx1 = min(w, b["x1"] + pad)
        by1 = min(h, b["y1"] + pad)
        box = (bx0, by0, bx1, by1)
        # Keep only this component; pad margin stays transparent (no neighbor bleed).
        # Dark-red paper-cut openings (same color as sheet bg) become transparent.
        crop_rgb = arr[by0:by1, bx0:bx1]
        animal = labeled[by0:by1, bx0:bx1] == lid
        keep = binary_dilation(animal, structure=np.ones((5, 5)))
        rgba = np.zeros((by1 - by0, bx1 - bx0, 4), dtype=np.uint8)
        rgba[:, :, :3] = crop_rgb
        rgba[:, :, 3] = np.where(keep & (crop_rgb[:, :, 1] >= 45), 255, 0)
        png = Image.fromarray(rgba, "RGBA")
        path = out_dir / f"{name}.png"
        png.save(path, optimize=True)
        crops_meta.append((name, path, box))
        debug_boxes.append((name, box))
        print(
            f"{name}: box=({bx0},{by0})-({bx1},{by1}) "
            f"cy={b['cy']:.0f} cx={b['cx']:.0f} "
            f"-> {path.relative_to(ROOT)} ({path.stat().st_size} bytes)"
        )

    overlay_path = out_dir / "_cuts-overlay.jpg"
    write_debug_overlay(im, debug_boxes, overlay_path)
    html_path = write_gold_preview_html(out_dir, crops_meta)
    print(f"preview: {html_path}")
    print(f"overlay: {overlay_path}")


def write_gold_preview_html(out_dir: Path, crops: list[tuple[str, Path, tuple[int, int, int, int]]]) -> Path:
    cards = "\n".join(
        f"""    <figure>
      <img src="{path.name}" alt="{name}" />
      <figcaption><strong>{name}</strong><br/>box=({box[0]},{box[1]})–({box[2]},{box[3]})</figcaption>
    </figure>"""
        for name, path, box in crops
    )
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Gold animals — cut preview</title>
  <style>
    body {{ font-family: Georgia, serif; background: #1a0c0c; color: #f0e0c8; margin: 24px; }}
    h1 {{ font-size: 1.25rem; margin: 0 0 8px; }}
    p {{ opacity: 0.75; margin: 0 0 20px; }}
    .grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }}
    figure {{ margin: 0; background: #2a1212; border: 1px solid #5a3030; padding: 12px; text-align: center; }}
    img {{ max-width: 100%; height: auto; background:
      linear-gradient(45deg, #333 25%, transparent 25%),
      linear-gradient(-45deg, #333 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #333 75%),
      linear-gradient(-45deg, transparent 75%, #333 75%);
      background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0; }}
    figcaption {{ margin-top: 8px; font-size: 0.85rem; }}
  </style>
</head>
<body>
  <h1>Gold animal cuts — review before wiring into cards</h1>
  <p>Check tails / horns / dragon / horse. If clipped, raise PAD_GOLD or tweak row gutters, then re-run.</p>
  <div class="grid">
{cards}
  </div>
</body>
</html>
"""
    path = out_dir / "preview.html"
    path.write_text(html, encoding="utf-8")
    return path


def write_debug_overlay(
    im: Image.Image,
    boxes: list[tuple[str, tuple[int, int, int, int]]],
    out_path: Path,
) -> None:
    overlay = im.copy().convert("RGBA")
    draw = ImageDraw.Draw(overlay)
    for name, (x0, y0, x1, y1) in boxes:
        draw.rectangle([x0, y0, x1 - 1, y1 - 1], outline=(0, 255, 180, 255), width=6)
        draw.text((x0 + 12, y0 + 12), name, fill=(0, 255, 180, 255))
    # Downscale for easy viewing
    overlay.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
    overlay.convert("RGB").save(out_path, quality=90)


def extract_sheet(
    *,
    source: Path,
    out_dir: Path,
    n_rows: int,
    per_row: int,
    pad: int,
    fg_mask_fn,
    clear_bg_fn,
    post_fn,
    write_js: bool,
    preview: bool,
    min_area: int,
    row_overlap: int = 0,
) -> None:
    if not source.exists():
        raise SystemExit(f"Missing source image: {source}")

    im = Image.open(source).convert("RGB")
    arr = np.array(im)
    mask = fg_mask_fn(arr)
    closed = binary_closing(mask, structure=np.ones((9, 9)))
    h, w = mask.shape
    y_bounds = row_split_ys(closed, n_rows)

    out_dir.mkdir(parents=True, exist_ok=True)
    icons: dict[str, str] = {}
    crops_meta: list[tuple[str, Path, tuple[int, int, int, int]]] = []
    debug_boxes: list[tuple[str, tuple[int, int, int, int]]] = []
    idx = 0

    print(f"source={source.name} size={w}x{h} rows={n_rows}x{per_row} pad={pad} overlap={row_overlap}")
    print(f"row bounds y={y_bounds}")

    for ri in range(n_rows):
        y0, y1 = y_bounds[ri], y_bounds[ri + 1]
        # Cluster using the nominal row, but measure content with vertical overlap
        # so ears/tails that cross gutters are not clipped.
        comps = components_in_row(closed, y0, y1, min_area=min_area)
        centers = [b["cx"] for b in cluster_n(comps, per_row)]
        cuts = slot_cuts(centers, w)
        ey0 = max(0, y0 - row_overlap)
        ey1 = min(h, y1 + row_overlap)
        for ci in range(per_row):
            name = ANIMALS[idx]
            idx += 1
            x0, x1 = cuts[ci], cuts[ci + 1]
            if row_overlap > 0:
                bbox = slot_content_bbox_anchored(closed, x0, x1, y0, y1, ey0, ey1)
                if bbox is None:
                    raise SystemExit(f"No content for {name}")
                cx0, cy0, cx1, cy1 = bbox
                bx0 = max(0, cx0 - pad)
                by0 = max(0, cy0 - pad)
                bx1 = min(w, cx1 + pad)
                by1 = min(h, cy1 + pad)
            else:
                bbox = slot_content_bbox(closed[y0:y1, x0:x1])
                if bbox is None:
                    raise SystemExit(f"No content for {name}")
                lx0, ly0, lx1, ly1 = bbox
                bx0 = max(0, x0 + lx0 - pad)
                by0 = max(0, y0 + ly0 - pad)
                bx1 = min(w, x0 + lx1 + pad)
                by1 = min(h, y0 + ly1 + pad)
            box = (bx0, by0, bx1, by1)
            crop = im.crop(box)
            png = post_fn(clear_bg_fn(crop))
            path = out_dir / f"{name}.png"
            png.save(path, optimize=True)
            crops_meta.append((name, path, box))
            debug_boxes.append((name, box))
            if write_js:
                b64 = base64.b64encode(path.read_bytes()).decode("ascii")
                icons[name] = f"data:image/png;base64,{b64}"
            print(
                f"{name}: box=({bx0},{by0})-({bx1},{by1}) "
                f"-> {path.relative_to(ROOT)} ({path.stat().st_size} bytes)"
            )

    if write_js:
        JS_OUT.parent.mkdir(parents=True, exist_ok=True)
        JS_OUT.write_text(
            "/** Auto-generated by scripts/extract-animals.py — do not edit. */\n"
            f"export default {json.dumps(icons, indent=2)};\n",
            encoding="utf-8",
        )
        print(f"wrote {JS_OUT.relative_to(ROOT)}")

    if preview:
        overlay_path = out_dir / "_cuts-overlay.jpg"
        write_debug_overlay(im, debug_boxes, overlay_path)
        html_path = write_gold_preview_html(out_dir, crops_meta)
        print(f"preview: {html_path}")
        print(f"overlay: {overlay_path}")


def install_gold_assets(max_side: int = GOLD_CARD_MAX) -> None:
    """Promote reviewed crops into assets/animals-gold + animal-gold-icons.js."""
    if not OUT_GOLD.exists():
        raise SystemExit(f"Missing review crops: {OUT_GOLD} (run --gold first)")
    OUT_GOLD_ASSETS.mkdir(parents=True, exist_ok=True)
    icons: dict[str, str] = {}
    for name in ANIMALS:
        src = OUT_GOLD / f"{name}.png"
        if not src.exists():
            raise SystemExit(f"Missing {src}")
        im = Image.open(src).convert("RGBA")
        w, h = im.size
        scale = min(1.0, max_side / max(w, h))
        if scale < 1:
            im = im.resize(
                (max(1, int(w * scale)), max(1, int(h * scale))),
                Image.Resampling.LANCZOS,
            )
        path = OUT_GOLD_ASSETS / f"{name}.png"
        im.save(path, optimize=True)
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        icons[name] = f"data:image/png;base64,{b64}"
        print(f"install {name}: {im.size[0]}x{im.size[1]} -> {path.relative_to(ROOT)}")
    JS_GOLD_OUT.parent.mkdir(parents=True, exist_ok=True)
    JS_GOLD_OUT.write_text(
        "/** Auto-generated from assets/animals-gold — do not edit. */\n"
        f"export default {json.dumps(icons, indent=2)};\n",
        encoding="utf-8",
    )
    print(f"wrote {JS_GOLD_OUT.relative_to(ROOT)}")


def main() -> None:
    ap = argparse.ArgumentParser(description="Extract 12 zodiac animal PNGs from a sheet.")
    ap.add_argument(
        "--gold",
        action="store_true",
        help="Cut job549-hein-gold-018.jpg (4×3) into scripts/out/gold-animals/ for review",
    )
    ap.add_argument(
        "--install-gold",
        action="store_true",
        help="Copy reviewed gold crops into assets/animals-gold + animal-gold-icons.js",
    )
    ap.add_argument(
        "--pad",
        type=int,
        default=None,
        help="Padding around content bbox (default: 56 accent / 40 gold)",
    )
    ap.add_argument(
        "--min-area",
        type=int,
        default=None,
        help="Min component area to keep (default scales with image)",
    )
    args = ap.parse_args()

    if args.install_gold:
        install_gold_assets()
        return

    if args.gold:
        pad = args.pad if args.pad is not None else PAD_GOLD
        # 5000² sheet → each animal is a large connected gold blob
        min_area = args.min_area if args.min_area is not None else 15000
        extract_gold_sheet(
            source=SOURCE_GOLD,
            out_dir=OUT_GOLD,
            pad=pad,
            min_area=min_area,
        )
        print("\nReview scripts/out/gold-animals/preview.html then: python scripts/extract-animals.py --install-gold")
        return

    pad = args.pad if args.pad is not None else PAD_ACCENT
    min_area = args.min_area if args.min_area is not None else 30000
    extract_sheet(
        source=SOURCE_ACCENT,
        out_dir=OUT_ACCENT,
        n_rows=2,
        per_row=6,
        pad=pad,
        fg_mask_fn=foreground_mask_white_bg,
        clear_bg_fn=flood_clear_white_bg,
        post_fn=lambda rgba: to_accent_mask(to_square(rgba)),
        write_js=True,
        preview=False,
        min_area=min_area,
    )


if __name__ == "__main__":
    main()
