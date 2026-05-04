"use strict";

const THEME_COLORS = {
  dark: { bg: "#141413", text: "#f0efea" },
  light: { bg: "#f0efea", text: "#141413" },
};

function applyTheme(isDarkMode) {
  document.documentElement.classList.toggle("dark-mode", isDarkMode);
  const colors = isDarkMode ? THEME_COLORS.dark : THEME_COLORS.light;
  document.documentElement.style.setProperty("--bg-color", colors.bg);
  document.documentElement.style.setProperty("--text-color", colors.text);

  const toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.setAttribute("aria-pressed", String(isDarkMode));
  }
}

function initTheme() {
  const toggle = document.querySelector(".theme-toggle");
  const savedMode = localStorage.getItem("darkMode");
  applyTheme(savedMode === "enabled");

  if (toggle) {
    toggle.addEventListener("click", () => {
      const isDarkMode = !document.documentElement.classList.contains("dark-mode");
      localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
      applyTheme(isDarkMode);
    });
  }

  window.addEventListener(
    "load",
    () => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove("preload");
        document.documentElement.classList.add("animations-enabled");
      });
    },
    { once: true },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTheme);
} else {
  initTheme();
}
