# github-readme-chinese-zodiac

[![CI](https://github.com/seuthootDev/github-readme-chinese-zodiac/actions/workflows/ci.yml/badge.svg)](https://github.com/seuthootDev/github-readme-chinese-zodiac/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![GitHub stars](https://img.shields.io/github/stars/seuthootDev/github-readme-chinese-zodiac.svg?style=flat)](https://github.com/seuthootDev/github-readme-chinese-zodiac/stargazers) [![Contributing](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Your GitHub activity as one of the 12 Asian zodiac animals (生肖).** A profile card for your README — add it with a single URL.

<p align="center">
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev" alt="Asian Zodiac" />
</p>

## Quick start

Paste this into your profile README and replace `YOUR_USERNAME`:

```md
[![Asian Zodiac](https://github-readme-chinese-zodiac.vercel.app/api/card?username=YOUR_USERNAME&birthdate=YYYY-MM-DD)](https://github.com/seuthootDev/github-readme-chinese-zodiac)
```

That's it — no fork, no token, no setup. Your animal comes from your birth year (or force one with `sign=`), and the stats come from your public GitHub activity.

**Live demo:** [github-readme-chinese-zodiac.vercel.app](https://github-readme-chinese-zodiac.vercel.app)

> 🎀 **New default design (v0.2).** Cards now use a pastel sticker look. Prefer the original vermilion & gold brush style? Add `&theme=classic` to your URL.

## All 12 animals

<p align="center">
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=rat" width="360" alt="Rat" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=ox" width="360" alt="Ox" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=tiger" width="360" alt="Tiger" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=rabbit" width="360" alt="Rabbit" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=dragon" width="360" alt="Dragon" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=snake" width="360" alt="Snake" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=horse" width="360" alt="Horse" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=goat" width="360" alt="Goat" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=monkey" width="360" alt="Monkey" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=rooster" width="360" alt="Rooster" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=dog" width="360" alt="Dog" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=pig" width="360" alt="Pig" />
</p>

## Themes & variants

With birthdate (animal year):

```md
[![Asian Zodiac](https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&birthdate=1995-04-24&width=360&glow=1)](https://github.com/seuthootDev/github-readme-chinese-zodiac)
```

<p align="center">
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&birthdate=1995-04-24&width=360&glow=1" alt="Asian Zodiac Pig" />
</p>

Classic theme (the original vermilion & gold brush design):

```md
[![Asian Zodiac](https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&birthdate=1995-04-24&theme=classic)](https://github.com/seuthootDev/github-readme-chinese-zodiac)
```

<p align="center">
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&birthdate=1995-04-24&theme=classic" alt="Asian Zodiac Pig — classic theme" />
</p>

### Options

| Param | Description |
|-------|-------------|
| `username` | GitHub username (**required**) |
| `birthdate` | `YYYY-MM-DD` → animal year |
| `sign` | Force animal: `rat` … `pig` |
| `name` / `role` | Overrides (auto by default) |
| `width` | `240`–`900`, default **`360`** |
| `theme` | `cute` (default) — pastel sticker card · `classic` — original vermilion & gold brush card |
| `glow` | `1` / `true` — cute: sparkles twinkle around the character · classic: soft halo + twinkle on the large hanzi (default off; best when opening the SVG URL directly — GitHub Camo is a still frame) |

### Year mark (本命年)

When your card's animal rules the current year, it gets a special mark automatically — no parameter needed. The color follows the year's heavenly stem (天干): **blue** (wood), **red** (fire), **golden** (earth), **white** (metal), **black** (water). 2026 is 丙午, the **Red Horse**; 2027 is 丁未, the **Red Goat**; 2028 is 戊申, the **Golden Monkey**.

- **cute:** a corner sash (`2026 · 丙午`) and a `RED HORSE YEAR` header
- **classic:** a hanging ribbon with 丙午年 and a gold tassel

The year switches on Feb 4 (立春), the same boundary used for `birthdate`.

### Animals (`sign=` param)

| `sign=` | Animal |
|---------|--------|
| `rat` | 🐀 Rat |
| `ox` | 🐂 Ox |
| `tiger` | 🐅 Tiger |
| `rabbit` | 🐇 Rabbit |
| `dragon` | 🐉 Dragon |
| `snake` | 🐍 Snake |
| `horse` | 🐴 Horse |
| `goat` | 🐐 Goat |
| `monkey` | 🐒 Monkey |
| `rooster` | 🐓 Rooster |
| `dog` | 🐕 Dog |
| `pig` | 🐷 Pig |

**Birthdate → animal** uses the birth **year** (simple pre–Feb 4 → previous year approximation). No birthdate → deterministic animal from username hash.

Sister project (Western zodiac): [github-readme-zodiac](https://github.com/seuthootDev/github-readme-zodiac)

---

## Bonus: pin it as a Gist

Prefer your profile **Pins** over the README? This repo is also a [GitHub Action](https://github.com/marketplace/actions/chinese-zodiac-dev-card-gist) that keeps a text version of the card in a pinned Gist — no fork needed.

| Mode | Where it appears | Setup |
|------|------------------|--------|
| **SVG card** | Profile **README** | One URL (above) |
| **Pinned Gist** | Profile **Pins** | Token + one workflow file (below) |

### What a Pin looks like

GitHub only shows about **5 lines** of a pinned Gist. Full 12-animal gallery (pin + full gist):

**[Gist pin preview — 12 animals (PDF)](docs/gist-pin-preview-12-animals.pdf)**

Also: [docs/gist-pin-preview.html](docs/gist-pin-preview.html)

Example pin body (Pig / 亥 — `birthdate=1995-04-24`):

```text
🐷 PIG · Generous Collaborator        ╭────╮
✨ seuthootDev · JUNG SEUNGHOON       │ 亥 │
🌟   4  📦  37  👥   0                │ 猪 │
Renown     █░░░░░░░░░░░   7%          ╰────╯
Craft      █████████░░░  76%            生肖
```

> **Pin quality (help wanted).** Pins work, but the hanzi seal often misaligns in monospace (wide CJK vs box-drawing). SVG cards are the polished path today — see [CONTRIBUTING.md](CONTRIBUTING.md#help-wanted-pinned-gist-polish-highest-priority) if you want to improve `src/gist/emblem.js`.

#### How to put this on your profile Pins

1. Create a **public** [Gist](https://gist.github.com/) (any filename, placeholder text) and copy its ID  
   (`https://gist.github.com/YOU/`**`GIST_ID`** — not the `.js` embed URL)
2. Create a [classic token](https://github.com/settings/tokens) with only the **`gist`** scope (shown once — save it)
3. In any repo you own (your `USERNAME/USERNAME` profile repo is a good home), add Secrets `GH_TOKEN` (the token) and `GIST_ID`  
   **Settings → Secrets and variables → Actions → New repository secret**
4. Add `.github/workflows/zodiac-gist.yml`:

```yaml
name: Update Chinese Zodiac Gist

on:
  workflow_dispatch:
  schedule:
    - cron: "0 0 * * *" # daily, 00:00 UTC

jobs:
  update-gist:
    runs-on: ubuntu-latest
    steps:
      - uses: seuthootDev/github-readme-chinese-zodiac@v1
        with:
          gh_token: ${{ secrets.GH_TOKEN }}
          gist_id: ${{ secrets.GIST_ID }}
          birthdate: "1995-04-24" # optional — picks your animal
```

5. **Actions** → **Update Chinese Zodiac Gist** → **Run workflow**
6. [Pin the Gist](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile) on your profile

#### Inputs

| Input | Required | Notes |
|-------|----------|-------|
| `gh_token` | yes | PAT with `gist` scope — pass it from a secret |
| `gist_id` | yes | Gist ID only |
| `birthdate` | no | `YYYY-MM-DD` → animal year |
| `sign` | no | force an animal, e.g. `pig` |
| `username` | no | GitHub login (default: token owner) |
| `name` / `role` | no | display overrides |

The token is used only to read your public stats and write that one Gist.

#### Pin vs SVG

| Feature | Action? | Vercel? |
|---------|---------|---------|
| **Pinned Gist** | Yes | No |
| **SVG in README** | No | Yes (`github-readme-chinese-zodiac.vercel.app`) |

---

## Stats

Each card shows **3 of 5** traits. Which three appear depends on the animal’s `statKeys`. Values are weighted from public GitHub signals with **no maximum** — same math as the [Western sister project](https://github.com/seuthootDev/github-readme-zodiac), Asian-flavored names. Bars are relative to the highest of the three shown.

| Stat | Western twin | Drawn from (roughly) |
|------|--------------|----------------------|
| **Discipline** | Consistency | Account age + repos per year |
| **Ingenuity** | Explorer | Distinct languages + public repos |
| **Craft** | Builder | Public repos + stars + forks |
| **Renown** | Open Source | Stars + forks + followers |
| **Insight** | Debugger | Open issues + repos (+ a little stars) |

---

## Daily forecast & streak

On the default (cute) card, the line under the title is a **daily dev horoscope** — a lucky language (picked from your own top languages) and one piece of advice. It changes every day (UTC) and stays the same all day.

The footer shows your **current streak** and **contributions this year**. This needs `GITHUB_TOKEN` on the server (GraphQL); without it the card shows the tagline instead. `theme=classic` keeps its original blurb and tagline.

## Local development

```bash
npm start
# http://localhost:3000

npm run preview:gists
```

## Contributing

Designs, copy, animal-flavored roles, better New Year tables — **welcome anytime.**  
Highest-priority gap today: **pinned Gist hanzi seal alignment** (see [help wanted](CONTRIBUTING.md#help-wanted-pinned-gist-polish-highest-priority)).  
See [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits / attribution

Animal artwork is derived from a Magnific (Freepik) asset under a **free license with attribution**:

| Used for | Asset | Designed by | Certificate |
|----------|--------|-------------|-------------|
| Title animals (`assets/animals`) | [chinese zodiac new year signs — red silhouettes](https://www.magnific.com/free-vector/chinese-zodiac-new-year-signs-traditional-china-horoscope-animals-red-zodiacs-silhouette_10722644.htm) | [tartila — Magnific.com](https://www.magnific.com) | [docs/license-chinese-zodiac-red-silhouettes-10722644.pdf](docs/license-chinese-zodiac-red-silhouettes-10722644.pdf) |
| Card background animals (`assets/animals-gold`) | [chinese new year animals — gold zodiac sign stickers](https://www.magnific.com/free-vector/chinese-new-year-animals-vector-gold-animal-zodiac-sign-stickers-set_18226630.htm) | Magnific / Freepik | [docs/license-chinese-zodiac-gold-animals-18226630.pdf](docs/license-chinese-zodiac-gold-animals-18226630.pdf) |

## License

[MIT](LICENSE) © seuthootDev

Third-party artwork remains under its Magnific license (see certificate above); the MIT license covers this repository’s code.

---

## More from the same author

Want a terminal-style contribution graph too? Sister project:

### [github-readme-insight-terminal-ascii](https://github.com/seuthootDev/github-readme-insight-terminal-ascii)

GitHub stats as macOS / Windows / Ubuntu terminal SVGs — contribution graph, stats, top languages, neofetch.

![mac](https://github-readme-insight-terminal-asci.vercel.app/svg?user=torvalds&theme=mac&scale=0.8)

```md
![GitHub contribution graph](https://github-readme-insight-terminal-asci.vercel.app/svg?user=YOUR_USERNAME&theme=mac)
```

### [claude-gh-guard](https://github.com/seuthootDev/claude-gh-guard)

Not a card, but a tool for anyone juggling personal and work GitHub accounts in [Claude Code](https://claude.com/claude-code). It shows the GitHub and Claude account in use on the status line, and blocks `git commit`, `git push` and `gh pr create` when the account is definitely the wrong one for the repo.

![Matching account](https://raw.githubusercontent.com/seuthootDev/claude-gh-guard/main/assets/match.png)

![Wrong account, gh pr create blocked](https://raw.githubusercontent.com/seuthootDev/claude-gh-guard/main/assets/mismatch.png)

![No remote, nothing to check](https://raw.githubusercontent.com/seuthootDev/claude-gh-guard/main/assets/no-remote.png)

```sh
npx claude-gh-guard init
```
