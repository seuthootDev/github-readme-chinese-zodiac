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

**Live SVG demo:** deploy this repo on Vercel, then use your deployment URL (placeholder below until live):

`https://github-readme-chinese-zodiac.vercel.app`

---

## Animals (sign param)

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

**Birthdate → animal** uses the birth **year** (with a simple pre–Feb 4 → previous year approximation). No birthdate → deterministic animal from username hash.

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

After Vercel deploy:

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
