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
🐷 PIG · Generous Collaborator        ╭────╮
✨ JUNG SEUNGHOON · Full-Stack Dev    │ 亥 │
🌟   4  📦  37  👥   0                │ 猪 │
Renown     █░░░░░░░░░░░   7%          ╰────╯
Craft      █████████░░░  76%            生肖
```

### How to put this on your profile Pins

Same pattern as [productive-box](https://github.com/maxam2017/productive-box): **fork → Action fills your Gist → pin that Gist**. No Vercel for Pins.

1. **[Fork this repo](https://github.com/seuthootDev/github-readme-chinese-zodiac/fork)**
2. Create a **public** [Gist](https://gist.github.com/) and copy its ID  
   (`https://gist.github.com/YOU/`**`GIST_ID`** — not the `.js` embed URL)
3. Create a PAT with **`gist`** scope → on **your fork**, add Secrets `GH_TOKEN` + `GIST_ID`
4. On **your fork**, add Variable `BIRTHDATE` = `YYYY-MM-DD` (optional but recommended)
5. **Actions** → **Update Asian Zodiac Gist** → **Run workflow**
6. [Pin the Gist](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile) on your profile

Details (secrets table, variables, schedule): **[§ Pin a Gist — fork setup](#1-pin-a-gist--fork-setup)** below.

---

## Demo (SVG)

```md
![Asian Zodiac](https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&width=360)
```

<p align="center">
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&width=360" alt="Asian Zodiac" />
</p>

With birthdate (animal year):

```md
![Asian Zodiac](https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&birthdate=1995-04-24&width=360)
```

<p align="center">
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&birthdate=1995-04-24&width=360" alt="Asian Zodiac Pig" />
</p>

### All 12 animals

<p align="center">
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=rat&width=360" width="49%" alt="Rat" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=ox&width=360" width="49%" alt="Ox" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=tiger&width=360" width="49%" alt="Tiger" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=rabbit&width=360" width="49%" alt="Rabbit" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=dragon&width=360" width="49%" alt="Dragon" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=snake&width=360" width="49%" alt="Snake" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=horse&width=360" width="49%" alt="Horse" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=goat&width=360" width="49%" alt="Goat" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=monkey&width=360" width="49%" alt="Monkey" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=rooster&width=360" width="49%" alt="Rooster" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=dog&width=360" width="49%" alt="Dog" />
  <img src="https://github-readme-chinese-zodiac.vercel.app/api/card?username=seuthootDev&sign=pig&width=360" width="49%" alt="Pig" />
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

## 1) Pin a Gist — fork setup

**Recommended for everyone:** fork this repo and run the Action on **your fork**.  
(That keeps your token/Gist on your account and matches how most README pin projects work.)

### 1. Fork

Fork [seuthootDev/github-readme-chinese-zodiac](https://github.com/seuthootDev/github-readme-chinese-zodiac).

### 2. Create a public Gist

1. https://gist.github.com/
2. Filename e.g. `chinese_zodiac.md`, any placeholder text
3. **Create public gist**
4. Copy only the **Gist ID** (not the `.js` embed URL):  
   `https://gist.github.com/YOU/`**`GIST_ID`**

### 3. Create a token (once)

https://github.com/settings/tokens → **Tokens (classic)** → enable **`gist`** only.  
The token string is shown **once** — save it. The same PAT can be reused on the Western sister project.

### 4. Secrets and Variables on **your fork**

**Settings → Secrets and variables → Actions**

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

### 5. Run the Action

1. On **your fork**: **Actions** → enable workflows if prompted  
2. **Update Asian Zodiac Gist** → **Run workflow**  
3. [Pin the Gist on your profile](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile)

Also runs on every push to `main` and daily at 00:00 UTC.

### Pin vs SVG

| Feature | Your fork’s Action? | Vercel? |
|---------|---------------------|---------|
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
