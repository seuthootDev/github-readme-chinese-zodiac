# Cute default theme — design

Date: 2026-10-13
Status: approved in brainstorming, pending spec review

## Goal

Refresh the SVG card with a cute, pastel "kawaii" look so the repo feels current and
appeals to today's README card audience. The cute look becomes the **default**; the
current vermilion/gold brush design stays available as `theme=classic`.

Non-Asian viewers often don't know the 12-animal zodiac, so the cute card must still
read clearly as *Chinese zodiac*: the large hanzi stays prominent and the card says
"Year of the Pig" plus the hanzi's pinyin and meaning.

## Scope

In scope:
- New default SVG card theme (`cute`) for `api/card`.
- Existing design preserved as `theme=classic` with no visual change.
- 12 hand-coded vector sticker characters.
- Per-animal pastel palettes, pinyin data.
- Embedded Fredoka + ZCOOL KuaiLe font subsets.
- README demo images and docs updated; version bump to `0.2.0`.

Out of scope:
- Pinned Gist (text) output.
- Error SVG card.
- README banner image.

## Visual system

### Theme parameter

- `theme=cute` (default) — new design.
- `theme=classic` — current design, unchanged.
- Any other or missing value → `cute`.

### Layout (600×320 viewBox, display width unchanged: default 360, 240–900)

Card: rounded rect (rx 26), animal `bg` fill, 3px `mid` border, faint polka-dot pattern.

Right side:
- Giant hanzi (e.g. 猪) in ZCOOL KuaiLe, ~230px, filled with `mid`, centered near x≈470.
- Sticker character (~150px) overlapping the lower part of the hanzi.
- Small sparkle decorations (✦ shapes).
- Tag pill under the character: `猪 zhū · “pig”` (hanzi in `accent`, rest in body brown).

Left side, top to bottom (x = 30):
1. `YEAR OF THE PIG · 亥` — small caps-style, `accent`, letter-spaced.
2. Title (e.g. "Generous Collaborator") — 28px bold, brown.
3. Description — up to two lines (13px, muted); "…" if it still doesn't fit.
   (Descriptions are 65–87 chars, so one line would cut most of them.)
4. Login + real name and role (smaller, muted). To keep the line out of the hanzi area,
   role is dropped first, then real name, when the line would be too wide.
5. Languages line — `✦ TypeScript · JavaScript · Python`, `accent`.
6. Three stat rows — label, rounded pill bar (track `mid`, fill `accent`), value.
   Bars stay relative to the highest of the three (`relativeFill`).
7. Footer: "Your coding personality written in the Asian zodiac" (left) and
   `Water · by birth year` / `Water · by name-seed` (right, muted).

Shared colors across all animals: outline and body text brown `#5a3d35`; muted text `#b08890`.

### Palettes (`cuteColors` = bg / mid / accent)

| id | name | bg | mid | accent |
|----|------|----|-----|--------|
| rat | lavender gray | `#f3f1f7` | `#ddd7ec` | `#9b8fc4` |
| ox | cream beige | `#fbf5ea` | `#efdfc2` | `#c99a5e` |
| tiger | apricot | `#fff3e8` | `#ffd9b8` | `#ff9e5e` |
| rabbit | lilac | `#f7f1fd` | `#e4d4f7` | `#b48be6` |
| dragon | mint | `#ecfaf5` | `#c7eedf` | `#45bf98` |
| snake | lime | `#f3faea` | `#d9efc0` | `#84c050` |
| horse | peach | `#fff1ec` | `#ffd5c6` | `#f58a6c` |
| goat | ivory | `#fbf9f1` | `#ece4c8` | `#b5a066` |
| monkey | butter | `#fffbe6` | `#fff0a8` | `#e8b520` |
| rooster | coral | `#fff0f0` | `#ffcfcf` | `#ff6f6f` |
| dog | sky | `#eef6fd` | `#cfe5fa` | `#5aa8e8` |
| pig | pink | `#fff4f7` | `#ffd2dd` | `#ff8fa3` |

### Pinyin

鼠 shǔ · 牛 niú · 虎 hǔ · 兔 tù · 龙 lóng · 蛇 shé · 马 mǎ · 羊 yáng · 猴 hóu · 鸡 jī · 狗 gǒu · 猪 zhū

### Character style ("sticker outline")

Each character is a chibi face drawn in a 120×120 box:
- drop shadow (offset 2,3; black 12% opacity),
- white sticker border (white stroke ~14px around the silhouette),
- brown `#5a3d35` 3px outline on the colored shapes,
- dot eyes with a small white highlight, pink blush ellipses.

Reference: pig and tiger mockups from brainstorming (`.superpowers/brainstorm/.../character-style.html`, option B).

### Fonts

- Latin: **Fredoka** (OFL). Hanzi: **ZCOOL KuaiLe** (OFL).
- Both embedded as base64 woff2 subsets (same approach as the current Ma Shan Zheng embed)
  so GitHub Camo / `<img>` renders them.
- A card embeds only its own theme's fonts.

### `glow=1`

- classic: unchanged (blur halo + twinkle on the large hanzi).
- cute: sparkles around the character twinkle (opacity animation); no blur halo.

## Code structure

| File | Change |
|------|--------|
| `src/render/card.js` | Becomes a dispatcher: `renderZodiacCard({ profile, zodiac, stats, meta })` picks the renderer by `meta.theme`. Public signature and `CARD_SIZE` export unchanged. |
| `src/render/themes/classic.js` | Current renderer moved verbatim (no behavior change). |
| `src/render/themes/cute.js` | New renderer implementing the layout above. |
| `src/data/cute-animals.js` | 12 character definitions. |
| `src/data/animals.js` | Add `pinyin` and `cuteColors` to each animal; existing `colors` stay for classic. |
| `api/card.js` | Read `theme` with `resolveTheme()` (exported from `src/render/card.js` so it is unit-testable); pass `theme` in `meta`. |
| `scripts/embed-fonts.js` | Also fetch Fredoka + ZCOOL KuaiLe subsets; export classic and cute CSS separately from `src/data/embedded-fonts.js`. Subset text includes cute-only UI strings ("YEAR OF THE", pinyin with tone marks, "by birth year", "by name-seed", ✦, curly quotes). |
| `scripts/preview-card.js`, `scripts/local-server.js` | Support `theme` so all 12 cards can be previewed in both themes. |

### Character data shape

```js
// src/data/cute-animals.js
export default {
  pig: {
    silhouette: [ /* SVG shape strings: head, ears, horns… (colored, outlined) */ ],
    details:    [ /* SVG shape strings: eyes, snout, stripes, blush… (drawn on top) */ ],
  },
  // …
};
```

The renderer builds the sticker layers from `silhouette` automatically:
1. shadow copy (translated, black, wide stroke),
2. white copy (wide white stroke),
3. the colored shapes with the brown outline,
then `details` on top. This keeps all 12 consistent, and a new character only needs shapes.

### Size

Target total card size in the same range as today (~30 KB-ish), dominated by fonts.

## Testing

Added to `src/render/card.test.js` (run by `npm test`):
- Existing two tests keep passing with explicit `theme: "classic"` (guards the move).
- No theme → cute output (contains Fredoka font face and the animal's `cuteColors.bg`).
- All 12 animals render in cute with their hanzi, pinyin, `YEAR OF THE <SIGN>`, and a character group; output is well-formed XML (balanced tags).
- Cute stat bars use relative fill against the top of the three shown stats.
- User-supplied text (name/role with `<script>`, `&`) is escaped in cute.

`resolveTheme()` cases: `classic` → classic; `cute`, empty, unknown → cute.

Manual: `npm run preview:card` renders 12 cute + 12 classic cards to HTML; check that embedded fonts render when the SVG is loaded via `<img>` (no external fonts).

## Rollout

- README: replace demo images with the new design, add `theme` to the Options table, add a
  note: "🎀 New default design — add `&theme=classic` to keep the old look."
- Bump `package.json` version to `0.2.0`; commit message states the default look changed.
- Add `.superpowers/` to `.gitignore`.
