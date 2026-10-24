import { FILTRO_TODAS, TAMANHO_PAGINA, TAMANHOS_PAGINA } from "../config.js";
import {
  fatiarNotasPagina,
  filtrarNotasConsultaTabela,
  infoPaginacaoLocal,
} from "../lib/notas-filtro.js";
import { renderNotesTable } from "./notes-table.js?v=20261024k";

/**
 * Controlador da tabela de notas: filtros locais, paginação e render — sem re-render do dashboard.
 * @param {HTMLElement} container
 */
export function createNotesTableController(container) {
  /** @type {HTMLElement} */
  let root = container;

  const state = {
    notasCompletas: [],
    sacadosFiltrados: [],
    filtroStatus: FILTRO_TODAS,
    buscaNota: "",
    dataInicio: "",
    dataFim: "",
    tamanhoPagina: TAMANHO_PAGINA,
    pagina: 1,
    carregando: false,
  };

  function notificarLayout() {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  }

  function irParaPagina(pagina, tamanhoOverride) {
    state.pagina = pagina;
    if (tamanhoOverride != null) state.tamanhoPagina = tamanhoOverride;
    render();
  }

  function alterarTamanhoPagina(novoTamanho) {
    const tamanho = Number(novoTamanho);
    if (!TAMANHOS_PAGINA.includes(tamanho)) return;
    state.tamanhoPagina = tamanho;
    state.pagina = 1;
    render();
  }

  function alterarFiltroStatus(novoFiltro) {
    state.filtroStatus = novoFiltro;
    state.pagina = 1;
    render();
  }

  /** @param {{ buscaNota?: string, dataInicio?: string, dataFim?: string }} consulta */
  function alterarConsulta(consulta) {
    if (consulta.buscaNota != null) state.buscaNota = consulta.buscaNota;
    if (consulta.dataInicio != null) state.dataInicio = consulta.dataInicio;
    if (consulta.dataFim != null) state.dataFim = consulta.dataFim;
    state.pagina = 1;
    render();
  }

  function render() {
    if (!root) return;

    const filtradas = filtrarNotasConsultaTabela(state.notasCompletas, {
      sacadosFiltrados: state.sacadosFiltrados,
      filtroStatus: state.filtroStatus,
      buscaNota: state.buscaNota,
      dataInicio: state.dataInicio,
      dataFim: state.dataFim,
    });
    const pag = infoPaginacaoLocal(filtradas.length, state.pagina, state.tamanhoPagina);
    state.pagina = pag.pagina;
    state.tamanhoPagina = pag.tamanho_pagina;
    const notasPagina = fatiarNotasPagina(filtradas, pag.pagina, pag.tamanho_pagina);

    renderNotesTable(root, {
      notas: notasPagina,
      paginacao: pag,
      filtroStatus: state.filtroStatus,
      carregando: state.carregando,
      onPaginaChange: irParaPagina,
      onTamanhoPaginaChange: alterarTamanhoPagina,
      onFiltroStatusChange: alterarFiltroStatus,
      buscaNota: state.buscaNota,
      dataInicio: state.dataInicio,
      dataFim: state.dataFim,
      onConsultaChange: alterarConsulta,
    });

    notificarLayout();
  }

  return {
    /** @param {HTMLElement} container */
    attach(container) {
      root = container;
    },

    reset() {
      state.notasCompletas = [];
      state.sacadosFiltrados = [];
      state.filtroStatus = FILTRO_TODAS;
      state.buscaNota = "";
      state.dataInicio = "";
      state.dataFim = "";
      state.tamanhoPagina = TAMANHO_PAGINA;
      state.pagina = 1;
      state.carregando = false;
      if (root) root.innerHTML = "";
    },

    /** @param {boolean} carregando */
    setCarregando(carregando) {
      state.carregando = carregando;
      render();
    },

    /**
     * Novo lote ou recarga completa (mantém filtros locais da tabela).
     * @param {object[]} notasCompletas
     * @param {string[]} sacadosFiltrados
     */
    applyLote(notasCompletas, sacadosFiltrados) {
      state.notasCompletas = notasCompletas || [];
      state.sacadosFiltrados = sacadosFiltrados || [];
      state.pagina = 1;
      render();
    },

    /** @param {string[]} sacadosFiltrados */
    applySacadosGlobais(sacadosFiltrados) {
      state.sacadosFiltrados = sacadosFiltrados || [];
      state.pagina = 1;
      render();
    },

    refresh() {
      render();
    },
  };
}
