/* =========================================================
   CampusMarket — marketplace.js
   Powers: marketplace.html (browse/search/filter/sort),
           product.html (detail view), favorites.html (grid)
   ========================================================= */

function cmProductCardHTML(p) {
  const fav = CM.isFavorited(p.id);
  return `
    <a class="product-card reveal-scale is-visible" href="product.html?id=${p.id}">
      <div class="card-image" style="background:var(--primary)">
        ${CM.icon(CM.categoryIcon(p.category), 30, { strokeWidth: 1.4 })}
        ${p.tag ? `<span class="tag-chip">${p.tag}</span>` : ""}
        <button class="fav-btn${fav ? " is-fav" : ""}" data-fav-toggle="${p.id}" aria-label="Save listing">
          ${CM.icon("heart", 14, { fill: fav ? "currentColor" : "none" })}
        </button>
        <span class="view-btn">View details</span>
      </div>
      <div class="card-body">
        <h3>${p.title}</h3>
        <p class="card-sub">${p.campus} &middot; ${p.condition}</p>
        <div class="card-foot">
          <span class="price">₦${p.price.toLocaleString()}</span>
          <div class="card-seller">
            <span class="avatar" style="width:20px;height:20px;font-size:9px">${CM.initials(p.seller)}</span>
            <span>${p.seller}</span>
          </div>
        </div>
      </div>
    </a>`;
}

function cmSkeletonCardHTML() {
  return `
    <div class="skeleton-card">
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-text" style="width:80%"></div>
        <div class="skeleton skeleton-text" style="width:50%"></div>
        <div class="skeleton skeleton-price"></div>
      </div>
    </div>`;
}

function cmEmptyStateHTML(title, body, showCta) {
  return `
    <div class="empty-state">
      <span class="empty-float">${CM.icon("search", 26, { strokeWidth: 1.4 })}</span>
      <h3>${title}</h3>
      <p>${body}</p>
      ${showCta ? `<a class="btn btn-primary btn-sm" style="margin-top:14px" href="marketplace.html">Explore marketplace</a>` : ""}
    </div>`;
}

/* ---------------- marketplace.html ---------------- */
function cmCuratedRowHTML(emoji, title, subtitle, products, anchor) {
  if (!products.length) return "";
  return `
    <div class="curated-section">
      <div class="curated-head">
        <div><h2>${emoji} ${title}</h2>${subtitle ? `<p style="margin:2px 0 0;font-size:12.5px;color:var(--muted)">${subtitle}</p>` : ""}</div>
        <a class="btn btn-outline btn-sm" href="${anchor}">View all</a>
      </div>
      <div class="curated-grid">${products.slice(0, 4).map(cmProductCardHTML).join("")}</div>
    </div>`;
}

function cmRenderCuratedSections() {
  const root = document.getElementById("curated-sections");
  if (!root) return;
  const all = CM.getAllProducts();
  const trending = all.filter((p) => p.tag === "Trending");
  const justListed = all.filter((p) => p.tag === "Just listed");
  const cheap = all.slice().sort((a, b) => a.price - b.price);
  const hotDeals = all.filter((p) => p.tag === "Popular" || p.tag === "Trending");

  root.innerHTML = [
    cmCuratedRowHTML("🔥", "Hot Deals", "Standout prices students are grabbing fast.", hotDeals, "#all-products"),
    cmCuratedRowHTML("📈", "Trending", "Getting the most attention on campus right now.", trending, "#all-products"),
    cmCuratedRowHTML("💰", "Cheap Finds", "Budget-friendly picks under the usual going rate.", cheap, "#all-products"),
    cmCuratedRowHTML("✨", "Recently Added", "Freshly listed by students near you.", justListed, "#all-products"),
  ].join("");
}

function cmInitMarketplacePage() {
  const grid = document.getElementById("product-grid");
  const resultCount = document.getElementById("result-count");
  const searchInput = document.getElementById("search-input");
  const searchBar = document.getElementById("search-bar");
  const conditionSelect = document.getElementById("condition-select");
  const campusSelect = document.getElementById("campus-select");
  const maxPriceInput = document.getElementById("max-price-input");
  const sortSelect = document.getElementById("sort-select");
  const chipRow = document.getElementById("chip-row");
  if (!grid) return;

  cmRenderCuratedSections();

  if (campusSelect) {
    campusSelect.insertAdjacentHTML("beforeend", CM_CAMPUSES.map((c) => `<option>${c}</option>`).join(""));
  }

  const params = new URLSearchParams(window.location.search);
  const state = {
    query: params.get("q") || "",
    category: params.get("category") || "all",
    campus: "all",
    condition: "all",
    maxPrice: "",
    sort: "newest",
  };
  if (searchInput) searchInput.value = state.query;

  const chipCats = [{ id: "all", name: "All" }, ...CM_CATEGORIES.slice(0, 6)];
  if (chipRow) {
    chipRow.innerHTML = chipCats
      .map((c) => `<button class="chip${state.category === c.id ? " is-active" : ""}" data-chip="${c.id}">${c.name}</button>`)
      .join("");
    chipRow.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-chip]");
      if (!btn) return;
      state.category = btn.dataset.chip;
      chipRow.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === btn));
      render();
    });
  }

  function filteredProducts() {
    let list = CM.getAllProducts().filter((p) => {
      if (state.category !== "all" && p.category !== state.category) return false;
      if (state.campus !== "all" && p.campus !== state.campus) return false;
      if (state.condition !== "all" && p.condition !== state.condition) return false;
      if (state.query && !p.title.toLowerCase().includes(state.query.toLowerCase())) return false;
      if (state.maxPrice && p.price > Number(state.maxPrice)) return false;
      return true;
    });
    if (state.sort === "low") list = list.slice().sort((a, b) => a.price - b.price);
    if (state.sort === "high") list = list.slice().sort((a, b) => b.price - a.price);
    return list;
  }

  function render() {
    const list = filteredProducts();
    if (resultCount) resultCount.textContent = `${list.length} listing${list.length !== 1 ? "s" : ""}`;
    const emptySlot = document.getElementById("empty-state-slot");
    if (list.length) {
      grid.innerHTML = list.map(cmProductCardHTML).join("");
      if (emptySlot) emptySlot.innerHTML = "";
    } else {
      grid.innerHTML = "";
      if (emptySlot) emptySlot.innerHTML = cmEmptyStateHTML(
        "No listings match your filters",
        "Try widening your search or clearing a filter.", false
      );
    }
  }

  // initial: show skeletons briefly, then render for real
  grid.innerHTML = Array.from({ length: 6 }).map(cmSkeletonCardHTML).join("");
  setTimeout(render, 450);

  if (searchInput) {
    searchInput.addEventListener("input", (e) => { state.query = e.target.value; render(); });
    searchInput.addEventListener("focus", () => searchBar && searchBar.classList.add("is-focused"));
    searchInput.addEventListener("blur", () => searchBar && searchBar.classList.remove("is-focused"));
  }
  if (conditionSelect) conditionSelect.addEventListener("change", (e) => { state.condition = e.target.value; render(); });
  if (campusSelect) campusSelect.addEventListener("change", (e) => { state.campus = e.target.value; render(); });
  if (maxPriceInput) maxPriceInput.addEventListener("input", (e) => { state.maxPrice = e.target.value; render(); });
  if (sortSelect) sortSelect.addEventListener("change", (e) => { state.sort = e.target.value; render(); });
}

/* ---------------- product.html ---------------- */
function cmInitProductPage() {
  const root = document.getElementById("product-detail");
  if (!root) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = CM.getProductById(id) || CM.getAllProducts()[0];
  if (!product) { root.innerHTML = "<p>Listing not found.</p>"; return; }

  const fav = CM.isFavorited(product.id);
  document.title = `${product.title} — CampusMarket`;

  root.innerHTML = `
    <div class="modal-grid" style="margin-bottom:20px">
      <div>
        <div class="modal-hero-image" id="pd-hero">${CM.icon(CM.categoryIcon(product.category), 48, { strokeWidth: 1.3 })}</div>
        <div class="modal-thumbs">
          ${[0, 1, 2].map(() => `<div class="modal-thumb pd-thumb">${CM.icon(CM.categoryIcon(product.category), 18, { strokeWidth: 1.4 })}</div>`).join("")}
        </div>
      </div>
      <div class="modal-info">
        <span class="condition-pill">${product.condition} &middot; ${product.posted}</span>
        <h2>${product.title}</h2>
        <div class="modal-price">₦${product.price.toLocaleString()}</div>
        <p class="modal-desc">${product.desc}</p>
        <div class="modal-row">${CM.icon("mappin", 14)}<span>${product.campus}</span></div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="pd-message">${CM.icon("messagecircle", 15)} Message seller</button>
          <button class="btn btn-outline${fav ? " is-fav" : ""}" data-fav-toggle="${product.id}" id="pd-fav">
            ${CM.icon("heart", 15, { fill: fav ? "currentColor" : "none" })} <span id="pd-fav-label">${fav ? "Saved" : "Save listing"}</span>
          </button>
          <button class="btn btn-outline" id="pd-report">Report listing</button>
        </div>
        <div class="seller-card">
          <span class="avatar" style="width:40px;height:40px;font-size:15px">${CM.initials(product.seller)}</span>
          <div>
            <p class="seller-name">${product.seller}</p>
            <p class="seller-sub">${CM.icon("star", 12, { fill: "var(--primary)", strokeWidth: 0 })} 4.8 &middot; 12 listings &middot; joined 2024</p>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById("pd-hero").addEventListener("click", () => {
    CM.openModal(`
      <button class="modal-close">${CM.icon("x", 18)}</button>
      <div class="modal-hero-image" style="height:340px">${CM.icon(CM.categoryIcon(product.category), 64, { strokeWidth: 1.2 })}</div>
      <h3 style="margin-top:14px">${product.title}</h3>`);
  });

  document.getElementById("pd-message").addEventListener("click", () => {
    if (!CM.requireAuth("Log in to message sellers")) return;
    CM.toast(`Message sent to ${product.seller}`, "check");
  });
  document.getElementById("pd-report").addEventListener("click", () => {
    CM.toast("Listing reported — our team will take a look", "check");
  });

  // keep the label in sync since data-fav-toggle listener in main.js only swaps the icon
  document.getElementById("pd-fav").addEventListener("click", () => {
    setTimeout(() => {
      const nowFav = CM.isFavorited(product.id);
      document.getElementById("pd-fav-label").textContent = nowFav ? "Saved" : "Save listing";
      document.getElementById("pd-fav").classList.toggle("is-fav", nowFav);
    }, 0);
  });

  // related listings
  const relatedRoot = document.getElementById("pd-related");
  if (relatedRoot) {
    const related = CM.getAllProducts().filter((p) => p.category === product.category && p.id != product.id).slice(0, 3);
    if (related.length) {
      relatedRoot.innerHTML = `
        <div class="related-block">
          <h4>Related listings</h4>
          <div class="related-grid">
            ${related.map((p) => `
              <a class="related-item" href="product.html?id=${p.id}">
                <div class="related-thumb">${CM.icon(CM.categoryIcon(p.category), 18, { strokeWidth: 1.4 })}</div>
                <div><p class="related-title">${p.title}</p><p class="related-price">₦${p.price.toLocaleString()}</p></div>
              </a>`).join("")}
          </div>
        </div>`;
    }
  }
}

/* ---------------- favorites.html ---------------- */
function cmInitFavoritesPage() {
  const grid = document.getElementById("favorites-grid");
  if (!grid) return;
  const favIds = CM.getFavorites();
  const favs = CM.getAllProducts().filter((p) => favIds.includes(p.id));
  const emptySlot = document.getElementById("empty-state-slot");
  if (!favs.length) {
    grid.innerHTML = "";
    if (emptySlot) emptySlot.innerHTML = `
      <div class="empty-state">
        <span class="empty-float">${CM.icon("heart", 26, { strokeWidth: 1.4 })}</span>
        <h3>No saved listings yet</h3>
        <p>Save products you're interested in and they'll appear here.</p>
        <a class="btn btn-primary btn-sm" style="margin-top:14px" href="marketplace.html">Explore marketplace</a>
      </div>`;
    return;
  }
  grid.innerHTML = favs.map(cmProductCardHTML).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "marketplace") cmInitMarketplacePage();
  if (page === "product") cmInitProductPage();
  if (page === "favorites") cmInitFavoritesPage();
});
