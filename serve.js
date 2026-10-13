const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const root = __dirname;
const port = Number(process.env.PORT) || 4173;
const groups = new Set([
  "phan-anh-dnc",
  "kho-du-lieu",
  // "hau-kiem", // tạm ẩn
  "phan-anh-tin-nhan-cuoc-goi-rac",
]);

function readEnv(name, fallback) {
  try {
    const env = fs.readFileSync(path.join(root, ".env"), "utf8");
    const match = env.match(
      new RegExp("^\\s*" + name + "[ \\t]*=[ \\t]*([^\\r\\n]*)$", "m"),
    );
    if (match) return match[1].trim().replace(/^["']|["']$/g, "");
  } catch (e) { }
  return process.env[name] || fallback;
}

const apiUrl = readEnv("API_URL", "http://localhost:5000");
const recaptchaSiteKey = readEnv("RECAPTCHA_SITE_KEY", "");
const recaptchaSiteKeyV3 =
  readEnv("RECAPTCHA_SITE_KEY_V3", "") ||
  readEnv("RECAPTCHA_SECRET_KEY_V3", "");
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function send(res, code, body, headers) {
  res.writeHead(code, headers);
  res.end(body);
}

function sendFile(res, file) {
  fs.readFile(file, function (err, data) {
    if (err) {
      send(res, 404, "Not found", {
        "Content-Type": "text/plain; charset=utf-8",
      });
      return;
    }
    send(res, 200, data, {
      "Content-Type":
        types[path.extname(file).toLowerCase()] || "application/octet-stream",
    });
  });
}

function inside(file) {
  const resolved = path.resolve(file);
  return resolved === root || resolved.startsWith(root + path.sep);
}

http
  .createServer(function (req, res) {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length === 1 && groups.has(parts[0])) {
      sendFile(res, path.join(root, "index.html"));
      return;
    }
    if (url.pathname === "/js/config.js") {
      send(
        res,
        200,
        "window.CGV_API_URL=" +
        JSON.stringify(apiUrl) +
        ";\nwindow.RECAPTCHA_SITE_KEY=" +
        JSON.stringify(recaptchaSiteKey) +
        ";\nwindow.RECAPTCHA_SITE_KEY_V3=" +
        JSON.stringify(recaptchaSiteKeyV3) +
        ";\n",
        { "Content-Type": "text/javascript; charset=utf-8" },
      );
      return;
    }
    let rel = decodeURIComponent(url.pathname);
    if (rel === "/") rel = "/index.html";
    const file = path.join(root, rel);
    if (!inside(file)) {
      send(res, 403, "Forbidden", {
        "Content-Type": "text/plain; charset=utf-8",
      });
      return;
    }
    fs.stat(file, function (err, stat) {
      if (!err && stat.isFile()) {
        sendFile(res, file);
        return;
      }
      if (!err && stat.isDirectory()) {
        sendFile(res, path.join(file, "index.html"));
        return;
      }
      send(res, 404, "Not found", {
        "Content-Type": "text/plain; charset=utf-8",
      });
    });
  })
  .listen(port, function () {
    console.log("http://127.0.0.1:" + port);
  });
