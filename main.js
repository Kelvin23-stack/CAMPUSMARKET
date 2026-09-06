/* =========================================================
   CampusMarket — main.js
   Shared utilities: icon set, toasts, favorites, navbar/footer
   behaviour, page transitions. Loaded on every page.
   ========================================================= */

const CM_ICON_PATHS = {
  laptop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>',
  smartphone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  shirt: '<path d="M8 3l4 2 4-2 4 4-3 3v10H7V10L4 7z"/>',
  book: '<path d="M4 5c3-2 6-2 8 0v14c-2-2-5-2-8 0z"/><path d="M20 5c-3-2-6-2-8 0v14c2-2 5-2 8 0z"/>',
  utensils: '<path d="M6 2v8M4 2v6a2 2 0 004 0V2M6 12v10"/><path d="M18 2c-2 0-3 2-3 5v3h3M18 10v12"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  backpack: '<path d="M6 8a6 6 0 0112 0v10a2 2 0 01-2 2H8a2 2 0 01-2-2z"/><path d="M9 8V6a3 3 0 016 0v2"/><path d="M9 12h6M9 16h6"/>',
  wrench: '<path d="M14 7a4 4 0 10-5.66 5.66L4 17v3h3l4.34-4.34A4 4 0 1014 7z"/>',
  package: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>',
  heart: '<path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.5 5.5 4 2-2.5 3.5-4 5.5-4 3.5 0 6 3.5 4 7.5C19 16.65 12 21 12 21z"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  mappin: '<path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrowright: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  messagecircle: '<path d="M21 11.5a8.38 8.38 0 01-1.9 5.4A8.5 8.5 0 013 20l1-4a8.38 8.38 0 01-1-4A8.5 8.5 0 0112 3a8.5 8.5 0 019 8.5z"/>',
  star: '<path d="M12 2l3 6.5 7 .9-5 5 1.3 7-6.3-3.4L5.7 21.4 7 14.4l-5-5 7-.9z"/>',
  users: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
  shoppingbag: '<path d="M6 2l-2 5v13a2 2 0 002 2h12a2 2 0 002-2V7l-2-5z"/><path d="M4 7h16"/><path d="M9 11a3 3 0 006 0"/>',
  trendingup: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.7L7 22l5-3 5 3-1.2-8.3"/>',
  dollarsign: '<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
  twitter: '<path d="M23 4.9c-.8.4-1.7.6-2.6.8a4.5 4.5 0 002-2.5c-.9.5-1.9.9-2.9 1.1a4.5 4.5 0 00-7.7 4.1A12.8 12.8 0 012 3.6a4.5 4.5 0 001.4 6 4.4 4.4 0 01-2-.6v.1a4.5 4.5 0 003.6 4.4 4.5 4.5 0 01-2 .1 4.5 4.5 0 004.2 3.1A9 9 0 012 19a12.7 12.7 0 006.9 2c8.3 0 12.8-6.9 12.8-12.8v-.6c.9-.6 1.6-1.4 2.3-2.3z"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.5" cy="6.5" r="1"/>',
  facebook: '<path d="M15 3h-2a5 5 0 00-5 5v2H6v4h2v7h4v-7h3l1-4h-4V8a1 1 0 011-1h3z"/>',
  chevronright: '<path d="M9 18l6-6-6-6"/>',
  chevrondown: '<path d="M6 9l6 6 6-6"/>',
  chevronleft: '<path d="M15 18l-6-6 6-6"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  upload: '<path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  bell: '<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>',
  send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  camera: '<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h3.5l2-3h7l2 3H21a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>',
  footprints: '<path d="M4 16c1 0 2-1 2-3s-1-3-2-3-2 1-2 3 1 3 2 3z"/><path d="M20 8c1 0 2 1 2 3s-1 3-2 3-2-1-2-3 1-3 2-3z"/>',
  tag: '<path d="M20.6 12.9L12.9 20.6a2 2 0 01-2.8 0l-8-8a2 2 0 010-2.8L9.8 2 20.6 3.4z"/><circle cx="15" cy="8" r="1.5"/>',
  headphones: '<path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>',
};

const CM = {
  icon(name, size = 18, opts = {}) {
    const stroke = opts.strokeWidth || 1.8;
    const fill = opts.fill || "none";
    const path = CM_ICON_PATHS[name] || "";
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  },

  categoryIcon(catId) {
    const cat = CM_CATEGORIES.find((c) => c.id === catId) || CM_CATEGORIES[9];
    return cat.icon;
  },

  /* ---------------- auth (demo — persisted in localStorage) ---------------- */
  isLoggedIn() {
    return localStorage.getItem("cm_logged_in") === "true";
  },
  setLoggedIn(value, role) {
    localStorage.setItem("cm_logged_in", value ? "true" : "false");
    if (role) localStorage.setItem("cm_role", role);
  },
  getRole() {
    return localStorage.getItem("cm_role") || "buy";
  },
  logOut() {
    localStorage.setItem("cm_logged_in", "false");
    CM.toast("Signed out", "check");
  },
  /* Gate an action behind login. Returns true if already logged in.
     Otherwise shows a toast, redirects to login.html, and returns false —
     callers should stop what they were doing when this returns false. */
  requireAuth(message = "Log in to continue") {
    if (CM.isLoggedIn()) return true;
    CM.toast(message, "check");
    const dest = "login.html?redirect=" + encodeURIComponent(window.location.pathname.split("/").pop());
    setTimeout(() => { window.location.href = dest; }, 700);
    return false;
  },

  /* ---------------- favorites (persisted) ---------------- */
  getFavorites() {
    try { return JSON.parse(localStorage.getItem("cm_favorites") || "[]"); }
    catch (e) { return []; }
  },
  isFavorited(id) { return CM.getFavorites().includes(id); },
  toggleFavorite(id) {
    let favs = CM.getFavorites();
    const already = favs.includes(id);
    favs = already ? favs.filter((f) => f !== id) : [...favs, id];
    localStorage.setItem("cm_favorites", JSON.stringify(favs));
    CM.updateFavBadge();
    CM.toast(already ? "Removed from favorites" : "Added to favorites", "heart");
    return !already;
  },
  updateFavBadge() {
    const count = CM.getFavorites().length;
    document.querySelectorAll("[data-fav-badge]").forEach((el) => {
      if (count > 0) { el.textContent = count; el.style.display = "flex"; }
      else { el.style.display = "none"; }
    });
  },

  /* ---------------- listings (seed + user-published) ---------------- */
  getExtraListings() {
    try { return JSON.parse(localStorage.getItem("cm_listings") || "[]"); }
    catch (e) { return []; }
  },
  getAllProducts() {
    return [...CM.getExtraListings(), ...CM_SEED_PRODUCTS];
  },
  getProductById(id) {
    return CM.getAllProducts().find((p) => String(p.id) === String(id));
  },
  publishListing(listing) {
    const extra = CM.getExtraListings();
    const nextId = "u" + Date.now();
    const full = { id: nextId, favorited: false, posted: "just now", tag: "Just listed", ...listing };
    extra.unshift(full);
    localStorage.setItem("cm_listings", JSON.stringify(extra));
    return full;
  },

  /* ---------------- toast ---------------- */
  toast(message, icon = "check") {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `${CM.icon(icon, 15)}<span></span>`;
    el.querySelector("span").textContent = message;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-visible"));
    setTimeout(() => {
      el.classList.remove("is-visible");
      setTimeout(() => el.remove(), 260);
    }, 2400);
  },

  initials(name) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  },
};

/* ---------------- generic reusable modal ---------------- */
function cmEscHandler(e) { if (e.key === "Escape") CM.closeModal(); }

CM.openModal = function (innerHtml) {
  let backdrop = document.querySelector(".modal-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) CM.closeModal(); });
  }
  backdrop.innerHTML = `<div class="modal">${innerHtml}</div>`;
  const closeBtn = backdrop.querySelector(".modal-close");
  if (closeBtn) closeBtn.addEventListener("click", CM.closeModal);
  requestAnimationFrame(() => backdrop.classList.add("is-open"));
  document.addEventListener("keydown", cmEscHandler);
};

CM.closeModal = function () {
  const backdrop = document.querySelector(".modal-backdrop");
  if (!backdrop) return;
  backdrop.classList.remove("is-open");
  document.removeEventListener("keydown", cmEscHandler);
};

/* ---------------- fill static [data-icon] placeholders ---------------- */
function cmRenderIcons() {
  document.querySelectorAll("[data-icon]").forEach((el) => {
    const name = el.dataset.icon;
    const size = Number(el.dataset.iconSize) || 18;
    const fill = el.dataset.iconFill || "none";
    el.innerHTML = CM.icon(name, size, { fill });
  });
}

/* ---------------- navbar scroll effect ---------------- */
function cmInitNavbarScroll() {
  const nav = document.querySelector(".navbar");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------------- mobile menu ---------------- */
function cmInitMobileMenu() {
  const btn = document.querySelector(".mobile-menu-btn");
  const links = document.querySelector(".nav-links");
  if (!btn || !links) return;
  btn.addEventListener("click", () => {
    const open = links.classList.toggle("is-open-mobile");
    links.style.cssText = open
      ? "display:flex;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:var(--surface-solid);border-bottom:1px solid var(--border);padding:8px 24px 16px;"
      : "";
  });
}

/* ---------------- reflect logged-out state in the nav; gate account pages ---------------- */
const CM_ACCOUNT_PAGES = ["profile", "dashboard"];

function cmApplyAuthUI() {
  const loggedIn = CM.isLoggedIn();
  document.querySelectorAll('.nav-right a[href="profile.html"]').forEach((a) => {
    if (!loggedIn) a.setAttribute("href", "login.html");
  });
  if (!loggedIn && CM_ACCOUNT_PAGES.includes(document.body.dataset.page)) {
    CM.requireAuth("Log in to view your account");
  }
}

/* ---------------- notifications dropdown ---------------- */
function cmInitNotifDropdown() {
  const btn = document.getElementById("notif-btn");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const existing = document.getElementById("notif-panel");
    if (existing) { existing.remove(); return; }
    const panel = document.createElement("div");
    panel.id = "notif-panel";
    panel.className = "glass";
    panel.style.cssText = "position:absolute;top:54px;right:0;width:270px;border-radius:14px;padding:6px;box-shadow:var(--shadow-md);z-index:50;animation:scaleIn 180ms var(--ease);";
    panel.innerHTML = [
      ["New message from Priya S.", "2m ago"],
      ["Your listing was favorited", "1h ago"],
      ["Meal plan swap sold", "5h ago"],
    ].map(([t, ts]) => `<div style="padding:10px;border-bottom:1px solid var(--border);font-size:13px"><p style="margin:0 0 2px;font-weight:600">${t}</p><span style="font-size:11px;color:var(--muted)">${ts}</span></div>`).join("");
    document.querySelector(".nav-right").appendChild(panel);
    setTimeout(() => {
      document.addEventListener("click", function onDocClick(ev) {
        if (!panel.contains(ev.target) && ev.target !== btn) {
          panel.remove();
          document.removeEventListener("click", onDocClick);
        }
      });
    }, 0);
  });
}

/* ---------------- highlight active nav links ---------------- */
function cmInitActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.classList.toggle("is-active", a.dataset.nav === page);
  });
}

/* ---------------- favorite buttons (event delegation, requires login) ---------------- */
function cmInitFavButtons() {
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fav-toggle]");
    if (!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!CM.requireAuth("Log in to save listings")) return;
    const id = btn.dataset.favToggle;
    const isFav = CM.toggleFavorite(isNaN(id) ? id : Number(id));
    btn.classList.toggle("is-fav", isFav);
    btn.innerHTML = CM.icon("heart", 14, { fill: isFav ? "currentColor" : "none" });
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");
    document.querySelectorAll(`[data-fav-toggle="${id}"]`).forEach((other) => {
      other.classList.toggle("is-fav", isFav);
      other.innerHTML = CM.icon("heart", 14, { fill: isFav ? "currentColor" : "none" });
    });
  });
}

/* ---------------- gentle page transitions between real HTML pages ---------------- */
const CM_GATED_PAGES = ["create-listing.html"];

function cmInitPageTransitions() {
  document.body.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.target === "_blank" || a.hasAttribute("download")) return;
    if (href.startsWith("http") || href.startsWith("mailto:")) return;
    const path = href.split("?")[0].split("#")[0];
    if (CM_GATED_PAGES.includes(path)) {
      e.preventDefault();
      if (!CM.requireAuth("Log in to start selling")) return;
      document.body.classList.add("is-leaving");
      setTimeout(() => { window.location.href = href; }, 200);
      return;
    }
    e.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(() => { window.location.href = href; }, 200);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cmRenderIcons();
  cmInitNavbarScroll();
  cmInitMobileMenu();
  cmInitActiveNav();
  cmInitFavButtons();
  cmInitPageTransitions();
  cmInitNotifDropdown();
  cmApplyAuthUI();
  CM.updateFavBadge();
});
