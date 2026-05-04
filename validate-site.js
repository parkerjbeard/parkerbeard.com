"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const HTML_FILES = fs
  .readdirSync(ROOT)
  .filter((file) => file.endsWith(".html") && file !== "template.html")
  .sort();

const errors = [];

function existsSitePath(value) {
  const clean = value.replace(/^https:\/\/parkerbeard\.com\//, "").replace(/^\//, "");
  return fs.existsSync(path.join(ROOT, clean));
}

function check(condition, message) {
  if (!condition) errors.push(message);
}

function localUrl(value) {
  return (
    value &&
    !value.startsWith("http://") &&
    !value.startsWith("https://") &&
    !value.startsWith("mailto:") &&
    !value.startsWith("#") &&
    !value.startsWith("data:")
  );
}

for (const file of HTML_FILES) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");

  check(!html.includes("yourdomain.com"), `${file}: contains yourdomain.com placeholder`);

  const attrs = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map((match) => match[1]);
  for (const attr of attrs) {
    if (!localUrl(attr)) continue;
    if (attr.includes("${") || attr.includes("<!--")) continue;
    const target = attr.split("#")[0].split("?")[0];
    if (!target) continue;

    if (target.endsWith(".html") || target.includes("/") || target.includes(".")) {
      check(existsSitePath(target), `${file}: missing local reference ${attr}`);
    }
  }

  const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImage) {
    check(existsSitePath(ogImage[1]), `${file}: og:image target does not exist (${ogImage[1]})`);
  }

  const twitterImage = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
  if (twitterImage) {
    check(existsSitePath(twitterImage[1]), `${file}: twitter:image target does not exist (${twitterImage[1]})`);
  }
}

check(fs.existsSync(path.join(ROOT, "fonts/Newsreader.woff2")), "missing fonts/Newsreader.woff2");
check(fs.existsSync(path.join(ROOT, "fonts/Newsreader-italic.woff2")), "missing fonts/Newsreader-italic.woff2");
check(fs.existsSync(path.join(ROOT, "favicon.ico")), "missing favicon.ico");
check(fs.existsSync(path.join(ROOT, "apple-touch-icon.png")), "missing apple-touch-icon.png");

if (errors.length > 0) {
  console.error("Site validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Site validation passed (${HTML_FILES.length} HTML files checked).`);
