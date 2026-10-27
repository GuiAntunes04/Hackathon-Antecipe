/** Montagem da aba Notas e helpers do #table-root. */
export function htmlTabNotas() {
  return `
    <div class="dashboard-view dashboard-view--notes dashboard-carousel__slide dashboard-carousel__slide--table" id="dashboard-panel-2" role="tabpanel" aria-labelledby="dashboard-tab-2" tabindex="0">
      <div id="dashboard-table-mount" class="dashboard-table-mount"></div>
    </div>`;
}

/** @param {HTMLElement} container */
/** Garante `#table-root` no DOM (evita perda ao limpar o dashboard na home). */
export function garantirTableRootNoPainel() {
  const panel = document.getElementById("results-panel");
  if (!panel) return null;

  let tableEl = document.getElementById("table-root");
  if (!tableEl) {
    tableEl = document.createElement("div");
    tableEl.id = "table-root";
    tableEl.className = "panel panel--full-bleed-mobile hidden";
    tableEl.hidden = true;
    panel.appendChild(tableEl);
  } else if (!panel.contains(tableEl)) {
    panel.appendChild(tableEl);
  }
  return tableEl;
}

/** @param {HTMLElement} dashboardContainer */
export function guardarTableRootForaDoDashboard(dashboardContainer) {
  const tableEl = garantirTableRootNoPainel();
  if (!tableEl || !dashboardContainer.contains(tableEl)) return;
  const panel = document.getElementById("results-panel");
  if (panel) panel.appendChild(tableEl);
}

export function montarTabelaNoDashboard(container) {
  const mount = container.querySelector("#dashboard-table-mount");
  const tableEl = garantirTableRootNoPainel();
  if (!mount || !tableEl) return;
  tableEl.classList.remove("hidden");
  tableEl.removeAttribute("hidden");
  mount.appendChild(tableEl);
}
