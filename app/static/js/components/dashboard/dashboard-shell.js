/** Navegação entre abas: carrossel horizontal no desktop, painéis empilhados no mobile. */

export const DASHBOARD_TAB_COUNT = 3;

const DESKTOP_CAROUSEL_MQ = "(min-width: 768px)";

/** Índice da aba ativa — sobrevive ao `innerHTML` do dashboard. */
let dashboardTabPersistido = 0;

/** @type {WeakMap<HTMLElement, number>} */
const tabIndexByRoot = new WeakMap();

/** @type {WeakMap<HTMLElement, () => void>} */
const mediaListenersByRoot = new WeakMap();

export function resetDashboardSlide() {
  dashboardTabPersistido = 0;
}

function usaCarrosselHorizontal() {
  return typeof window !== "undefined" && window.matchMedia(DESKTOP_CAROUSEL_MQ).matches;
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

/** @param {HTMLElement} container */
function syncIndicadorAbasDashboard(container) {
  const bar = container.querySelector(".dashboard-tabs");
  const indicator = bar?.querySelector(".dashboard-tabs__indicator");
  const active = bar?.querySelector(".dashboard-tabs__btn--active");
  if (!bar || !indicator || !active) return;

  const barRect = bar.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  indicator.style.width = `${activeRect.width}px`;
  indicator.style.transform = `translate3d(${activeRect.left - barRect.left}px, 0, 0)`;
}

/** @param {HTMLElement} track @param {number} alvo */
function aplicarModoCarrossel(track, alvo) {
  const offsetPct = (100 / DASHBOARD_TAB_COUNT) * alvo;
  track.style.transform = `translate3d(-${offsetPct}%, 0, 0)`;
  track.querySelectorAll(".dashboard-view").forEach((panel, idx) => {
    panel.hidden = false;
    panel.removeAttribute("hidden");
    panel.setAttribute("aria-hidden", idx === alvo ? "false" : "true");
  });
}

/** @param {HTMLElement} track @param {number} alvo */
function aplicarModoEmpilhado(track, alvo) {
  track.style.transform = "";
  track.querySelectorAll(".dashboard-view").forEach((panel, idx) => {
    const visivel = idx === alvo;
    panel.hidden = !visivel;
    panel.setAttribute("aria-hidden", visivel ? "false" : "true");
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

  if (usaCarrosselHorizontal()) {
    aplicarModoCarrossel(track, alvo);
  } else {
    aplicarModoEmpilhado(track, alvo);
  }

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

/** @param {HTMLElement} panelRoot */
export function vincularAbasDashboard(panelRoot) {
  const host = panelRoot.parentElement;
  if (!host || panelRoot.dataset.boundTabs === "1") return;
  panelRoot.dataset.boundTabs = "1";

  vincularMediaQueryDashboard(host);

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
