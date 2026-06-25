"use strict";

const SITE = {
  name: "Parker Beard",
  url: "https://parkerjbeard.com",
  title: "Parker Beard",
  description: "Personal site of Parker Beard.",
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
  <link rel="stylesheet" href="styles.css?v=20260624-4" />
  <link rel="preload" href="fonts/Newsreader.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="fonts/Newsreader-italic.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="icon" type="image/x-icon" href="favicon.ico" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />
</head>`;
}

function header() {
  return `<header class="site-header">
  <div class="site-header__inner">
    <p class="site-title"><a class="site-title__link" href="./">Parker Beard</a></p>
  </div>
</header>`;
}

function document({ bodyClass, title, description, url, image, scripts = [], body }) {
  const scriptTags = scripts
    .map((script) => `  <script src="${escapeHtml(script)}" defer></script>`)
    .join("\n");

  return `<!doctype html>
<html lang="en">
${head({ title, description, url, image })}
<body class="site-page ${bodyClass}">
${body}
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
      const meta = essay.latest
        ? `${formatDate(essay.date)} &nbsp;·&nbsp; Latest`
        : formatDate(essay.date);
      return `        <article class="essay">
          <h2 class="essay__title"><a href="${escapeHtml(essay.slug)}.html">${escapeHtml(essay.title)}</a></h2>
          <p class="essay__meta">${meta}</p>
        </article>`;
    })
    .join("\n");

  // The homepage is a single, static, full-bleed photo hero — deliberately unlike
  // every other page. It carries its own <html>/<head>/<body> (no preload class, no
  // theme.js, no homepage.js) so the cold light hero never inherits the dark-mode
  // system used by the essay pages.
  const body = `  <div class="stage">
    <img class="stage__photo" src="images/pika-glacier-2021.jpg" alt="Three skiers breaking trail across an Alaskan glacier toward distant peaks" fetchpriority="high" />
    <div class="stage__scrim-top"></div>
    <div class="stage__scrim-bottom"></div>

    <div class="stage__inner">
      <div class="top">
        <div class="masthead">
          <h1 class="name">Parker<br>Beard</h1>
        </div>
      </div>

      <div class="about">
        <p>Forward Deployed Engineer at <a href="https://www.rainmaker.com/" target="_blank" rel="noopener noreferrer">Rainmaker</a>.<span class="about-extra"> I enjoy solo mountaineering, military history, philosophy, and writing essays on civilization and technology. All opinions are my own.</span></p>
        <p><a href="https://github.com/parkerjbeard" target="_blank" rel="noopener noreferrer">Github</a></p>
      </div>

      <p class="photo-caption">Pika Glacier, 2021</p>

      <div class="essays">
        <p class="field-label">Essays</p>
${essayItems}
      </div>
    </div>
  </div>
`;

  return `<!doctype html>
<html lang="en">
${head({
    title: SITE.title,
    description: SITE.description,
    url: `${SITE.url}/`,
    image: `${SITE.url}/images/pika-glacier-card.jpg`,
  })}
<body class="site-page home-page">
${body}</body>
</html>
`;
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
