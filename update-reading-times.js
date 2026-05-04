"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const WORDS_PER_MINUTE = 225;

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(ROOT, file), content);
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ");
}

function readingTimeFor(file) {
  const html = read(file);
  const article = html.match(/<article\b[\s\S]*?<\/article>/i);
  if (!article) {
    throw new Error(`${file} does not contain an article`);
  }

  const words = stripTags(article[0])
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function updateIndex() {
  let index = read("index.html");

  index = index.replace(
    /(<div class="essay-item">[\s\S]*?<a href="([^"]+\.html)">[\s\S]*?<span class="essay-date">)([^<]*?)(\s*·\s*)(?:\d+|\[READING TIME\])\s+min read(<\/span>)/g,
    (match, prefix, href, dateText, separator, suffix) => {
      const minutes = readingTimeFor(href);
      return `${prefix}${dateText.trim()} · ${minutes} min read${suffix}`;
    },
  );

  write("index.html", index);
}

updateIndex();
console.log("Updated homepage reading times.");
