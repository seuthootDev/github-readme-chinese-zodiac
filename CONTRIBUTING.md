# Contributing to github-readme-chinese-zodiac

Thanks for stopping by. This project is playfully themed around the **Asian zodiac** (十二生肖 / 12 animals). **New ideas are welcome anytime.**

Sister project (Western zodiac): [github-readme-zodiac](https://github.com/seuthootDev/github-readme-zodiac)

## Help wanted: pinned Gist polish (highest priority)

The **SVG README card** is in good shape. The **pinned Gist** path works end-to-end, but the **ASCII / seal presentation is not yet at the quality we want to call “done.”** That is intentional transparency for future contributors — not a blocker for using Pins.

Known gap:

- **Hanzi seal / emblem breaks in monospace.** The right-column stamp in [`src/gist/emblem.js`](src/gist/emblem.js) mixes box-drawing frames with CJK (地支 + 生肖). On GitHub Pins and many monospace fonts, wide characters throw alignment off — boxes look warped, padding uneven, or “broken.” We want a seal that stays crisp in the ~5-line pin preview across common fonts.

What helps most:

1. Redesign frames / spacing (or a different emblem grammar) so CJK + ASCII align reliably
2. Preview with `npm run preview:gists` (and the PDF/HTML under `docs/`)
3. Open a PR — even improving a few animals’ frames is welcome

SVG card hanzi / vermilion styling is a separate track; the pin seal is the pain point today.

## Ideas we especially love

- **Alternate card designs** — SVG layouts, palettes, animal motifs
- **Copy & flavor text** — animal titles, descriptions, taglines
- **Role / identity mapping** — better auto-roles, animal-flavored suggestions
- **Birth-year accuracy** — finer Chinese New Year boundary tables
- **Pin (Gist) presentation** — seal alignment (above), clearer 5-line pins, safer monospace art
- **Docs & DX** — fork setup, examples, translations

Open an issue first if you want to bounce an idea around.

## Ground rules

1. Keep the playful Asian-zodiac tone.
2. Prefer backward-compatible URL/API changes.
3. Pin cards must stay readable in GitHub’s ~5-line Gist preview.
4. Do not commit secrets.
5. Match existing code style; keep diffs focused.

## How to contribute

1. Fork and branch (`feat/…`, `fix/…`, `docs/…`)
2. Preview locally: `npm start` / `npm run preview:gists`
3. Open a PR against `main` with a short **what / why**

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
