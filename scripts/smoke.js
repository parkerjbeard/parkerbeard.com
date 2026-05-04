"use strict";

const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "test-results");
const PORT = 8776;

function findChrome() {
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/local/bin/chromium",
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    throw new Error("Chrome/Chromium not found for smoke screenshots");
  }

  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], {
    cwd: ROOT,
    stdio: "ignore",
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    const cases = [
      ["home-desktop", "/", "900,500"],
      ["home-mobile", "/", "390,780"],
      ["visible-essay", "/patriotic-for-what.html", "900,700"],
      ["hidden-essay", "/against-the-university.html", "900,700"],
    ];

    for (const [name, route, size] of cases) {
      const screenshot = path.join(OUT, `${name}.png`);
      const profile = path.join(OUT, `${name}-profile`);
      const result = spawnSync(
        chrome,
        [
          "--headless=new",
          "--disable-gpu",
          "--disable-background-networking",
          "--disable-extensions",
          "--hide-scrollbars",
          "--no-default-browser-check",
          "--no-first-run",
          "--run-all-compositor-stages-before-draw",
          `--window-size=${size}`,
          `--user-data-dir=${profile}`,
          `--screenshot=${screenshot}`,
          `http://127.0.0.1:${PORT}${route}`,
        ],
        { stdio: "pipe", timeout: 15000, killSignal: "SIGKILL" },
      );

      const screenshotExists = fs.existsSync(screenshot);
      if (result.status !== 0 && !(result.error && result.error.code === "ETIMEDOUT" && screenshotExists)) {
        throw new Error(`${name}: Chrome failed: ${result.stderr.toString()}`);
      }
      const stats = fs.statSync(screenshot);
      if (stats.size < 1000) {
        throw new Error(`${name}: screenshot looks empty`);
      }
    }
  } finally {
    server.kill("SIGTERM");
  }

  console.log("Browser smoke screenshots passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
