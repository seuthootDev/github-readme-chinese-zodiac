import { fetchGitHubProfile } from "../src/lib/github.js";
import { resolveZodiac } from "../src/lib/zodiac.js";
import { calculateStats } from "../src/lib/stats.js";
import { renderGistCard, gistFilename } from "../src/gist/render.js";

async function githubFetch(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "github-readme-chinese-zodiac",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    const err = new Error(data?.message || `GitHub API ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function resolveUsername(token, explicit) {
  if (explicit) return explicit;
  const me = await githubFetch("/user", { token });
  return me.login;
}

async function updateGist({ token, gistId, content, filename }) {
  const gist = await githubFetch(`/gists/${gistId}`, { token });
  const files = gist.files || {};
  const existingName = Object.keys(files)[0];

  // Keep a single file; rename it so the pin title matches the sign
  const payload = {
    files: {
      [existingName || filename]: {
        filename,
        content,
      },
    },
  };

  // If renaming, drop any extra files so the pin stays clean
  for (const name of Object.keys(files)) {
    if (name !== existingName && name !== filename) {
      payload.files[name] = null;
    }
  }

  await githubFetch(`/gists/${gistId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

// Action inputs arrive as INPUT_<NAME>; plain env vars keep local runs working.
function setting(input, ...envNames) {
  for (const key of [`INPUT_${input.toUpperCase()}`, ...envNames]) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

async function main() {
  const token = setting("gh_token", "GH_TOKEN", "GITHUB_TOKEN");
  const gistId = setting("gist_id", "GIST_ID");

  if (!token) {
    console.error("Missing GH_TOKEN (needs gist scope)");
    process.exit(1);
  }
  if (!gistId) {
    console.error("Missing GIST_ID");
    process.exit(1);
  }

  // Prefer GH_TOKEN for gist writes; also use it for higher rate limits when fetching
  process.env.GITHUB_TOKEN = token;

  // Prefer ZODIAC_USERNAME — bare USERNAME is the Windows login name locally.
  const username = await resolveUsername(
    token,
    setting("username", "ZODIAC_USERNAME", "GH_USER"),
  );
  const birthdate = setting("birthdate", "BIRTHDATE");
  const sign = setting("sign", "SIGN");
  const name = setting("name", "NAME");
  const role = setting("role", "ROLE");

  console.log(`Building zodiac gist for @${username}…`);

  const profile = await fetchGitHubProfile(username);
  if (name) profile.name = name;
  if (role) profile.role = role;

  const { zodiac, source } = resolveZodiac({
    username: profile.username,
    birthdate,
    sign,
  });
  const stats = calculateStats(profile);
  const content = renderGistCard({ profile, zodiac, stats });
  const filename = gistFilename(zodiac);

  await updateGist({ token, gistId, content, filename });

  console.log(`Updated gist ${gistId}`);
  console.log(`Sign: ${zodiac.symbol} ${zodiac.sign} (${source})`);
  console.log("---");
  console.log(content);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
