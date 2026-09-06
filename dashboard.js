/* =========================================================
   CampusMarket — dashboard.js
   Populates the dashboard's recent + recommended listing lists.
   Stat counters use the shared [data-count-target] mechanism in
   animations.js, so no duplicate count-up code lives here.
   ========================================================= */

function cmDashListItemHTML(p) {
  return `
    <a class="dash-list-item" href="product.html?id=${p.id}">
      <div class="dash-list-thumb">${CM.icon(CM.categoryIcon(p.category), 16, { strokeWidth: 1.5 })}</div>
      <div class="dash-list-info">
        <p>${p.title}</p>
        <span>${p.campus} &middot; ₦${p.price.toLocaleString()}</span>
      </div>
    </a>`;
}

function cmInitDashboardPage() {
  const recentRoot = document.getElementById("dash-recent");
  const recoRoot = document.getElementById("dash-recommended");
  if (!recentRoot && !recoRoot) return;

  const all = CM.getAllProducts();

  if (recentRoot) {
    recentRoot.innerHTML = all.slice(0, 4).map(cmDashListItemHTML).join("") || "<p style='color:var(--muted);font-size:13px'>No listings yet.</p>";
  }
  if (recoRoot) {
    const shuffled = all.slice().sort(() => 0.5 - Math.random());
    recoRoot.innerHTML = shuffled.slice(0, 4).map(cmDashListItemHTML).join("");
  }

  // fill in numbers the count-up targets should animate toward
  const favCountEl = document.getElementById("stat-favorites");
  if (favCountEl) favCountEl.dataset.countTarget = CM.getFavorites().length;
  const listingCountEl = document.getElementById("stat-listings");
  if (listingCountEl) listingCountEl.dataset.countTarget = CM.getExtraListings().length + 6;
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "dashboard") cmInitDashboardPage();
});
