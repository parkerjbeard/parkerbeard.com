# Modern Blog Template

A lightweight, accessible, and feature-rich blog template focusing on readability and user experience. Built with vanilla JavaScript and CSS, emphasizing performance and simplicity. Inspired by [Dario Amodei's personal website](https://darioamodei.com/).

## Features

- Smooth dark mode with system preference detection and persistence
- Auto-generating table of contents with scroll tracking
- Smart footnotes system with bi-directional linking
- Fully responsive design optimized for all devices
- Dark/light mode color scheme with smooth transitions
- Newsletter subscription form with Google Forms integration
- Print-optimized styling
- WCAG-compliant accessibility
- Zero-dependency front-end

## Technical Stack

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)

## Project Structure

```
├── index.html
├── styles.css
├── js/
│   ├── darkmode.js
│   ├── toc.js
│   ├── footnotes.js
│   └── subscribe.js
├── content/
│   └── processed/
│       └── example.html
├── fonts/
│   └── [Your chosen font files]
├── images/
│   ├── favicon.svg
│   ├── favicon-32x32.png
│   └── apple-touch-icon.png
└── privacy.html
```

## Getting Started


### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/parkerjbeard/blog-template.git
   cd blog-template
   ```

2. Add your font files to the `fonts/` directory

3. Update the Google Forms endpoint in `js/subscribe.js`

### Usage

Create new pages by copying and modifying the HTML structure from `index.html`. The template includes all necessary JavaScript functionality for dark mode, table of contents, and footnotes.

## Customization

### Colors

The template uses CSS custom properties for theming. Modify the root variables in `styles.css`:

```css
:root {
  --bg-color: #FFFFFF;
  --text-color: #141413;
}

:root.dark-mode {
  --bg-color: #141413;
  --text-color: #f0efea;
}
```

### Typography

1. Add your chosen font files to the `fonts/` directory
2. Update font-face declarations in `styles.css`
3. Modify typography variables as needed

## Features Implementation

### Dark Mode
- System preference detection
- Local storage persistence
- Smooth transitions
- Toggle switch functionality

### Table of Contents
- Dynamic generation from headings
- Scroll position tracking
- Mobile-responsive behavior
- Accessibility support

### Footnotes
- Bi-directional linking
- Smooth scrolling
- Optional tooltip previews
- Back-to-text navigation

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Design inspired by [Dario Amodei's personal website](https://darioamodei.com/)
- Built with performance and user experience in mind
- Designed for content creators and developers

## Contact

Parker Beard - [@parkerjbeard](https://twitter.com/parkerjbeard)

Project Link: [https://github.com/parkerjbeard/blog-template](https://github.com/parkerjbeard/blog-template)
