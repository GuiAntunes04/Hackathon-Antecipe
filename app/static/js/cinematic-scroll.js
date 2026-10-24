/** @type {import("lenis").default | null} */
let lenis = null;

/** @type {IntersectionObserver | null} */
let revealObserver = null;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function onReveal(entries) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("is-visible");
    entry.target.setAttribute("data-cinematic-seen", "");
    revealObserver?.unobserve(entry.target);
  }
}

/**
 * Observa elementos `.cinematic-reveal` dentro de `root`.
 * @param {ParentNode} [root]
 */
export function observeCinematic(root = document) {
  if (!revealObserver) return;
  root.querySelectorAll(".cinematic-reveal:not([data-cinematic-seen])").forEach((el) => {
    if (el.classList.contains("hidden")) return;
    revealObserver.observe(el);
  });
}

export function cinematicRefresh() {
  observeCinematic(document);
  lenis?.resize();
}

/**
 * Inicializa scroll suave e entradas cinematográficas das seções.
 */
export async function initCinematicScroll() {
  revealObserver = new IntersectionObserver(onReveal, {
    threshold: 0.12,
    rootMargin: "0px 0px -6% 0px",
  });

  document.querySelectorAll(".cinematic-reveal--immediate").forEach((el) => {
    el.classList.add("is-visible");
    el.setAttribute("data-cinematic-seen", "");
  });

  observeCinematic(document);

  if (prefersReducedMotion()) {
    document.documentElement.classList.add("cinematic-reduced");
    document.querySelectorAll(".cinematic-reveal").forEach((el) => {
      el.classList.add("is-visible");
    });
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();
    return;
  }

  try {
    const { default: Lenis } = await import(
      "https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.mjs"
    );
    document.documentElement.classList.add("lenis");

    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.2,
    });

    lenis.on("scroll", updateScrollProgress);

    function raf(time) {
      lenis?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    updateScrollProgress();
  } catch {
    document.documentElement.classList.add("cinematic-lenis-fallback");
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();
  }
}

function updateScrollProgress() {
  const bar = document.querySelector(".cinematic-progress");
  if (!bar) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  bar.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, p))));
}
