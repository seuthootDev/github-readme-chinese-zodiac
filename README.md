# github-readme-chinese-zodiac

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Contributing](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Asian zodiac** profile cards from your GitHub activity — the 12 animals (生肖), rendered as SVG README cards or pinned Gists.

> Your coding personality written in the Asian zodiac

Sister project (Western zodiac): [github-readme-zodiac](https://github.com/seuthootDev/github-readme-zodiac)

| Mode | Where it appears | Style |
|------|------------------|--------|
| **Pinned Gist** | Profile **Pins** | ASCII / text card |
| **SVG card** | Profile **README** | Full-color image (default **360×192**) |

**Live demo:** [https://github-readme-chinese-zodiac.vercel.app](https://github-readme-chinese-zodiac.vercel.app)

---

## What a Pin looks like

GitHub only shows about **5 lines** of a pinned Gist. Full 12-animal gallery (pin + full gist):

**[Gist pin preview — 12 animals (PDF)](docs/gist-pin-preview-12-animals.pdf)**

Also: [docs/gist-pin-preview.html](docs/gist-pin-preview.html)

Example pin body (Pig / 亥 — `birthdate=1995-04-24`):

```text
🐷 PIG · Generous Collaborator          +----+
✨ JUNG SEUNGHOON · Full-Stack Dev      | 猪 |
⭐   4  📦  37  👥   0                   | 亥 |
Renown     █░░░░░░░░░░░   7%            +----+
Craft      █████████░░░  76%             生肖
```

---

## Demo (SVG)

```md
![Asian Zodiac](https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&v=3)
```

<p align="center">
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&v=3" alt="Asian Zodiac" />
</p>

With birthdate (animal year):

```md
![Asian Zodiac](https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&birthdate=1995-04-24&v=3)
```

<p align="center">
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&birthdate=1995-04-24&v=3" alt="Asian Zodiac Pig" />
</p>

### All 12 animals

<p align="center">
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=rat&v=3" width="49%" alt="Rat" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=ox&v=3" width="49%" alt="Ox" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=tiger&v=3" width="49%" alt="Tiger" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=rabbit&v=3" width="49%" alt="Rabbit" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=dragon&v=3" width="49%" alt="Dragon" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=snake&v=3" width="49%" alt="Snake" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=horse&v=3" width="49%" alt="Horse" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=goat&v=3" width="49%" alt="Goat" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=monkey&v=3" width="49%" alt="Monkey" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=rooster&v=3" width="49%" alt="Rooster" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=dog&v=3" width="49%" alt="Dog" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=pig&v=3" width="49%" alt="Pig" />
</p>

---

## Animals (`sign=` param)

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

---

## 1) Pin a Gist — fork this repo

1. Fork [seuthootDev/github-readme-chinese-zodiac](https://github.com/seuthootDev/github-readme-chinese-zodiac)
2. Create a **public** Gist and copy its ID
3. Create a PAT with **`gist`** scope
4. On **your fork**, add secrets `GH_TOKEN` + `GIST_ID` (optional vars: `USERNAME`, `BIRTHDATE`, `SIGN`, …)
5. Actions → **Update Asian Zodiac Gist** → Run workflow
6. [Pin the Gist](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile)

Pin path uses **your fork’s Action only** — not Vercel.

---

## 2) SVG card (README embed)

```md
![Asian Zodiac](https://github-readme-chinese-zodiac.vercel.app/api/card?username=YOUR_USERNAME)

![Asian Zodiac](https://github-readme-chinese-zodiac.vercel.app/api/card?username=YOUR_USERNAME&birthdate=1995-04-24)

![Asian Zodiac](https://github-readme-chinese-zodiac.vercel.app/api/card?username=YOUR_USERNAME&sign=dragon&width=360)
```

### Options

| Param | Description |
|-------|-------------|
| `username` | GitHub username (**required**) |
| `birthdate` | `YYYY-MM-DD` → animal year |
| `sign` | Force animal: `rat` … `pig` |
| `name` / `role` | Overrides (auto by default) |
| `width` | `240`–`900`, default **`360`** |

---

## Local development

```bash
npm start
# http://localhost:3000

npm run preview:gists
```

## Contributing

Designs, copy, animal-flavored roles, better New Year tables — **welcome anytime.**  
See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © seuthootDev
