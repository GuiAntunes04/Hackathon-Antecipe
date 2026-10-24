import {
  cinematicRefresh,
  initCinematicScroll,
  observeCinematic,
  setSmoothScrollActive,
} from "./cinematic-scroll.js";
import { getValidarPagina, postValidar } from "./api/validacao.js";
import { FILTRO_TODAS, TAMANHO_PAGINA, TAMANHOS_PAGINA } from "./config.js";
import { mountUploadPanel } from "./components/upload-panel.js";
import { renderNotesTable } from "./components/notes-table.js";
import { renderDashboardResumo } from "./components/dashboard-resumo.js";

const statusEl = document.getElementById("status");
const uploadSection = document.getElementById("upload-section");
const uploadRoot = document.getElementById("upload-root");
const dashboardRoot = document.getElementById("dashboard-root");
const tableRoot = document.getElementById("table-root");

/** @type {{ jobId: string | null, paginacao: object | null, resumo: object | null, totalAReceber: number | null, notasPagina: object[], tamanhoPagina: number, filtroStatus: string }} */
const loteAtual = {
  jobId: null,
  paginacao: null,
  resumo: null,
  totalAReceber: null,
  notasPagina: [],
  tamanhoPagina: TAMANHO_PAGINA,
  filtroStatus: FILTRO_TODAS,
};

const STATUS_VARIANTS = {
  secondary:
    "rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700",
  success:
    "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800",
  danger: "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800",
};

/** Upload: viewport fixa, sem rolagem da página. */
function lockUploadScroll() {
  document.documentElement.classList.add("portal-no-scroll");
  document.body.classList.add("portal-no-scroll");
  setSmoothScrollActive(false);
  window.scrollTo(0, 0);
}

/** Após validar: rolagem normal da página (Lenis ativo). */
function unlockResultsScroll() {
  document.documentElement.classList.remove("portal-no-scroll");
  document.body.classList.remove("portal-no-scroll");
  setSmoothScrollActive(true);
}

function setStatus(message, variant = "") {
  statusEl.textContent = message;
  if (!message) {
    statusEl.className = "mt-4 empty:hidden";
    return;
  }
  const styles = STATUS_VARIANTS[variant] || STATUS_VARIANTS.secondary;
  statusEl.className = `mt-4 ${styles}`;
}

function hideResults() {
  dashboardRoot.classList.add("hidden");
  tableRoot.classList.add("hidden");
  document.body.classList.remove("has-resultado-bar");
  uploadSection?.classList.remove("hidden");
  lockUploadScroll();
  loteAtual.jobId = null;
  loteAtual.paginacao = null;
  loteAtual.resumo = null;
  loteAtual.totalAReceber = null;
  loteAtual.notasPagina = [];
  loteAtual.tamanhoPagina = TAMANHO_PAGINA;
  loteAtual.filtroStatus = FILTRO_TODAS;
}

function showResults() {
  dashboardRoot.classList.remove("hidden");
  tableRoot.classList.remove("hidden");
  document.body.classList.add("has-resultado-bar");
  unlockResultsScroll();
  uploadSection?.classList.add("hidden");
  setStatus("", "");
}

function opcoesTabela(carregando = false) {
  return {
    notas: loteAtual.notasPagina,
    paginacao: loteAtual.paginacao,
    filtroStatus: loteAtual.filtroStatus,
    carregando,
    onPaginaChange: irParaPagina,
    onTamanhoPaginaChange: alterarTamanhoPagina,
    onFiltroStatusChange: alterarFiltroStatus,
  };
}

/**
 * @param {object} data
 * @param {{ carregando?: boolean }} [opts]
 */
function aplicarPaginaLote(data, opts = {}) {
  loteAtual.jobId = data.job_id ?? loteAtual.jobId;
  loteAtual.paginacao = data.paginacao ?? loteAtual.paginacao;
  if (data.resumo) loteAtual.resumo = data.resumo;
  if (data.total_a_receber != null) loteAtual.totalAReceber = data.total_a_receber;
  loteAtual.notasPagina = data.notas || [];
  if (data.paginacao?.tamanho_pagina) {
    loteAtual.tamanhoPagina = data.paginacao.tamanho_pagina;
  }
  if (data.filtro_status) {
    loteAtual.filtroStatus = data.filtro_status;
  }

  const resumoPayload = {
    total_a_receber: loteAtual.totalAReceber,
    resumo: loteAtual.resumo,
  };

  renderDashboardResumo(dashboardRoot, resumoPayload);

  renderNotesTable(tableRoot, opcoesTabela(Boolean(opts.carregando)));

  showResults();
  observeCinematic(document);
  requestAnimationFrame(() => cinematicRefresh());
}

/**
 * @param {number} pagina
 * @param {{ tamanho?: number, filtro?: string }} [overrides]
 */
async function carregarPaginaLote(pagina, overrides = {}) {
  if (!loteAtual.jobId) return;

  const tamanho = overrides.tamanho ?? loteAtual.tamanhoPagina;
  const filtro = overrides.filtro ?? loteAtual.filtroStatus;
  const totalPaginas = loteAtual.paginacao?.total_paginas ?? 1;
  const alvo = Math.max(1, Math.min(pagina, totalPaginas));
  const carregando = Boolean(tableRoot.querySelector(".notes-pagination__loading"));
  const mesmaConsulta =
    alvo === loteAtual.paginacao?.pagina &&
    tamanho === loteAtual.paginacao?.tamanho_pagina &&
    filtro === loteAtual.filtroStatus &&
    !carregando;
  if (mesmaConsulta) return;

  loteAtual.tamanhoPagina = tamanho;
  loteAtual.filtroStatus = filtro;
  renderNotesTable(tableRoot, {
    ...opcoesTabela(true),
    paginacao: {
      ...loteAtual.paginacao,
      pagina: alvo,
      tamanho_pagina: tamanho,
    },
    filtroStatus: filtro,
  });

  try {
    const data = await getValidarPagina(loteAtual.jobId, alvo, tamanho, filtro);
    aplicarPaginaLote(data);
  } catch (err) {
    setStatus("Erro ao carregar página: " + err.message, "danger");
    renderNotesTable(tableRoot, opcoesTabela(false));
  }
}

async function irParaPagina(pagina, tamanhoOverride) {
  await carregarPaginaLote(pagina, { tamanho: tamanhoOverride });
}

async function alterarTamanhoPagina(novoTamanho) {
  const tamanho = Number(novoTamanho);
  if (!TAMANHOS_PAGINA.includes(tamanho) || !loteAtual.jobId) return;
  await carregarPaginaLote(1, { tamanho });
}

async function alterarFiltroStatus(novoFiltro) {
  if (!loteAtual.jobId) return;
  await carregarPaginaLote(1, { filtro: novoFiltro });
}

lockUploadScroll();
initCinematicScroll().then(() => lockUploadScroll());

mountUploadPanel(uploadRoot, {
  async onSubmit(file) {
    setStatus("Validando arquivo…", "secondary");
    hideResults();
    tableRoot.innerHTML = "";

    try {
      const data = await postValidar(file, {
        pagina: 1,
        tamanhoPagina: loteAtual.tamanhoPagina,
        filtroStatus: loteAtual.filtroStatus,
      });
      aplicarPaginaLote(data);
    } catch (err) {
      setStatus("Erro: " + err.message, "danger");
      hideResults();
    }
  },
});
