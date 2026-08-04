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
🐷 PIG · Generous Collaborator      ╭────╮
✨ JUNG SEUNGHOON · Full-Stack Dev  │ 亥 │
🌟   4  📦  37  👥   0              │ 猪 │
Renown     █░░░░░░░░░░░   7%        ╰────╯
Craft      █████████░░░  76%          生肖
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

## 1) Pin a Gist

Same idea as productive-box: **Action updates your Gist → pin that Gist**. No Vercel needed for Pins.

| You are… | Where to put secrets / run the Action |
|----------|----------------------------------------|
| **Repo owner** (this repo) | Use **this repo** — no fork |
| **Someone else** | [Fork this repo](https://github.com/seuthootDev/github-readme-chinese-zodiac), then use **your fork** |

### 1. Create a public Gist

1. https://gist.github.com/
2. Filename e.g. `chinese_zodiac.md`, any placeholder text
3. **Create public gist**
4. Copy only the **Gist ID** (not the `.js` embed URL):  
   `https://gist.github.com/YOU/`**`GIST_ID`**  
   Example: `6d4d8e34f5d87731b74fe7e9d8f8066b`

### 2. Create a token (once)

https://github.com/settings/tokens → **Tokens (classic)** → enable **`gist`** only.  
The token string is shown **once** — save it. The same PAT can be reused on Western + Asian repos.

### 3. Secrets and Variables

On the repo (or your fork): **Settings → Secrets and variables → Actions**

**Secrets** tab:

| Secret | Value |
|--------|--------|
| `GH_TOKEN` | PAT with `gist` scope |
| `GIST_ID` | Gist ID only (see above) |

**Variables** tab (optional but recommended):

| Variable | Value | Notes |
|----------|--------|--------|
| `BIRTHDATE` | `YYYY-MM-DD` | e.g. `1995-04-24` → animal year |
| `USERNAME` | your GitHub login | default: token owner |
| `SIGN` | `pig` | force an animal |
| `NAME` / `ROLE` | display overrides | optional |

> Birthdate is a **Variable** (`BIRTHDATE`), not a Secret.  
> Path: Settings → Secrets and variables → Actions → **Variables** → New repository variable.

### 4. Run the Action

1. **Actions** → enable workflows if prompted  
2. **Update Asian Zodiac Gist** → **Run workflow**  
3. [Pin the Gist on your profile](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile)

Also runs on every push to `main` and daily at 00:00 UTC.

### Pin vs SVG

| Feature | Action on this repo / your fork? | Vercel? |
|---------|----------------------------------|---------|
| **Pinned Gist** | Yes | No |
| **SVG in README** | No | Yes (`github-readme-chinese-zodiac.vercel.app`) |

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

## Stats (playful, not astrology)

Each card shows **3 of 5** traits. Which three appear depends on the animal’s `statKeys`. Values are scaled from public GitHub signals (0–100) — same math as the [Western sister project](https://github.com/seuthootDev/github-readme-zodiac), Asian-flavored names.

| Stat | Western twin | Drawn from (roughly) |
|------|--------------|----------------------|
| **Discipline** | Consistency | Account age + repos per year |
| **Ingenuity** | Explorer | Distinct languages + public repos |
| **Craft** | Builder | Public repos + stars + forks |
| **Renown** | Open Source | Stars + forks + followers |
| **Insight** | Debugger | Open issues + repos (+ a little stars) |

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
