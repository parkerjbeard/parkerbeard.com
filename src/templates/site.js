"use strict";

const SITE = {
  name: "Parker Beard",
  url: "https://parkerbeard.com",
  title: "Parker Beard - Essays on Technology, Freedom, and Humanity",
  description:
    "Parker Beard writes essays against the illusions of the modern world, exploring what it means to live courageously, build meaningfully, and reclaim humanity's highest purpose.",
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(date) {
  const parsed = new Date(`${date}T00:00:00Z`);
  return `${parsed.getUTCDate()} ${parsed.toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  })} ${parsed.getUTCFullYear()}`;
}

function themeInitScript() {
  return `<script>
    (function () {
      try {
        var root = document.documentElement;
        if (localStorage.getItem("darkMode") === null) {
          localStorage.setItem("darkMode", "enabled");
        }
        if (localStorage.getItem("darkMode") === "enabled") {
          root.classList.add("dark-mode");
        }
        root.classList.add("js-loaded");
      } catch (e) {
        document.documentElement.classList.add("js-loaded");
      }
    })();
  </script>`;
}

function head({ title, description, url, image, type = "website" }) {
  const fullTitle = escapeHtml(title);
  const fullDescription = escapeHtml(description);
  const fullUrl = escapeHtml(url);
  const fullImage = escapeHtml(image);

  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullTitle}</title>
  <meta name="title" content="${fullTitle}" />
  <meta name="description" content="${fullDescription}" />
  <meta name="author" content="Parker Beard" />
  <meta property="og:type" content="${escapeHtml(type)}" />
  <meta property="og:url" content="${fullUrl}" />
  <meta property="og:title" content="${fullTitle}" />
  <meta property="og:description" content="${fullDescription}" />
  <meta property="og:image" content="${fullImage}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${fullUrl}" />
  <meta name="twitter:title" content="${fullTitle}" />
  <meta name="twitter:description" content="${fullDescription}" />
  <meta name="twitter:image" content="${fullImage}" />
  <meta name="robots" content="index, follow" />
  <meta name="language" content="English" />
  <link rel="canonical" href="${fullUrl}" />
  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
  <link rel="stylesheet" href="styles.css?v=20260507-2" />
  <link rel="preload" href="fonts/Newsreader.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="fonts/Newsreader-italic.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="icon" type="image/x-icon" href="favicon.ico" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />
  ${themeInitScript()}
</head>`;
}

function header() {
  return `<header class="site-header">
  <div class="site-header__inner">
    <p class="site-title"><a class="site-title__link" href="./">Parker Beard</a></p>
    <button class="theme-toggle" type="button" aria-label="Toggle dark mode" aria-pressed="false">
      <span class="theme-toggle__track" aria-hidden="true">
        <span class="theme-toggle__thumb"></span>
      </span>
    </button>
  </div>
</header>`;
}

function document({ bodyClass, title, description, url, image, scripts = [], body }) {
  const scriptTags = scripts
    .map((script) => `  <script src="${escapeHtml(script)}" defer></script>`)
    .join("\n");

  return `<!doctype html>
<html lang="en" class="preload">
${head({ title, description, url, image })}
<body class="site-page ${bodyClass}">
${body}
  <script src="theme.js" defer></script>
${scriptTags ? `${scriptTags}\n` : ""}</body>
</html>
`;
}

function homepage({ essays }) {
  const visibleEssays = essays
    .filter((essay) => essay.homepage)
    .sort((a, b) => b.date.localeCompare(a.date));

  const essayItems = visibleEssays
    .map((essay) => {
      const latest = essay.latest ? ` <span class="essay-list__latest">Latest</span>` : "";
      return `<article class="essay-list__item">
        <h3 class="essay-list__title"><a href="${escapeHtml(essay.slug)}.html">${escapeHtml(essay.title)}</a>${latest}</h3>
        <p class="essay-list__meta">${formatDate(essay.date)} · ${essay.readingTime} min read</p>
        <p class="essay-list__excerpt">${escapeHtml(essay.excerpt)}</p>
      </article>`;
    })
    .join("\n");

  const body = `${header()}
<main class="home-main">
  <div class="home-layout">
    <section class="home-section home-essays" aria-labelledby="essays-heading">
      <div class="section-heading">
        <h2 id="essays-heading" class="section-heading__title">Essays</h2>
        <button id="randomEssayBtn" class="random-essay-button" type="button" title="Random Essay" aria-label="Open a random essay">⚄</button>
      </div>
      <div class="essay-list">
${essayItems}
      </div>
    </section>
    <aside class="home-sidebar" aria-label="About Parker Beard">
      <section class="home-section">
        <h2 class="sidebar-heading">About</h2>
        <p>Parker Beard writes essays against the illusions of the modern world, exploring what it means to live courageously, build meaningfully, and resurrect the untamed spirit of American greatness.</p>
        <p>He is currently working at Rainmaker as a Forward Deployed Engineer. All opinions are his own.</p>
        <p id="age-counter" class="age-counter"></p>
      </section>
      <section class="home-section">
        <h2 class="sidebar-heading">Links</h2>
        <ul class="link-list">
          <li><a href="https://github.com/parkerjbeard" target="_blank" rel="noopener noreferrer">Github</a></li>
        </ul>
      </section>
    </aside>
  </div>
</main>
`;

  return document({
    bodyClass: "home-page",
    title: SITE.title,
    description: SITE.description,
    url: `${SITE.url}/`,
    image: `${SITE.url}/images/index-card.png`,
    scripts: ["homepage.js"],
    body,
  });
}

function essayPage({ essay }) {
  const body = `${header()}
<main class="essay-main">
  <article class="prose" data-slug="${escapeHtml(essay.slug)}">
    <h1 class="essay-title">${escapeHtml(essay.title)}</h1>
    <p class="essay-subtitle">${escapeHtml(essay.subtitle)}</p>
    <p class="author-date"><time datetime="${escapeHtml(essay.date)}">${formatDate(essay.date)}</time> • <span class="read-time">${essay.readingTime} min read</span></p>
${essay.html}
  </article>
</main>
`;

  return document({
    bodyClass: "essay-page",
    title: essay.title,
    description: essay.description,
    url: `${SITE.url}/${essay.slug}.html`,
    image: `${SITE.url}/images/${essay.card}`,
    scripts: essay.hasFootnotes ? ["footnotes.js"] : [],
    body,
  });
}

module.exports = {
  SITE,
  essayPage,
  formatDate,
  homepage,
};
