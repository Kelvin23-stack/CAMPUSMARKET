/* =========================================================
   CampusMarket — animations.js
   IntersectionObserver-driven scroll reveals + count-up utility.
   ========================================================= */

function cmInitScrollReveal() {
  const targets = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el, i) => {
    el.style.setProperty("--i", el.dataset.i || (i % 6));
    observer.observe(el);
  });
}

/* Animate a number counting up. Call once the element is in view. */
function cmCountUp(el, target, duration = 1100, suffix = "") {
  const start = performance.now();
  function step(ts) {
    const p = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* Trigger cmCountUp on elements with [data-count-target] once visible */
function cmInitCountUps() {
  const els = document.querySelectorAll("[data-count-target]");
  if (!els.length) return;
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => cmCountUp(el, Number(el.dataset.countTarget), 1100, el.dataset.countSuffix || ""));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          cmCountUp(el, Number(el.dataset.countTarget), 1100, el.dataset.countSuffix || "");
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  cmInitScrollReveal();
  cmInitCountUps();
});
