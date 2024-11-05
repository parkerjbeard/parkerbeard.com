"use strict";

let manuallySelectedHeader = null;
let isOpen = true; // Set the initial state to open

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function scrollToElementWithPadding(element, padding = 120) {
  const headerHeight = document.querySelector("header").offsetHeight;
  const targetPosition = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo(0, targetPosition - headerHeight - padding);
}

function highlightTarget(targetId) {
  const target = document.getElementById(targetId);
  if (target) {
    scrollToElementWithPadding(target, targetId.startsWith("fn") ? 80 : 120);
    if (
      targetId.startsWith("fn") ||
      target.classList.contains("footnote-backref")
    ) {
      const link = target.querySelector("a") || target;
      link.classList.remove("highlight-target");
      void link.offsetWidth; // Trigger reflow
      link.classList.add("highlight-target");

      // Remove the highlight class after animation
      setTimeout(() => {
        link.classList.remove("highlight-target");
      }, 5000); // 5 seconds, matching the CSS animation duration
    }
  }
}

let headers = [];

function updateActiveTocItem() {
  const tocList = document.getElementById("tocList");
  let activeHeader = null;
  let activeHeaderTop = -Infinity;
  const isMobile = window.innerWidth <= 1076;

  // Find the header closest to the middle of the viewport
  headers.forEach((header) => {
    const headerTop = header.getBoundingClientRect().top;
    if (headerTop <= window.innerHeight / 2 && headerTop > activeHeaderTop) {
      activeHeader = header;
      activeHeaderTop = headerTop;
    }
  });

  tocList.querySelectorAll("a").forEach((link) => {
    const isActive =
      activeHeader && link.getAttribute("href") === `#${activeHeader.id}`;
    link.classList.toggle("active", isActive);
    if (!isMobile) {
      link.style.opacity = isActive ? 1 : 0.5;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const tocList = document.getElementById("tocList");
  const contentContainer = document.querySelector(".content-container");
  headers = contentContainer
    ? Array.from(contentContainer.querySelectorAll("h2:not(.footnotes h2)"))
    : [];
  const tocToggle = document.getElementById("tocToggle");
  const backToTop = document.getElementById("back-to-top");
  const header = document.querySelector("header");
  const headerControls = header.querySelector(".header-controls");

  const MOBILE_BREAKPOINT = 1076;

  if (tocList && headers.length > 0) {
    function updateLayout() {
      // Always ensure the tocToggle is in the headerControls
      if (!headerControls.contains(tocToggle)) {
        headerControls.appendChild(tocToggle);
      }

      // Set initial state based on screen size
      isOpen = window.innerWidth >= MOBILE_BREAKPOINT;
      updateTocVisibility();
    }

    function toggleToc() {
      isOpen = !isOpen;
      updateTocVisibility();
    }

    function updateTocVisibility() {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        document.body.classList.toggle("toc-visible", isOpen);
      } else {
        document.body.classList.toggle("toc-hidden", !isOpen);
      }

      // Update SVG based on open/closed state
      if (isOpen) {
        tocToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
      } else {
        tocToggle.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        `;
      }
    }

    function generateId(text) {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Add click event listener
    tocToggle.addEventListener("click", toggleToc);

    window.addEventListener(
      "resize",
      debounce(() => {
        updateLayout();
        updateActiveTocItem();
      }, 100),
    );

    // Clear existing TOC entries
    tocList.innerHTML = "";

    // Generate table of contents
    headers.forEach((header) => {
      const li = document.createElement("li");
      const a = document.createElement("a");

      if (!header.id) {
        header.id = generateId(header.textContent);
      }

      a.href = "#" + header.id;
      a.textContent = header.textContent;
      a.className = "h2";
      li.appendChild(a);
      tocList.appendChild(li);
    });

    let ticking = false;

    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateActiveTocItem();
          ticking = false;
        });

        ticking = true;
      }
    });

    tocList.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        e.preventDefault();
        const targetId = e.target.getAttribute("href").slice(1);

        if (e.target.textContent.toLowerCase() === "overview") {
          window.scrollTo({ top: 0 });
          history.pushState(null, null, window.location.pathname);
          manuallySelectedHeader = null;
        } else {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            scrollToElementWithPadding(targetElement);
            history.pushState(null, null, `#${targetId}`);
            manuallySelectedHeader = targetElement;

            updateActiveTocItem();

            setTimeout(() => {
              manuallySelectedHeader = null;
            }, 5000);
          }
        }

        if (window.innerWidth <= MOBILE_BREAKPOINT) {
          toggleToc();
        }
      }
    });

    // Initial setup
    updateLayout();
    updateActiveTocItem();
    updateTocVisibility();
  }

  if (backToTop) {
    backToTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0 });
    });
  }

  document.addEventListener("click", function (e) {
    if (
      e.target.tagName === "A" &&
      (e.target.getAttribute("href").startsWith("#fn") ||
        e.target.classList.contains("footnote-backref"))
    ) {
      e.preventDefault();
      const targetId = e.target.getAttribute("href").slice(1);
      highlightTarget(targetId);
      // Remove hash from URL for both inline footnotes and backrefs
      history.pushState(null, null, window.location.pathname);
    }
  });

  if (window.location.hash) {
    const targetId = window.location.hash.slice(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      setTimeout(() => {
        if (
          targetId.startsWith("fn") ||
          targetElement.classList.contains("footnote-backref")
        ) {
          highlightTarget(targetId);
        } else {
          scrollToElementWithPadding(targetElement);
        }
      }, 100);
    }
  }

  // Add js-loaded class
  requestAnimationFrame(() => {
    document.documentElement.classList.add("js-loaded");
  });
});
