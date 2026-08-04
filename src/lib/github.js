const GITHUB_API = "https://api.github.com";

function headers() {
  const h = {
    Accept: "application/vnd.github+json",
    "User-Agent": "github-readme-chinese-zodiac",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

/** Local preview when unauthenticated IP rate limit is hit (60/hr). */
function demoProfile(username) {
  return {
    username,
    name: username === "seuthootDev" ? "JUNG SEUNGHOON" : username,
    bio: "",
    avatarUrl: "",
    followers: 12,
    following: 8,
    publicRepos: 36,
    createdAt: "2019-04-24T00:00:00Z",
    ageDays: 2500,
    stars: 48,
    forks: 6,
    openIssues: 3,
    languages: [
      { name: "JavaScript", count: 12 },
      { name: "TypeScript", count: 8 },
      { name: "Python", count: 5 },
    ],
    role: "Full-Stack Dev",
    mostActiveRepo: null,
    _demo: true,
  };
}

async function gh(path) {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: headers() });
  if (res.status === 404) {
    const err = new Error("GitHub user not found");
    err.statusCode = 404;
    throw err;
  }
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`GitHub API error (${res.status}): ${body.slice(0, 200)}`);
    err.statusCode = res.status === 403 ? 429 : 502;
    err.githubStatus = res.status;
    err.githubBody = body;
    throw err;
  }
  return res.json();
}

function guessRole(languages) {
  const top = languages[0]?.name?.toLowerCase() ?? "";
  // Short labels — pin/SVG both clip easily with long "…Developer" strings
  const map = {
    python: "Backend Dev",
    go: "Backend Dev",
    rust: "Systems Dev",
    java: "Backend Dev",
    kotlin: "Mobile Dev",
    swift: "Mobile Dev",
    typescript: "Full-Stack Dev",
    javascript: "Full-Stack Dev",
    "c#": "Software Eng",
    "c++": "Systems Dev",
    c: "Systems Dev",
    php: "Web Dev",
    ruby: "Web Dev",
    dart: "App Dev",
    html: "Frontend Dev",
    css: "Frontend Dev",
    shell: "DevOps",
    dockerfile: "DevOps",
  };
  return map[top] || "Software Dev";
}

export async function fetchGitHubProfile(username) {
  if (process.env.DEMO_PROFILE === "1") {
    console.warn(`[github] DEMO_PROFILE=1 — using mock profile for ${username}`);
    return demoProfile(username);
  }

  let user;
  let repos;
  try {
    user = await gh(`/users/${encodeURIComponent(username)}`);
    repos = await gh(
      `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`,
    );
  } catch (err) {
    // Local server only: keep design previews working after IP rate limit.
    if (
      process.env.LOCAL_DEV === "1" &&
      (err.githubStatus === 403 || err.statusCode === 429)
    ) {
      console.warn(
        `[github] rate limited — falling back to demo profile for ${username}. Set GITHUB_TOKEN in .env for real data.`,
      );
      return demoProfile(username);
    }
    throw err;
  }

  const languageBytes = {};
  let stars = 0;
  let forks = 0;
  let openIssues = 0;

  for (const repo of repos) {
    if (repo.fork) continue;
    stars += repo.stargazers_count || 0;
    forks += repo.forks_count || 0;
    openIssues += repo.open_issues_count || 0;
    if (repo.language) {
      languageBytes[repo.language] = (languageBytes[repo.language] || 0) + 1;
    }
  }

  const languages = Object.entries(languageBytes)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  const createdAt = new Date(user.created_at);
  const ageDays = Math.max(
    1,
    Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return {
    username: user.login,
    name: user.name || user.login,
    bio: user.bio || "",
    avatarUrl: user.avatar_url,
    followers: user.followers || 0,
    following: user.following || 0,
    publicRepos: user.public_repos || 0,
    createdAt: user.created_at,
    ageDays,
    stars,
    forks,
    openIssues,
    languages,
    role: guessRole(languages),
    mostActiveRepo: repos.find((r) => !r.fork)?.name || null,
  };
}
