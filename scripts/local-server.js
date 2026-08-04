import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cardHandler from "../api/card.js";
import profileHandler from "../api/profile.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const port = Number(process.env.PORT || 3000);

function createRes(nodeRes) {
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
      nodeRes.setHeader(key, value);
    },
    status(code) {
      this.statusCode = code;
      nodeRes.statusCode = code;
      return this;
    },
    send(body) {
      nodeRes.statusCode = this.statusCode;
      nodeRes.end(body);
    },
    json(obj) {
      nodeRes.setHeader("Content-Type", "application/json");
      nodeRes.statusCode = this.statusCode;
      nodeRes.end(JSON.stringify(obj));
    },
  };
  return res;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    const html = await readFile(path.join(root, "public", "index.html"), "utf8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html);
    return;
  }

  if (url.pathname === "/api/profile") {
    await profileHandler(
      { method: req.method, url: `/api/profile${url.search}`, headers: req.headers },
      createRes(res),
    );
    return;
  }

  if (url.pathname === "/api/card" || url.pathname.startsWith("/card/")) {
    let search = url.search;
    if (url.pathname.startsWith("/card/")) {
      const username = decodeURIComponent(url.pathname.replace("/card/", ""));
      const params = new URLSearchParams(url.search);
      params.set("username", username);
      search = `?${params.toString()}`;
    }
    const fakeReq = {
      method: req.method,
      url: `/api/card${search}`,
      headers: req.headers,
    };
    await cardHandler(fakeReq, createRes(res));
    return;
  }

  res.statusCode = 404;
  res.end("Not found");
});

server.listen(port, () => {
  console.log(`github-readme-chinese-zodiac → http://localhost:${port}`);
  console.log(`Try: http://localhost:${port}/api/card?username=seuthootDev&sign=dragon`);
});
