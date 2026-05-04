# Personal Website

A personal essay website built on the foundation of [Dario Amodei's website](https://darioamodei.com/), with additional features and customizations. Emphasizes readability, minimalist design, and zero dependencies.

## Features

- Dark mode with system preference detection and persistence
- Auto-generating table of contents with scroll tracking
- Smart footnotes system with hover previews
- Precomputed reading times for homepage essay links
- Random essay selector
- Live age counter with precision display
- Responsive design for all devices
- Print-friendly styling
- Zero dependencies - pure HTML, CSS, and vanilla JavaScript

## Maintenance

After editing essay content, update homepage reading times:

```sh
node update-reading-times.js
```

Before publishing, validate local links and required assets:

```sh
node validate-site.js
```
