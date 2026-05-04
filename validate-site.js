"use strict";

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = __dirname;
const ESSAY_DIR = path.join(ROOT, "src/content/essays");
const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function existsSitePath(value) {
  const clean = value
    .replace(/^https:\/\/parkerbeard\.com\//, "")
    .replace(/^\//, "")
    .split("#")[0]
    .split("?")[0];
  if (!clean || clean === ".") return true;
  return fs.existsSync(path.join(ROOT, clean));
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

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

const essayFiles = fs
  .readdirSync(ESSAY_DIR)
  .filter((file) => file.endsWith(".md"))
  .sort();

const slugs = new Set();
for (const file of essayFiles) {
  const parsed = matter(read(path.join("src/content/essays", file)));
  const data = parsed.data;
  for (const field of [
    "title",
    "slug",
    "subtitle",
    "date",
    "description",
    "excerpt",
    "published",
    "homepage",
    "latest",
    "tags",
    "card",
  ]) {
    check(Object.prototype.hasOwnProperty.call(data, field), `${file}: missing ${field}`);
  }

  check(!slugs.has(data.slug), `${file}: duplicate slug ${data.slug}`);
  slugs.add(data.slug);
  check(/^\d{4}-\d{2}-\d{2}$/.test(data.date || ""), `${file}: invalid date`);
  check(Array.isArray(data.tags), `${file}: tags must be an array`);
  check(existsSitePath(`images/${data.card}`), `${file}: missing card image ${data.card}`);
  check(parsed.content.trim().length > 0, `${file}: missing body content`);
}

const htmlFiles = fs
  .readdirSync(ROOT)
  .filter((file) => file.endsWith(".html"))
  .sort();

for (const file of htmlFiles) {
  const html = read(file);
  check(!html.includes("yourdomain.com"), `${file}: contains yourdomain.com placeholder`);

  const attrs = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)].map((match) => match[1]);
  for (const attr of attrs) {
    if (!localUrl(attr)) continue;
    if (attr.includes("${") || attr.includes("<!--")) continue;
    check(existsSitePath(attr), `${file}: missing local reference ${attr}`);
  }

  const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImage) check(existsSitePath(ogImage[1]), `${file}: missing og:image ${ogImage[1]}`);

  const twitterImage = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
  if (twitterImage) {
    check(existsSitePath(twitterImage[1]), `${file}: missing twitter:image ${twitterImage[1]}`);
  }

  if (file === "index.html") {
    check(html.includes('class="site-page home-page"'), `${file}: missing home page classes`);
    check(html.includes('class="home-layout"'), `${file}: missing home layout`);
  } else if (slugs.has(file.replace(/\.html$/, ""))) {
    check(html.includes('class="site-page essay-page"'), `${file}: missing essay page classes`);
    check(html.includes('class="prose"'), `${file}: missing prose class`);
  }

  if (file === "index.html" || slugs.has(file.replace(/\.html$/, ""))) {
    check(html.includes('class="site-header"'), `${file}: missing site header`);
    check(html.includes('class="theme-toggle"'), `${file}: missing theme toggle`);
  }
}

for (const file of [
  "fonts/Newsreader.woff2",
  "fonts/Newsreader-italic.woff2",
  "favicon.ico",
  "apple-touch-icon.png",
  "styles.css",
  "theme.js",
]) {
  check(fs.existsSync(path.join(ROOT, file)), `missing ${file}`);
}

const css = read("styles.css");
const bannedSelectorPatterns = [
  /(^|})\s*header\b/,
  /(^|})\s*h[1-6]\b/,
  /\.toggle-/,
];
for (const pattern of bannedSelectorPatterns) {
  check(!pattern.test(css), `styles.css: banned unscoped selector ${pattern}`);
}

if (errors.length > 0) {
  console.error("Site validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Site validation passed (${essayFiles.length} source essays, ${htmlFiles.length} HTML files).`);
