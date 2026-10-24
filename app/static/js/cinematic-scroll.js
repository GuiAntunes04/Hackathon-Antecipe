/** @type {import("lenis").default | null} */
let lenis = null;

/** @type {IntersectionObserver | null} */
let revealObserver = null;

/** Considera “topo” enquanto scroll ≤ este valor (px). */
const PORTAL_HEADER_TOP_EPS = 1;

/** Esmaecer / reaparecer (ms) — igual ao CSS do header, independente do Lenis/cinematic. */
const PORTAL_HEADER_FADE_MS = 380;

/** @type {boolean} */
let headerIsAside = false;

/** @type {ReturnType<typeof setTimeout> | null} */
let headerFadeTimeout = null;

/** @type {boolean | null} */
let headerFadeTarget = null;

/** Rolagem do header de resultados (ocultar ↓ / mostrar ↑). */
const RESULTS_HEADER_TOP_EPS = 16;
const RESULTS_HEADER_HIDE_ACC = 28;
const RESULTS_HEADER_SHOW_ACC = 16;

/** @type {number} */
let resultsHeaderLastScrollY = 0;

/** @type {number} */
let resultsHeaderDownAcc = 0;

/** @type {number} */
let resultsHeaderUpAcc = 0;

/** @type {boolean} */
let resultsHeaderIsHidden = false;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getScrollY() {
  if (lenis && typeof lenis.scroll === "number") {
    return lenis.scroll;
  }
  return window.scrollY || document.documentElement.scrollTop || 0;
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
 * Observa elementos `.cinematic-reveal` dentro de `root` (header fica de fora).
 * @param {ParentNode} [root]
 */
export function observeCinematic(root = document) {
  if (!revealObserver) return;
  root.querySelectorAll(".cinematic-reveal:not([data-cinematic-seen])").forEach((el) => {
    if (el.classList.contains("hidden")) return;
    if (el.closest(".portal-header")) return;
    revealObserver.observe(el);
  });
}

export function cinematicRefresh() {
  observeCinematic(document);
  lenis?.resize();
  const y = getScrollY();
  syncPortalHeaderAside(y);
  syncResultsHeaderOnScroll(y);
}

/** Garante header de resultados visível (ex.: ao entrar na tela). */
export function resetResultsHeaderScroll() {
  const header = document.querySelector(".portal-results-header");
  header?.classList.remove("portal-results-header--hidden");
  resultsHeaderIsHidden = false;
  resultsHeaderDownAcc = 0;
  resultsHeaderUpAcc = 0;
  resultsHeaderLastScrollY = getScrollY();
}

/**
 * Rola a página até o topo do conteúdo (abas / upload).
 * @param {HTMLElement | null | undefined} anchor
 */
export function scrollToPortalAnchor(anchor) {
  const el = anchor || document.querySelector(".portal-main-wrap");
  if (!el) return;
  const offset = 72;
  const top = el.getBoundingClientRect().top + getScrollY() - offset;
  const y = Math.max(0, top);
  if (lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(y, { immediate: false });
  } else {
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

/** @param {boolean} active */
export function setSmoothScrollActive(active) {
  if (!lenis) return;
  if (active) {
    lenis.start();
  } else {
    lenis.stop();
  }
}

function cancelHeaderFade() {
  if (headerFadeTimeout != null) {
    clearTimeout(headerFadeTimeout);
    headerFadeTimeout = null;
  }
  headerFadeTarget = null;
}

/**
 * @param {boolean} aside
 */
function applyHeaderAsideInstant(aside) {
  const header = document.querySelector(".portal-header");
  if (!header) return;
  header.classList.remove("portal-header--leaving");
  header.classList.toggle("portal-header--aside", aside);
  headerIsAside = aside;
  cancelHeaderFade();
}

/**
 * Esmaece → troca layout → reaparece. Rolagem oposta interrompe e reinicia.
 * @param {boolean} wantAside
 */
function transitionHeaderAside(wantAside) {
  const header = document.querySelector(".portal-header");
  if (!header) return;

  if (prefersReducedMotion()) {
    cancelHeaderFade();
    applyHeaderAsideInstant(wantAside);
    return;
  }

  const leaving = header.classList.contains("portal-header--leaving");
  if (wantAside === headerIsAside && !leaving) return;
  if (leaving && headerFadeTarget === wantAside) return;

  cancelHeaderFade();
  headerFadeTarget = wantAside;

  if (wantAside === headerIsAside) {
    header.classList.remove("portal-header--leaving");
    void header.offsetWidth;
    header.classList.add("portal-header--leaving");
    headerFadeTimeout = window.setTimeout(() => {
      header.classList.remove("portal-header--leaving");
      headerFadeTimeout = null;
      headerFadeTarget = null;
    }, PORTAL_HEADER_FADE_MS);
    return;
  }

  header.classList.remove("portal-header--leaving");
  void header.offsetWidth;
  header.classList.add("portal-header--leaving");

  headerFadeTimeout = window.setTimeout(() => {
    applyHeaderAsideInstant(wantAside);
  }, PORTAL_HEADER_FADE_MS);
}

/** @param {number} scrollY */
function syncPortalHeaderAside(scrollY) {
  transitionHeaderAside(scrollY > PORTAL_HEADER_TOP_EPS);
}

/** @param {number} scrollY */
function syncResultsHeaderOnScroll(scrollY) {
  const header = document.querySelector(".portal-results-header");
  if (!header) return;

  if (!document.body.classList.contains("portal-screen-results")) {
    header.classList.remove("portal-results-header--hidden");
    resultsHeaderIsHidden = false;
    resultsHeaderLastScrollY = scrollY;
    return;
  }

  const delta = scrollY - resultsHeaderLastScrollY;
  resultsHeaderLastScrollY = scrollY;

  if (scrollY <= RESULTS_HEADER_TOP_EPS) {
    resultsHeaderDownAcc = 0;
    resultsHeaderUpAcc = 0;
    if (resultsHeaderIsHidden) {
      header.classList.remove("portal-results-header--hidden");
      resultsHeaderIsHidden = false;
    }
    return;
  }

  if (delta > 0) {
    resultsHeaderDownAcc += delta;
    resultsHeaderUpAcc = 0;
    if (!resultsHeaderIsHidden && resultsHeaderDownAcc >= RESULTS_HEADER_HIDE_ACC) {
      header.classList.add("portal-results-header--hidden");
      resultsHeaderIsHidden = true;
      resultsHeaderDownAcc = 0;
    }
  } else if (delta < 0) {
    resultsHeaderUpAcc += -delta;
    resultsHeaderDownAcc = 0;
    if (resultsHeaderIsHidden && resultsHeaderUpAcc >= RESULTS_HEADER_SHOW_ACC) {
      header.classList.remove("portal-results-header--hidden");
      resultsHeaderIsHidden = false;
      resultsHeaderUpAcc = 0;
    }
  }
}

/**
 * @param {number} [scrollOverride]
 */
function updateScrollProgress(scrollOverride) {
  const bar = document.querySelector(".cinematic-progress");
  const y = typeof scrollOverride === "number" ? scrollOverride : getScrollY();
  if (bar) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const prog = max > 0 ? y / max : 0;
    bar.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, prog))));
  }
  syncPortalHeaderAside(y);
  syncResultsHeaderOnScroll(y);
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

  const onScroll = () => updateScrollProgress();

  if (prefersReducedMotion()) {
    document.documentElement.classList.add("cinematic-reduced");
    document.querySelectorAll(".cinematic-reveal").forEach((el) => {
      el.classList.add("is-visible");
    });
    window.addEventListener("scroll", onScroll, { passive: true });
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
      prevent: (node) =>
        node instanceof Element && Boolean(node.closest(".notes-table-scroll")),
    });

    lenis.on("scroll", ({ scroll }) => {
      updateScrollProgress(scroll);
    });

    window.addEventListener("scroll", onScroll, { passive: true });

    function raf(time) {
      lenis?.raf(time);
      const y = getScrollY();
      syncPortalHeaderAside(y);
      syncResultsHeaderOnScroll(y);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    updateScrollProgress(getScrollY());

    if (document.documentElement.classList.contains("portal-no-scroll")) {
      lenis.stop();
    }
  } catch {
    document.documentElement.classList.add("cinematic-lenis-fallback");
    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollProgress();
  }
}
