/* =========================================================
   CampusMarket — listing.js
   Powers create-listing.html: live preview card, drag-and-drop
   image upload area, validation, and publishing to localStorage.
   ========================================================= */

function cmInitListingPage() {
  const form = document.getElementById("listing-form");
  if (!form) return;

  if (!CM.requireAuth("Log in to start selling")) return;

  const titleInput = document.getElementById("l-title");
  const categorySelect = document.getElementById("l-category");
  const priceInput = document.getElementById("l-price");
  const conditionSelect = document.getElementById("l-condition");
  const campusSelect = document.getElementById("l-campus");
  const descInput = document.getElementById("l-desc");
  const errorEl = document.getElementById("l-error");
  const dropzone = document.getElementById("l-dropzone");
  const fileInput = document.getElementById("l-file-input");
  const previewRow = document.getElementById("l-image-preview-row");

  const preview = {
    title: document.getElementById("p-title"),
    sub: document.getElementById("p-sub"),
    price: document.getElementById("p-price"),
    icon: document.getElementById("p-icon"),
    tag: document.getElementById("p-tag"),
  };

  let uploadedImages = [];

  // populate category + campus selects from shared data
  categorySelect.innerHTML = CM_CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
  campusSelect.innerHTML = CM_CAMPUSES.map((c) => `<option value="${c}">${c}</option>`).join("");

  function updatePreview() {
    preview.title.textContent = titleInput.value || "Your listing title";
    preview.sub.textContent = `${campusSelect.value} \u00b7 ${conditionSelect.value}`;
    preview.price.textContent = `₦${priceInput.value ? Number(priceInput.value).toLocaleString() : "0"}`;
    preview.icon.innerHTML = CM.icon(CM.categoryIcon(categorySelect.value), 30, { strokeWidth: 1.4 });
  }
  [titleInput, categorySelect, priceInput, conditionSelect, campusSelect].forEach((el) => {
    el.addEventListener("input", updatePreview);
    el.addEventListener("change", updatePreview);
  });
  updatePreview();

  // ---- image dropzone ----
  function renderImagePreviews() {
    previewRow.innerHTML = uploadedImages
      .map((src, i) => `
        <div class="image-preview-item">
          <img src="${src}" alt="Upload preview">
          <button type="button" data-remove-img="${i}">${CM.icon("x", 11)}</button>
        </div>`)
      .join("");
  }
  previewRow.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove-img]");
    if (!btn) return;
    uploadedImages.splice(Number(btn.dataset.removeImg), 1);
    renderImagePreviews();
  });

  function handleFiles(fileList) {
    Array.from(fileList).slice(0, 5 - uploadedImages.length).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImages.push(e.target.result);
        renderImagePreviews();
      };
      reader.readAsDataURL(file);
    });
  }

  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => handleFiles(e.target.files));
  ["dragenter", "dragover"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add("drag-over"); })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove("drag-over"); })
  );
  dropzone.addEventListener("drop", (e) => handleFiles(e.dataTransfer.files));

  // ---- publish / save draft ----
  function publish() {
    errorEl.textContent = "";
    if (!titleInput.value.trim() || !priceInput.value) {
      errorEl.textContent = "Add a title and a price before publishing.";
      return;
    }
    CM.publishListing({
      title: titleInput.value.trim(),
      category: categorySelect.value,
      price: Number(priceInput.value),
      condition: conditionSelect.value,
      campus: campusSelect.value,
      seller: "You",
      desc: descInput.value.trim() || "No description provided.",
    });
    CM.toast("Listing published successfully!", "check");
    document.body.classList.add("is-leaving");
    setTimeout(() => { window.location.href = "marketplace.html"; }, 500);
  }

  document.getElementById("l-publish").addEventListener("click", (e) => { e.preventDefault(); publish(); });
  document.getElementById("l-save-draft").addEventListener("click", (e) => {
    e.preventDefault();
    CM.toast("Draft saved", "check");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "create-listing") cmInitListingPage();
});
