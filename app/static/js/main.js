import {
  cinematicRefresh,
  initCinematicScroll,
  observeCinematic,
  resetResultsHeaderScroll,
  scrollToPortalAnchor,
  setSmoothScrollActive,
} from "./cinematic-scroll.js";
import { postValidar } from "./api/validacao.js";
import { FILTRO_TODAS, TAMANHO_PAGINA, TAMANHOS_PAGINA } from "./config.js";
import { mountUploadPanel } from "./components/upload-panel.js";
import { renderNotesTable } from "./components/notes-table.js";
import { renderDashboardResumo } from "./components/dashboard-resumo.js";
import { mountLangSwitcher } from "./components/lang-switcher.js";
import { applyDocumentLocale, onLocaleChange, t } from "./i18n.js";
import { parseDataVencimentoBR, parseIsoDate } from "./lib/format.js";
import { showToast } from "./lib/toast.js";

const statusEl = document.getElementById("status");
const portalHome = document.getElementById("portal-home");
const portalResults = document.getElementById("portal-results");
const uploadRoot = document.getElementById("upload-root");
const dashboardRoot = document.getElementById("dashboard-root");
const tableRoot = document.getElementById("table-root");
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

/** @type {{ jobId: string | null, paginacao: object | null, resumo: object | null, totalAReceber: number | null, notasCompletas: object[], notasPagina: object[], tamanhoPagina: number, filtroStatus: string, buscaNota: string, dataInicio: string, dataFim: string, statusKind: string | null }} */
const loteAtual = {
  jobId: null,
  paginacao: null,
  resumo: null,
  totalAReceber: null,
  notasCompletas: [],
  notasPagina: [],
  tamanhoPagina: TAMANHO_PAGINA,
  filtroStatus: FILTRO_TODAS,
  buscaNota: "",
  dataInicio: "",
  dataFim: "",
  statusKind: null,
};

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
  loteAtual.paginacao = null;
  loteAtual.resumo = null;
  loteAtual.totalAReceber = null;
  loteAtual.notasCompletas = [];
  loteAtual.notasPagina = [];
  loteAtual.tamanhoPagina = TAMANHO_PAGINA;
  loteAtual.filtroStatus = FILTRO_TODAS;
  loteAtual.buscaNota = "";
  loteAtual.dataInicio = "";
  loteAtual.dataFim = "";
  loteAtual.statusKind = null;
}

async function showHomeScreen() {
  if (portalScreenTransitionLock) return;
  portalScreenTransitionLock = true;

  document.body.classList.add("portal-screen-home");
  document.body.classList.remove("has-resultado-bar");
  document.body.classList.remove("portal-screen-results");
  syncScreenA11y();
  lockHomeScroll();

  await waitPortalFade();

  resetLoteState();
  setStatus("", "");
  tableRoot.innerHTML = "";
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

function filtrarNotasLocal(notas, filtro) {
  if (filtro === FILTRO_TODAS) return notas;
  return notas.filter((n) => String(n.status || "").toLowerCase() === filtro);
}

function filtrarNotasComConsulta(notas, filtro, consulta) {
  let out = filtrarNotasLocal(notas, filtro);
  const q = String(consulta.buscaNota ?? "")
    .trim()
    .toLowerCase();
  if (q) {
    out = out.filter((n) => {
      const doc = String(n.nu_documento ?? n.linha ?? "").toLowerCase();
      return doc.includes(q);
    });
  }
  const inicio = parseIsoDate(consulta.dataInicio);
  const fim = parseIsoDate(consulta.dataFim);
  if (inicio || fim) {
    out = out.filter((n) => {
      const venc = parseDataVencimentoBR(n.data_vencimento);
      if (!venc) return false;
      if (inicio && venc < inicio) return false;
      if (fim && venc > fim) return false;
      return true;
    });
  }
  return out;
}

function infoPaginacaoLocal(totalLinhas, pagina, tamanho) {
  const tamanhoPagina = tamanho > 0 ? tamanho : TAMANHO_PAGINA;
  if (totalLinhas <= 0) {
    return {
      pagina: 1,
      tamanho_pagina: tamanhoPagina,
      total_paginas: 1,
      total_linhas: 0,
    };
  }
  const totalPaginas = Math.max(1, Math.ceil(totalLinhas / tamanhoPagina));
  const paginaAtual = Math.max(1, Math.min(pagina, totalPaginas));
  return {
    pagina: paginaAtual,
    tamanho_pagina: tamanhoPagina,
    total_paginas: totalPaginas,
    total_linhas: totalLinhas,
  };
}

function fatiarNotasLocal(notas, pagina, tamanho) {
  const inicio = (pagina - 1) * tamanho;
  return notas.slice(inicio, inicio + tamanho);
}

function atualizarVistaTabela(opts = {}) {
  const filtro = opts.filtro ?? loteAtual.filtroStatus;
  const tamanho = opts.tamanho ?? loteAtual.tamanhoPagina;
  const paginaAlvo = opts.pagina ?? loteAtual.paginacao?.pagina ?? 1;

  const filtradas = filtrarNotasComConsulta(loteAtual.notasCompletas, filtro, {
    buscaNota: loteAtual.buscaNota,
    dataInicio: loteAtual.dataInicio,
    dataFim: loteAtual.dataFim,
  });
  const pag = infoPaginacaoLocal(filtradas.length, paginaAlvo, tamanho);

  loteAtual.filtroStatus = filtro;
  loteAtual.tamanhoPagina = pag.tamanho_pagina;
  loteAtual.paginacao = pag;
  loteAtual.notasPagina = fatiarNotasLocal(
    filtradas,
    pag.pagina,
    pag.tamanho_pagina
  );

  renderDashboardResumo(dashboardRoot, {
    total_a_receber: loteAtual.totalAReceber,
    resumo: loteAtual.resumo,
    notas: loteAtual.notasCompletas,
  });

  renderNotesTable(tableRoot, {
    notas: loteAtual.notasPagina,
    paginacao: loteAtual.paginacao,
    filtroStatus: loteAtual.filtroStatus,
    carregando: Boolean(opts.carregando),
    onPaginaChange: irParaPagina,
    onTamanhoPaginaChange: alterarTamanhoPagina,
    onFiltroStatusChange: alterarFiltroStatus,
    buscaNota: loteAtual.buscaNota,
    dataInicio: loteAtual.dataInicio,
    dataFim: loteAtual.dataFim,
    onConsultaChange: alterarConsulta,
  });

  observeCinematic(portalResults || document);
  requestAnimationFrame(() => cinematicRefresh());
}

async function aplicarLoteCompleto(data) {
  loteAtual.jobId = data.job_id ?? loteAtual.jobId;
  if (data.resumo) loteAtual.resumo = data.resumo;
  if (data.total_a_receber != null) loteAtual.totalAReceber = data.total_a_receber;
  loteAtual.notasCompletas = data.notas || [];
  atualizarVistaTabela({ pagina: 1 });
  await showResultsScreen();
}

function irParaPagina(pagina, tamanhoOverride) {
  atualizarVistaTabela({
    pagina,
    tamanho: tamanhoOverride ?? loteAtual.tamanhoPagina,
  });
}

function alterarTamanhoPagina(novoTamanho) {
  const tamanho = Number(novoTamanho);
  if (!TAMANHOS_PAGINA.includes(tamanho)) return;
  atualizarVistaTabela({ pagina: 1, tamanho });
}

function alterarFiltroStatus(novoFiltro) {
  atualizarVistaTabela({ pagina: 1, filtro: novoFiltro });
}

function alterarConsulta(consulta) {
  if (consulta.buscaNota != null) loteAtual.buscaNota = consulta.buscaNota;
  if (consulta.dataInicio != null) loteAtual.dataInicio = consulta.dataInicio;
  if (consulta.dataFim != null) loteAtual.dataFim = consulta.dataFim;
  atualizarVistaTabela({ pagina: 1 });
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
    atualizarVistaTabela();
  }
});

syncScreenA11y();
lockHomeScroll();
initCinematicScroll().then(() => lockHomeScroll());

mountUpload();
