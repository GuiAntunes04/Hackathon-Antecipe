import {
  cinematicRefresh,
  initCinematicScroll,
  observeCinematic,
  resetResultsHeaderScroll,
  scrollToPortalAnchor,
  setSmoothScrollActive,
} from "./cinematic-scroll.js";
import { postValidar } from "./api/validacao.js";
import { mountUploadPanel } from "./components/upload-panel.js";
import { createNotesTableController } from "./components/notes-table-controller.js?v=20261024k";
import {
  renderDashboardResumo,
  resetDashboardSlide,
  vincularComboboxSacadoDashboard,
} from "./components/dashboard-resumo.js";
import { mountLangSwitcher } from "./components/lang-switcher.js";
import { applyDocumentLocale, onLocaleChange, t } from "./i18n.js";
import { filtrarNotasPorSacado } from "./lib/notas-filtro.js";
import { showToast } from "./lib/toast.js";

const statusEl = document.getElementById("status");
const portalHome = document.getElementById("portal-home");
const portalResults = document.getElementById("portal-results");
const uploadRoot = document.getElementById("upload-root");
const dashboardRoot = document.getElementById("dashboard-root");
const btnNovoLote = document.getElementById("btn-novo-lote");
const langSwitcherRoot = document.getElementById("lang-switcher-root");
const portalHomeTitle = document.getElementById("portal-home-title");
const portalResultsTitle = document.getElementById("portal-results-title");

const PORTAL_FADE_MS = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ? 0
  : 1040;

/** @type {boolean} */
let portalScreenTransitionLock = false;

function waitPortalFade() {
  return new Promise((resolve) => setTimeout(resolve, PORTAL_FADE_MS));
}

function syncScreenA11y() {
  const onHome = document.body.classList.contains("portal-screen-home");
  portalHome?.setAttribute("aria-hidden", onHome ? "false" : "true");
  portalResults?.setAttribute("aria-hidden", onHome ? "true" : "false");
}

/** @type {{ jobId: string | null, resumo: object | null, totalAReceber: number | null, notasCompletas: object[], sacadosFiltrados: string[], statusKind: string | null }} */
const loteAtual = {
  jobId: null,
  resumo: null,
  totalAReceber: null,
  notasCompletas: [],
  sacadosFiltrados: [],
  statusKind: null,
};

/** @type {ReturnType<typeof createNotesTableController> | null} */
let tabelaNotas = null;

const STATUS_VARIANTS = {
  secondary:
    "rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700",
  success:
    "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800",
  danger: "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800",
};

const STATUS_VARIANTS_ON_HOME = {
  secondary: "rounded-lg border border-slate-200 px-4 py-3 text-sm",
  success: "rounded-lg border border-emerald-200 px-4 py-3 text-sm",
  danger: "rounded-lg border border-red-200 px-4 py-3 text-sm",
};

function lockHomeScroll() {
  document.documentElement.classList.add("portal-no-scroll");
  document.body.classList.add("portal-no-scroll");
  setSmoothScrollActive(false);
  window.scrollTo(0, 0);
}

function unlockResultsScroll() {
  document.documentElement.classList.remove("portal-no-scroll");
  document.body.classList.remove("portal-no-scroll");
  setSmoothScrollActive(true);
  requestAnimationFrame(() => {
    cinematicRefresh();
    window.scrollTo(0, 0);
  });
}

function rotularTitulos() {
  const title = t("app.title");
  document.title = title;
  if (portalHomeTitle) portalHomeTitle.textContent = title;
  if (portalResultsTitle) portalResultsTitle.textContent = title;
  if (btnNovoLote) btnNovoLote.textContent = t("upload.newBatch");
}

/**
 * @param {string} message
 * @param {string} [variant]
 * @param {string | null} [kind]
 */
function setStatus(message, variant = "", kind = null) {
  loteAtual.statusKind = kind;
  if (!statusEl) return;
  statusEl.textContent = message;
  if (!message) {
    statusEl.className = "portal-home__status empty:hidden";
    return;
  }
  const onHome = document.body.classList.contains("portal-screen-home");
  const palette = onHome ? STATUS_VARIANTS_ON_HOME : STATUS_VARIANTS;
  const styles = palette[variant] || palette.secondary;
  statusEl.className = `portal-home__status ${styles}`;
}

function refreshStatusMessage() {
  if (loteAtual.statusKind === "validating") {
    setStatus(t("status.validating"), "secondary", "validating");
  } else if (loteAtual.statusKind === "done") {
    setStatus(t("status.done"), "success", "done");
  }
}

function resetLoteState() {
  loteAtual.jobId = null;
  loteAtual.resumo = null;
  loteAtual.totalAReceber = null;
  loteAtual.notasCompletas = [];
  loteAtual.sacadosFiltrados = [];
  loteAtual.statusKind = null;
  resetDashboardSlide();
  tabelaNotas?.reset();
  tabelaNotas = null;
}

async function showHomeScreen() {
  if (portalScreenTransitionLock) return;
  portalScreenTransitionLock = true;

  document.body.classList.add("portal-screen-home");
  document.body.classList.remove("has-resultado-bar");
  document.body.classList.remove("portal-screen-results");
  document.body.classList.remove("portal-results-tab-notes");
  syncScreenA11y();
  lockHomeScroll();

  await waitPortalFade();

  resetLoteState();
  setStatus("", "");
  dashboardRoot.innerHTML = "";
  resetResultsHeaderScroll();
  portalScreenTransitionLock = false;
}

async function showResultsScreen() {
  if (portalScreenTransitionLock) return;
  portalScreenTransitionLock = true;

  document.body.classList.remove("portal-screen-home");
  document.body.classList.add("has-resultado-bar");
  document.body.classList.add("portal-screen-results");
  syncScreenA11y();
  unlockResultsScroll();

  await waitPortalFade();

  portalScreenTransitionLock = false;
  requestAnimationFrame(() => {
    resetResultsHeaderScroll();
    scrollToPortalAnchor(document.querySelector(".portal-results-header"));
    cinematicRefresh();
  });
}

/** @param {object[]} notas */
function listarSacadosUnicos(notas) {
  const set = new Set();
  for (const n of notas || []) {
    const s = String(n.nome_sacado ?? "").trim();
    if (s) set.add(s);
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/** @param {object[]} notas */
function resumoLocalDasNotas(notas) {
  let aprovadas = 0;
  let recusadas = 0;
  for (const n of notas) {
    const s = String(n.status ?? "").toLowerCase();
    if (s === "aprovada") aprovadas += 1;
    else if (s === "recusada") recusadas += 1;
  }
  return {
    total_linhas: notas.length,
    aprovadas,
    recusadas,
  };
}

function obterTableRoot() {
  return document.getElementById("table-root");
}

function obterTabelaNotas() {
  const el = obterTableRoot();
  if (!el) return null;
  if (!tabelaNotas) {
    tabelaNotas = createNotesTableController(el);
  } else {
    tabelaNotas.attach(el);
  }
  return tabelaNotas;
}

function renderizarDashboard() {
  const focusSacado =
    document.activeElement instanceof HTMLInputElement &&
    document.activeElement.id === "dashboard-busca-sacado";
  const selStart = focusSacado ? document.activeElement.selectionStart : null;
  const selEnd = focusSacado ? document.activeElement.selectionEnd : null;

  const notasDashboard = filtrarNotasPorSacado(
    loteAtual.notasCompletas,
    loteAtual.sacadosFiltrados
  );
  const sacadoAtivo = loteAtual.sacadosFiltrados.length > 0;

  if (dashboardRoot) {
    renderDashboardResumo(dashboardRoot, {
      total_a_receber: sacadoAtivo ? null : loteAtual.totalAReceber,
      resumo: sacadoAtivo ? resumoLocalDasNotas(notasDashboard) : loteAtual.resumo,
      notas: notasDashboard,
      sacadosFiltrados: loteAtual.sacadosFiltrados,
      sacadosOpcoes: listarSacadosUnicos(loteAtual.notasCompletas),
    });
  }

  obterTabelaNotas()?.attach(obterTableRoot());

  observeCinematic(portalResults || document);
  requestAnimationFrame(() => {
    cinematicRefresh();
    window.dispatchEvent(new Event("resize"));
    if (focusSacado) {
      const inp = dashboardRoot?.querySelector("#dashboard-busca-sacado");
      if (inp instanceof HTMLInputElement) {
        inp.focus();
        if (selStart != null && selEnd != null) {
          inp.setSelectionRange(selStart, selEnd);
        }
      }
    }
    if (document.body.classList.contains("portal-results-tab-notes")) {
      refreshTableLayout();
    }
  });
}

/** @param {{ carregando?: boolean, novoLote?: boolean }} [opts] */
function sincronizarResultadosLote(opts = {}) {
  if (opts.novoLote) {
    resetDashboardSlide();
    tabelaNotas?.reset();
    tabelaNotas = null;
  }
  renderizarDashboard();
  const ctrl = obterTabelaNotas();
  if (!ctrl) return;
  if (opts.carregando) ctrl.setCarregando(true);
  ctrl.applyLote(loteAtual.notasCompletas, loteAtual.sacadosFiltrados);
  if (opts.carregando) ctrl.setCarregando(false);
}

async function aplicarLoteCompleto(data) {
  loteAtual.jobId = data.job_id ?? loteAtual.jobId;
  if (data.resumo) loteAtual.resumo = data.resumo;
  if (data.total_a_receber != null) loteAtual.totalAReceber = data.total_a_receber;
  loteAtual.notasCompletas = data.notas || [];
  sincronizarResultadosLote({ novoLote: true });
  await showResultsScreen();
}

function limparSelecaoArquivo() {
  const input = document.getElementById("arquivo");
  if (input instanceof HTMLInputElement) input.value = "";
  const filenameEl = document.querySelector("[data-filename]");
  if (filenameEl instanceof HTMLElement) {
    filenameEl.textContent = "";
    filenameEl.hidden = true;
  }
}

async function onUploadSubmit(file) {
  setStatus(t("status.validating"), "secondary", "validating");

  try {
    const data = await postValidar(file);
    setStatus("", "");
    await aplicarLoteCompleto(data);
  } catch (err) {
    setStatus("", "");
    const msg =
      err instanceof Error && err.message
        ? err.message
        : t("status.errorGeneric");
    showToast(msg, { variant: "error" });
    limparSelecaoArquivo();
  }
}

function mountUpload() {
  mountUploadPanel(uploadRoot, { onSubmit: onUploadSubmit });
}

function applyDocumentLocaleExtended() {
  applyDocumentLocale();
  rotularTitulos();
}

applyDocumentLocaleExtended();
if (langSwitcherRoot) mountLangSwitcher(langSwitcherRoot);

btnNovoLote?.addEventListener("click", async () => {
  await showHomeScreen();
  mountUpload();
});

onLocaleChange(() => {
  applyDocumentLocaleExtended();
  mountUpload();
  refreshStatusMessage();
  if (loteAtual.jobId) {
    renderizarDashboard();
    obterTabelaNotas()?.refresh();
  }
});

function refreshTableLayout() {
  window.dispatchEvent(new Event("resize"));
}

dashboardRoot?.addEventListener("dashboard-slide-changed", (event) => {
  const slide = event.detail?.slide;
  if (slide === 2) {
    requestAnimationFrame(() => {
      obterTabelaNotas()?.refresh();
      refreshTableLayout();
    });
    return;
  }
  requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
});

if (dashboardRoot) {
  vincularComboboxSacadoDashboard(dashboardRoot);
  dashboardRoot.addEventListener("dashboard-sacados-changed", (event) => {
    const sacados = event.detail?.sacados;
    if (!Array.isArray(sacados)) return;
    loteAtual.sacadosFiltrados = sacados
      .map((s) => String(s).trim())
      .filter(Boolean);
    renderizarDashboard();
    obterTabelaNotas()?.applySacadosGlobais(loteAtual.sacadosFiltrados);
  });
}

syncScreenA11y();
lockHomeScroll();
initCinematicScroll().then(() => lockHomeScroll());

mountUpload();
