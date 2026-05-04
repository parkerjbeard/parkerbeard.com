"use strict";

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const MarkdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");
const { essayPage, homepage, SITE } = require("../src/templates/site");

const ROOT = path.resolve(__dirname, "..");
const ESSAY_DIR = path.join(ROOT, "src/content/essays");
const WORDS_PER_MINUTE = 225;

const md = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: false,
}).use(markdownItFootnote);

md.renderer.rules.footnote_ref = (tokens, idx, options, env, slf) => {
  const id = tokens[idx].meta.label || slf.rules.footnote_caption(tokens, idx, options, env, slf);
  return `<sup id="fnref:${id}"><a class="footnote-ref" href="#fn:${id}">${id}</a></sup>`;
};

md.renderer.rules.footnote_block_open = () =>
  `<section class="footnotes">\n<h3>Footnotes</h3>\n<ol class="footnotes-list">\n`;
md.renderer.rules.footnote_block_close = () => `</ol>\n</section>\n`;
md.renderer.rules.footnote_open = (tokens, idx, options, env, slf) => {
  const id = tokens[idx].meta.label || slf.rules.footnote_caption(tokens, idx, options, env, slf);
  return `<li id="fn:${id}" class="footnote-item">\n`;
};
md.renderer.rules.footnote_anchor = (tokens, idx, options, env, slf) => {
  const id = tokens[idx].meta.label || slf.rules.footnote_caption(tokens, idx, options, env, slf);
  return ` <a href="#fnref:${id}" class="footnote-backref">↩</a>`;
};

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(ROOT, file), content);
}

function stripForWordCount(markdown) {
  return markdown
    .replace(/^---[\s\S]*?---/, " ")
    .replace(/\[\^[^\]]+\]:.*$/gm, " ")
    .replace(/\[\^[^\]]+\]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`~\[\]()]/g, " ");
}

function readingTime(markdown) {
  const words = stripForWordCount(markdown)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function loadEssays() {
  return fs
    .readdirSync(ESSAY_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const source = read(path.join(ESSAY_DIR, file));
      const parsed = matter(source);
      const essay = {
        ...parsed.data,
        source: parsed.content,
        html: md.render(parsed.content).trim(),
        readingTime: readingTime(parsed.content),
        hasFootnotes: /\[\^[^\]]+\]/.test(parsed.content),
      };
      return essay;
    })
    .filter((essay) => essay.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function buildSitemap(essays) {
  const urls = [
    {
      loc: `${SITE.url}/`,
      lastmod: essays[0]?.date || "2025-08-06",
      changefreq: "weekly",
      priority: "1.0",
    },
    ...essays.map((essay) => ({
      loc: `${SITE.url}/${essay.slug}.html`,
      lastmod: essay.date,
      changefreq: "monthly",
      priority: "0.8",
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `    <url>
        <loc>${url.loc}</loc>
        <lastmod>${url.lastmod}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`,
  )
  .join("\n")}
</urlset>`;
}

function copyAsset(source, target) {
  fs.copyFileSync(path.join(ROOT, source), path.join(ROOT, target));
}

function build() {
  const essays = loadEssays();

  write("index.html", homepage({ essays }));
  for (const essay of essays) {
    write(`${essay.slug}.html`, essayPage({ essay }));
  }
  write("sitemap.xml", buildSitemap(essays));

  copyAsset("src/styles.css", "styles.css");
  copyAsset("src/scripts/theme.js", "theme.js");
  copyAsset("src/scripts/homepage.js", "homepage.js");
  copyAsset("src/scripts/footnotes.js", "footnotes.js");

  console.log(`Built ${essays.length} essays and homepage.`);
}

build();
