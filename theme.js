/* =========================================================
   CampusMarket — theme.js
   Dark / light theme, persisted in localStorage, consistent
   across every page. The actual <html data-theme> attribute is
   also set by a tiny inline snippet in <head> on every page
   (before CSS paints) to avoid a flash of the wrong theme —
   this file wires up the toggle button and keeps things in sync.
   ========================================================= */

const CM_THEME_KEY = "cm_theme";

function cmGetTheme() {
  return localStorage.getItem(CM_THEME_KEY) || "light";
}

function cmSetTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(CM_THEME_KEY, theme);
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.innerHTML = theme === "light" ? CM.icon("moon", 17) : CM.icon("sun", 17);
  });
}

function cmInitTheme() {
  cmSetTheme(cmGetTheme());
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      cmSetTheme(cmGetTheme() === "light" ? "dark" : "light");
    });
  });
}

document.addEventListener("DOMContentLoaded", cmInitTheme);
