# Personal Website

A personal essay website built on a small static generator. The source lives in `src/`, and the generated root HTML/CSS/JS remains committed for simple static hosting.

## Features

- Dark mode with system preference detection and persistence
- Smart footnotes system with hover previews
- Build-time reading time calculation
- Random essay selector
- Live age counter with precision display
- Responsive design for all devices
- Print-friendly styling
- Plain static output with minimal build-time dependencies

## Maintenance

After editing essay Markdown, templates, scripts, or CSS:

```sh
npm run build
```

Before publishing:

```sh
npm run check
```
