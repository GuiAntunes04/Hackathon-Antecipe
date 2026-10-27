/** Navegação entre abas: carrossel horizontal; no mobile, arraste com underline acompanhando. */

export const DASHBOARD_TAB_COUNT = 3;

const DESKTOP_CAROUSEL_MQ = "(min-width: 768px)";
const MOBILE_CAROUSEL_MQ = "(max-width: 767.98px)";

/** Índice da aba ativa — sobrevive ao `innerHTML` do dashboard. */
let dashboardTabPersistido = 0;

/** @type {WeakMap<HTMLElement, number>} */
const tabIndexByRoot = new WeakMap();

/** @type {WeakMap<HTMLElement, () => void>} */
const mediaListenersByRoot = new WeakMap();

/** @param {HTMLElement} [dashboardRoot] */
export function resetDashboardSlide(dashboardRoot) {
  dashboardTabPersistido = 0;
  if (dashboardRoot) tabIndexByRoot.delete(dashboardRoot);
}

/** @param {HTMLElement} container */
function obterTrack(container) {
  return container.querySelector(".dashboard-carousel__track");
}

/** @param {HTMLElement} container */
export function capturarTabAtualDashboard(container) {
  if (tabIndexByRoot.has(container)) {
    return tabIndexByRoot.get(container) ?? 0;
  }
  const track = obterTrack(container);
  if (track?.dataset.slide != null) {
    const n = Number(track.dataset.slide);
    if (Number.isFinite(n)) return n;
  }
  if (track?.dataset.activeTab != null) {
    const n = Number(track.dataset.activeTab);
    if (Number.isFinite(n)) return n;
  }
  const tabAtiva = container.querySelector(".dashboard-tabs__btn--active");
  if (tabAtiva?.dataset.slide != null) {
    const n = Number(tabAtiva.dataset.slide);
    if (Number.isFinite(n)) return n;
  }
  return dashboardTabPersistido;
}

/**
 * @param {HTMLElement} container
 * @param {number} slideProgress índice fracionário (0 … tabCount-1)
 */
function syncIndicadorAbasDashboardProgress(container, slideProgress) {
  const bar = container.querySelector(".dashboard-tabs");
  const indicator = bar?.querySelector(".dashboard-tabs__indicator");
  const tabs = bar ? [...bar.querySelectorAll(".dashboard-tabs__btn")] : [];
  if (!bar || !indicator || tabs.length === 0) return;

  const max = tabs.length - 1;
  const p = Math.max(0, Math.min(max, slideProgress));
  const i0 = Math.floor(p);
  const i1 = Math.min(max, i0 + 1);
  const t = i1 === i0 ? 0 : p - i0;

  const barRect = bar.getBoundingClientRect();
  const r0 = tabs[i0].getBoundingClientRect();
  const r1 = tabs[i1].getBoundingClientRect();
  const left = (r0.left - barRect.left) * (1 - t) + (r1.left - barRect.left) * t;
  const width = r0.width * (1 - t) + r1.width * t;

  indicator.style.width = `${width}px`;
  indicator.style.transform = `translate3d(${left}px, 0, 0)`;
}

/** @param {HTMLElement} container */
function syncIndicadorAbasDashboard(container) {
  const idx = tabIndexByRoot.get(container) ?? capturarTabAtualDashboard(container);
  syncIndicadorAbasDashboardProgress(container, idx);
}

function carrosselUsaOffsetPx() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_CAROUSEL_MQ).matches;
}

/**
 * @param {HTMLElement} container
 * @param {HTMLElement} track
 * @param {number} slideProgress
 */
function sincronizarLarguraTrilhoMobile(container, track) {
  const viewport = container.querySelector(".dashboard-carousel__viewport");
  if (!viewport) return;
  if (!carrosselUsaOffsetPx()) {
    track.style.width = "";
    track.style.removeProperty("--dashboard-carousel-slide-w");
    return;
  }
  const w = viewport.clientWidth || viewport.getBoundingClientRect().width;
  if (w <= 0) return;
  track.style.setProperty("--dashboard-carousel-slide-w", `${w}px`);
  track.style.width = `${w * DASHBOARD_TAB_COUNT}px`;
}

function aplicarTransformCarrossel(container, track, slideProgress) {
  const viewport = container.querySelector(".dashboard-carousel__viewport");
  if (carrosselUsaOffsetPx() && viewport) {
    sincronizarLarguraTrilhoMobile(container, track);
    const w = viewport.clientWidth || viewport.getBoundingClientRect().width;
    if (w > 0) {
      track.style.transform = `translate3d(-${slideProgress * w}px, 0, 0)`;
      return;
    }
  }
  sincronizarLarguraTrilhoMobile(container, track);
  const offsetPct = (100 / DASHBOARD_TAB_COUNT) * slideProgress;
  track.style.transform = `translate3d(-${offsetPct}%, 0, 0)`;
}

/** @param {HTMLElement} container @param {HTMLElement} track @param {number} alvo */
function aplicarModoCarrossel(container, track, alvo) {
  aplicarTransformCarrossel(container, track, alvo);
  track.querySelectorAll(".dashboard-view").forEach((panel, idx) => {
    panel.hidden = false;
    panel.removeAttribute("hidden");
    panel.setAttribute("aria-hidden", idx === alvo ? "false" : "true");
  });
}

/**
 * @param {HTMLElement} host
 * @param {number} slideProgress
 * @param {{ animar?: boolean }} [opts]
 */
function aplicarProgressoCarrossel(host, slideProgress, opts = {}) {
  const track = obterTrack(host);
  const viewport = host.querySelector(".dashboard-carousel__viewport");
  if (!track || !viewport) return;

  const animar = opts.animar !== false;
  const indicator = host.querySelector(".dashboard-tabs__indicator");

  track.classList.toggle("dashboard-carousel__track--dragging", !animar);
  if (indicator) {
    indicator.classList.toggle("dashboard-tabs__indicator--dragging", !animar);
  }

  if (animar) {
    track.style.transition = "";
  } else {
    track.style.transition = "none";
  }

  aplicarTransformCarrossel(host, track, slideProgress);
  syncIndicadorAbasDashboardProgress(host, slideProgress);

  track.querySelectorAll(".dashboard-view").forEach((panel) => {
    panel.hidden = false;
    panel.removeAttribute("hidden");
  });
}

/** @param {HTMLElement} container @param {number} tabIndex */
export function aplicarTabDashboard(container, tabIndex) {
  const track = obterTrack(container);
  if (!track) return;

  const alvo = Math.max(0, Math.min(DASHBOARD_TAB_COUNT - 1, tabIndex));
  dashboardTabPersistido = alvo;
  tabIndexByRoot.set(container, alvo);
  track.dataset.activeTab = String(alvo);
  track.dataset.slide = String(alvo);

  container.querySelectorAll(".dashboard-tabs__btn").forEach((btn) => {
    const idx = Number(btn.dataset.slide);
    const ativa = idx === alvo;
    btn.classList.toggle("dashboard-tabs__btn--active", ativa);
    btn.setAttribute("aria-selected", ativa ? "true" : "false");
    btn.tabIndex = ativa ? 0 : -1;
  });

  track.classList.remove("dashboard-carousel__track--dragging");
  const indicator = container.querySelector(".dashboard-tabs__indicator");
  indicator?.classList.remove("dashboard-tabs__indicator--dragging");
  track.style.transition = "";
  aplicarModoCarrossel(container, track, alvo);

  document.body.classList.toggle("portal-results-tab-notes", alvo === 2);

  requestAnimationFrame(() => {
    syncIndicadorAbasDashboard(container);
    container.dispatchEvent(
      new CustomEvent("dashboard-slide-changed", {
        bubbles: true,
        detail: { slide: alvo },
      })
    );
  });
}

/** @param {HTMLElement} host */
function vincularMediaQueryDashboard(host) {
  if (typeof window === "undefined" || mediaListenersByRoot.has(host)) return;
  const mq = window.matchMedia(DESKTOP_CAROUSEL_MQ);
  const onChange = () => {
    aplicarTabDashboard(host, tabIndexByRoot.get(host) ?? dashboardTabPersistido);
  };
  mq.addEventListener("change", onChange);
  mediaListenersByRoot.set(host, () => mq.removeEventListener("change", onChange));
}

/** @param {HTMLElement} panelRoot @param {HTMLElement} host */
function vincularCarrosselTouch(panelRoot, host) {
  if (typeof window === "undefined" || panelRoot.dataset.boundCarouselTouch === "1") return;

  const viewport = panelRoot.querySelector(".dashboard-carousel__viewport");
  if (!viewport) return;
  panelRoot.dataset.boundCarouselTouch = "1";

  const EDGE_RESISTANCE = 0.28;
  /** @type {null | "x" | "y"} */
  let axisLock = null;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startProgress = 0;
  let lastProgress = 0;

  /** @param {EventTarget | null} target */
  function alvoIgnoraArraste(target) {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest(
        ".notes-table-scroll, .notes-pagination__pages, .sacado-combobox__list, input, textarea, select, button, a"
      )
    );
  }

  viewport.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      if (alvoIgnoraArraste(e.target)) return;

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startProgress = tabIndexByRoot.get(host) ?? capturarTabAtualDashboard(host);
      lastProgress = startProgress;
      axisLock = null;
      dragging = true;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    (e) => {
      if (!dragging || e.touches.length !== 1) return;
      if (typeof window !== "undefined" && !window.matchMedia(MOBILE_CAROUSEL_MQ).matches) return;

      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      if (!axisLock) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        axisLock = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axisLock === "y") {
          dragging = false;
          return;
        }
      }
      if (axisLock !== "x") return;

      e.preventDefault();

      const w = viewport.getBoundingClientRect().width || 1;
      let next = startProgress - dx / w;
      const max = DASHBOARD_TAB_COUNT - 1;
      if (next < 0) next *= EDGE_RESISTANCE;
      else if (next > max) next = max + (next - max) * EDGE_RESISTANCE;

      lastProgress = next;
      aplicarProgressoCarrossel(host, next, { animar: false });
    },
    { passive: false }
  );

  const finalizarArraste = () => {
    if (!dragging && axisLock !== "x") {
      axisLock = null;
      return;
    }
    dragging = false;
    if (axisLock !== "x") {
      axisLock = null;
      return;
    }
    axisLock = null;

    const max = DASHBOARD_TAB_COUNT - 1;
    const snap = Math.max(0, Math.min(max, Math.round(lastProgress)));
    aplicarTabDashboard(host, snap);
  };

  viewport.addEventListener("touchend", finalizarArraste, { passive: true });
  viewport.addEventListener("touchcancel", () => {
    dragging = false;
    axisLock = null;
    aplicarTabDashboard(host, tabIndexByRoot.get(host) ?? dashboardTabPersistido);
  });
}

/** @param {HTMLElement} panelRoot */
export function vincularAbasDashboard(panelRoot) {
  const host = panelRoot.parentElement;
  if (!host || panelRoot.dataset.boundTabs === "1") return;
  panelRoot.dataset.boundTabs = "1";

  vincularMediaQueryDashboard(host);
  vincularCarrosselTouch(panelRoot, host);

  panelRoot.addEventListener("click", (e) => {
    const tab = e.target.closest(".dashboard-tabs__btn[data-slide]");
    if (!tab || !host) return;
    const alvo = Number(tab.dataset.slide);
    if (!Number.isFinite(alvo)) return;
    aplicarTabDashboard(host, alvo);
  });

  if (typeof ResizeObserver !== "undefined") {
    const bar = panelRoot.querySelector(".dashboard-tabs");
    if (bar) {
      const ro = new ResizeObserver(() => {
        if (host) syncIndicadorAbasDashboard(host);
      });
      ro.observe(bar);
      panelRoot._dashboardTabsResizeObserver = ro;
    }
    const viewport = panelRoot.querySelector(".dashboard-carousel__viewport");
    if (viewport && host) {
      const roCarousel = new ResizeObserver(() => {
        const idx = tabIndexByRoot.get(host) ?? dashboardTabPersistido;
        const track = obterTrack(host);
        if (track) aplicarTransformCarrossel(host, track, idx);
      });
      roCarousel.observe(viewport);
      panelRoot._dashboardCarouselResizeObserver = roCarousel;
    }
  }

  panelRoot.addEventListener("keydown", (e) => {
    const tab = e.target.closest(".dashboard-tabs__btn[data-slide]");
    if (!tab || !host) return;
    const atual = tabIndexByRoot.get(host) ?? 0;
    let alvo = atual;
    if (e.key === "ArrowRight") alvo = Math.min(DASHBOARD_TAB_COUNT - 1, atual + 1);
    else if (e.key === "ArrowLeft") alvo = Math.max(0, atual - 1);
    else if (e.key === "Home") alvo = 0;
    else if (e.key === "End") alvo = DASHBOARD_TAB_COUNT - 1;
    else return;
    e.preventDefault();
    aplicarTabDashboard(host, alvo);
    const nextTab = panelRoot.querySelector(`.dashboard-tabs__btn[data-slide="${alvo}"]`);
    nextTab?.focus();
  });
}
