import {
  FILTRO_TODAS,
  PAGINACAO_JANELA_NUMEROS,
  TAMANHO_PAGINA,
  TAMANHOS_PAGINA,
} from "../config.js";
import { getLocale, t } from "../i18n.js";
import { escapeHtml } from "../lib/format.js";
import {
  formatValorLiquidoSimulado,
  formatValorNominalNota,
} from "../lib/nota-valores.js?v=20261024d";

/** @param {object} nota */
function celulaStatus(nota) {
  const lower = String(nota.status ?? "").toLowerCase();

  if (lower === "aprovada") {
    return `<span class="badge-status badge-status--aprovada">${t("table.statusApproved")}</span>`;
  }

  if (lower === "recusada") {
    return `<span class="badge-status badge-status--recusada">${t("table.statusRejected")}</span>`;
  }

  return escapeHtml(String(nota.status ?? "—"));
}

/**
 * @param {HTMLElement} banner
 * @param {object} nota
 */
function mostrarBannerNota(banner, nota) {
  const doc = nota.nu_documento ?? nota.linha ?? "—";
  const lower = String(nota.status ?? "").toLowerCase();

  banner.classList.remove("nota-recebivel-banner--recusada");

  if (lower === "recusada") {
    const motivo = nota.motivo ? String(nota.motivo) : t("banner.noReason");
    banner.classList.add("nota-recebivel-banner--recusada");
    banner.innerHTML = `
      <div class="nota-recebivel-banner__lead">
        <p class="nota-recebivel-banner__titulo">${escapeHtml(t("banner.rejectTitle", { doc }))}</p>
        <p class="nota-recebivel-banner__hint">${escapeHtml(t("banner.rejectHint"))}</p>
      </div>
      <p class="nota-recebivel-banner__motivo">${escapeHtml(motivo)}</p>
    `;
  } else if (lower === "aprovada") {
    const valorFmt = formatValorLiquidoSimulado(nota);
    banner.innerHTML = `
      <div class="nota-recebivel-banner__lead">
        <p class="nota-recebivel-banner__titulo">${escapeHtml(t("banner.simTitle", { doc }))}</p>
        <p class="nota-recebivel-banner__hint">${escapeHtml(t("banner.simHint"))}</p>
      </div>
      <p class="nota-recebivel-banner__valor">${escapeHtml(valorFmt)}</p>
    `;
  } else {
    banner.innerHTML = `
      <div class="nota-recebivel-banner__lead">
        <p class="nota-recebivel-banner__titulo">${escapeHtml(t("banner.detailTitle", { doc }))}</p>
        <p class="nota-recebivel-banner__hint">${escapeHtml(t("banner.detailHint"))}</p>
      </div>
    `;
  }

  banner.hidden = false;
}

const COLGROUP_HTML = `
  <colgroup>
    <col class="col-nota" />
    <col class="col-sacado" />
    <col class="col-vencimento" />
    <col class="col-valor" />
    <col class="col-status" />
  </colgroup>`;

function theadHtml() {
  return `
  <thead class="notes-table__thead">
    <tr>
      <th scope="col" class="notes-table__cell notes-table__cell--nota">${t("table.note")}</th>
      <th scope="col" class="notes-table__cell notes-table__cell--sacado">${t("table.drawee")}</th>
      <th scope="col" class="notes-table__cell notes-table__cell--vencimento">${t("table.due")}</th>
      <th scope="col" class="notes-table__cell notes-table__cell--valor">${t("table.value")}</th>
      <th scope="col" class="notes-table__cell notes-table__cell--status">${t("table.status")}</th>
    </tr>
  </thead>`;
}

/** @param {Array<object>} lista */
function htmlLinhas(lista) {
  return (lista || [])
    .map((nota, index) => {
      const doc = escapeHtml(nota.nu_documento ?? nota.linha ?? "");
      const recusada = String(nota.status ?? "").toLowerCase() === "recusada";
      const aria = recusada
        ? t("table.ariaReject", { doc })
        : t("table.ariaReceive", { doc });
      return `<tr class="nota-row hover:bg-slate-50" data-nota-index="${index}" tabindex="0" role="button" aria-label="${aria}">
        <td class="notes-table__cell notes-table__cell--nota">${doc}</td>
        <td class="notes-table__cell notes-table__cell--sacado">${escapeHtml(nota.nome_sacado ?? "—")}</td>
        <td class="notes-table__cell notes-table__cell--vencimento">${escapeHtml(nota.data_vencimento ?? "—")}</td>
        <td class="notes-table__cell notes-table__cell--valor">${escapeHtml(formatValorNominalNota(nota))}</td>
        <td class="notes-table__cell notes-table__cell--status">${celulaStatus(nota)}</td>
      </tr>`;
    })
    .join("");
}

function filtrosUi() {
  return [
    { valor: FILTRO_TODAS, rotulo: t("table.filterAll") },
    { valor: "aprovada", rotulo: t("table.filterApproved") },
    { valor: "recusada", rotulo: t("table.filterRejected") },
  ];
}

/**
 * @param {string} filtroAtual
 * @param {boolean} carregando
 * @param {{ buscaNota?: string, dataInicio?: string, dataFim?: string }} [consulta]
 */
function htmlBarraFiltros(filtroAtual, carregando, consulta = {}) {
  const ativo = filtroAtual || FILTRO_TODAS;
  const opcoesStatus = filtrosUi()
    .map(
      ({ valor, rotulo }) =>
        `<option value="${valor}" ${valor === ativo ? "selected" : ""}>${rotulo}</option>`
    )
    .join("");

  const busca = escapeHtml(consulta.buscaNota ?? "");
  const inicio = escapeHtml(consulta.dataInicio ?? "");
  const fim = escapeHtml(consulta.dataFim ?? "");
  const dis = carregando ? "disabled" : "";

  return `
    <div class="notes-toolbar">
      <div class="notes-toolbar__consulta" role="search" aria-label="${t("table.toolbarConsulta")}">
        <label class="notes-search">
          <span class="notes-search__label">${t("table.searchNote")}</span>
          <input
            type="search"
            class="notes-search__input"
            name="busca-nota"
            value="${busca}"
            placeholder="${t("table.searchPlaceholder")}"
            autocomplete="off"
            ${dis}
          />
        </label>
        <label class="notes-filter-select">
          <span class="notes-filter-select__label">${t("table.filterStatusLabel")}</span>
          <select
            class="notes-filter-select__input"
            name="filtro-status"
            aria-label="${t("table.filterGroup")}"
            ${dis}
          >
            ${opcoesStatus}
          </select>
        </label>
        <div class="notes-date-range">
          <label class="notes-date-field">
            <span class="notes-date-field__label">${t("table.dateStart")}</span>
            <input type="date" class="notes-date-field__input" name="data-inicio" value="${inicio}" ${dis} />
          </label>
          <label class="notes-date-field">
            <span class="notes-date-field__label">${t("table.dateEnd")}</span>
            <input type="date" class="notes-date-field__input" name="data-fim" value="${fim}" ${dis} />
          </label>
        </div>
      </div>
    </div>
  `;
}

/**
 * @param {number} atual
 * @param {number} total
 * @param {number} [janela]
 * @returns {(number | "ellipsis")[]}
 */
function gerarNumerosPagina(atual, total, janela = PAGINACAO_JANELA_NUMEROS) {
  if (total <= 1) return [1];
  const largura = Math.max(1, Math.floor(janela));
  if (total <= largura + 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const paginas = new Set([1, total]);
  let start = atual - Math.floor(largura / 2);
  let end = start + largura - 1;
  if (start < 1) {
    start = 1;
    end = largura;
  }
  if (end > total) {
    end = total;
    start = total - largura + 1;
  }
  for (let i = start; i <= end; i += 1) {
    paginas.add(i);
  }
  const ordenadas = [...paginas].sort((a, b) => a - b);
  /** @type {(number | "ellipsis")[]} */
  const sequencia = [];
  for (let i = 0; i < ordenadas.length; i += 1) {
    if (i > 0 && ordenadas[i] - ordenadas[i - 1] > 1) sequencia.push("ellipsis");
    sequencia.push(ordenadas[i]);
  }
  return sequencia;
}

/**
 * @param {number | "ellipsis"} item
 * @param {number} paginaAtual
 * @param {boolean} carregando
 */
function htmlItemPagina(item, paginaAtual, carregando) {
  if (item === "ellipsis") {
    return `<span class="notes-pagination__ellipsis" aria-hidden="true">…</span>`;
  }
  const ativa = item === paginaAtual;
  return `<button type="button" class="notes-pagination__btn notes-pagination__btn--page${
    ativa ? " notes-pagination__btn--active" : ""
  }" data-pagina="${item}" ${ativa || carregando ? "disabled" : ""} ${
    ativa ? 'aria-current="page"' : ""
  }>${item.toLocaleString(getLocale())}</button>`;
}

/**
 * @param {object} paginacao
 * @param {boolean} carregando
 */
function htmlPaginacao(paginacao, carregando) {
  const pagina = paginacao?.pagina ?? 1;
  const totalPaginas = paginacao?.total_paginas ?? 1;
  const tamanho = paginacao?.tamanho_pagina ?? TAMANHO_PAGINA;
  const prevDisabled = pagina <= 1 || carregando;
  const nextDisabled = pagina >= totalPaginas || carregando;
  const numeros = gerarNumerosPagina(pagina, totalPaginas)
    .map((item) => htmlItemPagina(item, pagina, carregando))
    .join("");

  const opcoesTamanho = TAMANHOS_PAGINA.map(
    (n) =>
      `<option value="${n}" ${n === tamanho ? "selected" : ""}>${n}</option>`
  ).join("");

  return `
    <nav class="notes-pagination" aria-label="${t("table.pagination")}">
      <div class="notes-pagination__actions">
        <button
          type="button"
          class="notes-pagination__btn notes-pagination__btn--nav"
          data-pagina="${pagina - 1}"
          aria-label="${t("table.prev")}"
          ${prevDisabled ? "disabled" : ""}
        ><span class="notes-pagination__nav-full">${t("table.prev")}</span><span class="notes-pagination__nav-short" aria-hidden="true">‹</span></button>
        <div class="notes-pagination__pages" role="group" aria-label="${t("table.pageNumbers")}">
          ${numeros}
        </div>
        <button
          type="button"
          class="notes-pagination__btn notes-pagination__btn--nav"
          data-pagina="${pagina + 1}"
          aria-label="${t("table.next")}"
          ${nextDisabled ? "disabled" : ""}
        ><span class="notes-pagination__nav-full">${t("table.next")}</span><span class="notes-pagination__nav-short" aria-hidden="true">›</span></button>
        <label class="notes-pagination__size-label">
          <span class="notes-pagination__size-text">${t("table.show")}</span>
          <select class="notes-pagination__size" ${carregando ? "disabled" : ""} aria-label="${t("table.showPerPage")}">
            ${opcoesTamanho}
          </select>
        </label>
      </div>
      ${carregando ? `<p class="notes-pagination__loading" role="status">${t("table.loadingPage")}</p>` : ""}
    </nav>
  `;
}

/**
 * @param {NodeListOf<Element>} headCols
 * @param {NodeListOf<Element>} bodyCols
 */
function limparLargurasColunasTabela(headCols, bodyCols) {
  headCols.forEach((col) => {
    col.style.width = "";
  });
  bodyCols.forEach((col) => {
    col.style.width = "";
  });
}

const REALINHAR_COLUNAS_MAX_TENTATIVAS = 8;

/**
 * Alinha cabeçalho e corpo (largura útil + colunas + scroll horizontal).
 * Com linha vazia (`colspan`), mantém proporções do CSS — não trava largura em px.
 * @param {HTMLElement} container
 * @returns {boolean} `true` se aplicou (ou resetou) alinhamento; `false` se área ainda sem largura
 */
function alinharColunasTabela(container) {
  const scroll = container.querySelector(".notes-table-scroll");
  const headInner = container.querySelector(".notes-table-head-inner");
  const headTable = container.querySelector(".notes-table--head");
  const bodyTable = container.querySelector(".notes-table--body");
  if (!scroll || !headInner || !headTable || !bodyTable) return false;

  const larguraUtil = scroll.clientWidth;
  if (larguraUtil <= 0) return false;

  const gutter = scroll.offsetWidth - scroll.clientWidth;
  const headWrap = container.querySelector(".notes-table-head");
  if (headWrap) {
    headWrap.style.paddingRight = `${gutter}px`;
  }

  const larguraPx = `${larguraUtil}px`;
  headTable.style.width = larguraPx;
  bodyTable.style.width = larguraPx;

  const headCols = headTable.querySelectorAll("colgroup col");
  const bodyCols = bodyTable.querySelectorAll("colgroup col");
  limparLargurasColunasTabela(headCols, bodyCols);

  const linhaCorpo = bodyTable.querySelector("tbody tr");
  const linhaVazia = Boolean(linhaCorpo?.querySelector(".notes-table__empty"));
  const celulasCorpo = linhaCorpo?.querySelectorAll("td") ?? [];
  const usarCorpo =
    linhaCorpo && !linhaVazia && celulasCorpo.length >= headCols.length;

  if (!usarCorpo) {
    container.dataset.notesTableColMode = linhaVazia ? "empty" : "header";
    headInner.scrollLeft = scroll.scrollLeft;
    return true;
  }

  celulasCorpo.forEach((celula, i) => {
    if (i >= headCols.length) return;
    const px = `${celula.getBoundingClientRect().width}px`;
    if (headCols[i]) headCols[i].style.width = px;
    if (bodyCols[i]) bodyCols[i].style.width = px;
  });

  container.dataset.notesTableColMode = "body";
  headInner.scrollLeft = scroll.scrollLeft;
  return true;
}

/** @param {HTMLElement} container @param {number} [tentativa] */
function agendarRealinhamentoColunas(container, tentativa = 0) {
  requestAnimationFrame(() => {
    const ok = alinharColunasTabela(container);
    if (!ok && tentativa < REALINHAR_COLUNAS_MAX_TENTATIVAS) {
      agendarRealinhamentoColunas(container, tentativa + 1);
      return;
    }
    const modo = container.dataset.notesTableColMode;
    if (ok && modo === "body" && tentativa === 0) {
      requestAnimationFrame(() => alinharColunasTabela(container));
    }
  });
}

const NOTAS_VISIVEIS_SEM_SCROLL = 10;

/**
 * Ajusta a altura do viewport do tbody para caber até 10 linhas sem scroll interno.
 * @param {HTMLElement} container
 * @param {number} qtdLinhasNaPagina
 * @param {number} tamanhoPagina
 */
function ajustarViewportScrollTabela(container, qtdLinhasNaPagina, tamanhoPagina) {
  const scroll = container.querySelector(".notes-table-scroll");
  if (!scroll) return;

  const linha = scroll.querySelector("tbody tr:not(:has(.notes-table__empty))");
  const viewportRows = Math.min(NOTAS_VISIVEIS_SEM_SCROLL, tamanhoPagina);

  let rowPx = 40;
  if (linha instanceof HTMLElement) {
    const medido = linha.getBoundingClientRect().height;
    if (medido > 0) rowPx = medido;
  } else {
    const raw = getComputedStyle(document.body)
      .getPropertyValue("--notes-table-row-height")
      .trim();
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    if (raw.endsWith("rem")) rowPx = parseFloat(raw) * rootPx;
    else if (raw.endsWith("px")) rowPx = parseFloat(raw);
  }

  const alturaMinPx = rowPx * viewportRows;
  scroll.style.setProperty("--notes-table-viewport-min", `${alturaMinPx}px`);
  scroll.style.removeProperty("height");
  scroll.style.removeProperty("maxHeight");
  scroll.style.minHeight = "";

}

/** Mantém sync horizontal cabeçalho/corpo; rolagem vertical fica na página (Lenis). */
function vincularWheelScrollTabela(scroll) {
  if (!scroll || scroll.dataset.wheelLenisUnlock === "1") return;
  scroll.dataset.wheelLenisUnlock = "1";
}

function vincularSyncScrollTabela(container) {
  if (container.dataset.boundScrollSync === "1") return;
  const scroll = container.querySelector(".notes-table-scroll");
  const headInner = container.querySelector(".notes-table-head-inner");
  if (!scroll || !headInner) return;
  container.dataset.boundScrollSync = "1";
  vincularWheelScrollTabela(scroll);
  scroll.addEventListener("scroll", () => {
    headInner.scrollLeft = scroll.scrollLeft;
  });
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => agendarRealinhamentoColunas(container));
    ro.observe(scroll);
    container._notesTableResizeObserver = ro;
  }
}

/** @type {WeakMap<HTMLElement, { lista: object[], onPaginaChange?: Function, onTamanhoPaginaChange?: Function, onFiltroStatusChange?: Function, onConsultaChange?: Function, searchTimer?: ReturnType<typeof setTimeout> }>} */
const estadoTabela = new WeakMap();

/**
 * @param {HTMLElement} container
 */
function lerConsultaDoToolbar(container) {
  const busca = container.querySelector(".notes-search__input");
  const inicio = container.querySelector('[name="data-inicio"]');
  const fim = container.querySelector('[name="data-fim"]');
  return {
    buscaNota: busca?.value ?? "",
    dataInicio: inicio?.value ?? "",
    dataFim: fim?.value ?? "",
  };
}

/**
 * @param {HTMLElement} container
 * @param {{ onConsultaChange?: Function, searchTimer?: ReturnType<typeof setTimeout> }} estado
 */
function vincularConsultaToolbar(container, estado) {
  const toolbar = container.querySelector(".notes-toolbar");
  if (!toolbar || toolbar.dataset.boundConsulta === "1") return;
  toolbar.dataset.boundConsulta = "1";

  const search = toolbar.querySelector(".notes-search__input");
  const inicio = toolbar.querySelector('[name="data-inicio"]');
  const fim = toolbar.querySelector('[name="data-fim"]');

  const emitir = () => {
    if (!estado.onConsultaChange) return;
    estado.onConsultaChange(lerConsultaDoToolbar(container));
  };

  search?.addEventListener("input", () => {
    if (estado.searchTimer) clearTimeout(estado.searchTimer);
    estado.searchTimer = setTimeout(emitir, 280);
  });

  inicio?.addEventListener("change", emitir);
  fim?.addEventListener("change", emitir);
}

function vincularInteracoes(container) {
  const banner = container.querySelector("#nota-recebivel-banner");
  const tbody = container.querySelector("tbody");
  const estado = estadoTabela.get(container);
  if (!estado || !tbody) return;

  function selecionarLinha(tr) {
    container.querySelectorAll(".nota-row--selected").forEach((el) => {
      el.classList.remove("nota-row--selected");
    });
    tr.classList.add("nota-row--selected");
  }

  function aoEscolherNota(tr) {
    const index = Number(tr.dataset.notaIndex);
    const nota = estado.lista[index];
    if (!nota || !banner) return;
    selecionarLinha(tr);
    mostrarBannerNota(banner, nota);
  }

  if (!container.dataset.boundRows) {
    container.dataset.boundRows = "1";
    tbody.addEventListener("click", (e) => {
      const tr = e.target.closest("tr.nota-row");
      if (tr) aoEscolherNota(tr);
    });
    tbody.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const tr = e.target.closest("tr.nota-row");
      if (!tr) return;
      e.preventDefault();
      aoEscolherNota(tr);
    });
  }

  const filtroSelect = container.querySelector(".notes-filter-select__input");
  if (filtroSelect && container.dataset.boundFiltro !== "1") {
    container.dataset.boundFiltro = "1";
    filtroSelect.addEventListener("change", () => {
      if (filtroSelect.disabled || !estado.onFiltroStatusChange) return;
      estado.onFiltroStatusChange(String(filtroSelect.value));
    });
  }

  vincularConsultaToolbar(container, estado);

  const nav = container.querySelector(".notes-pagination");
  if (!nav || container.dataset.boundPagination === "1") return;
  container.dataset.boundPagination = "1";

  nav.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-pagina]");
    if (!btn || btn.disabled || !estado.onPaginaChange) return;
    const alvo = Number(btn.dataset.pagina);
    if (!Number.isFinite(alvo)) return;
    estado.onPaginaChange(alvo);
  });

  const select = nav.querySelector(".notes-pagination__size");
  select?.addEventListener("change", () => {
    if (!estado.onTamanhoPaginaChange || select.disabled) return;
    estado.onTamanhoPaginaChange(Number(select.value));
  });
}

/**
 * @param {HTMLElement} container
 * @param {{ notas?: Array<object>, paginacao?: object, filtroStatus?: string, buscaNota?: string, dataInicio?: string, dataFim?: string, carregando?: boolean, onPaginaChange?: (pagina: number) => void, onTamanhoPaginaChange?: (tamanho: number) => void, onFiltroStatusChange?: (filtro: string) => void, onConsultaChange?: (consulta: object) => void }} opts
 */
export function renderNotesTable(container, opts) {
  const notas = opts?.notas ?? (Array.isArray(opts) ? opts : []);
  const paginacao = opts?.paginacao;
  const filtroStatus = opts?.filtroStatus ?? FILTRO_TODAS;
  const carregando = Boolean(opts?.carregando);
  const onPaginaChange = opts?.onPaginaChange;
  const onTamanhoPaginaChange = opts?.onTamanhoPaginaChange;
  const onFiltroStatusChange = opts?.onFiltroStatusChange;
  const onConsultaChange = opts?.onConsultaChange;
  const lista = notas || [];

  const prevEstado = estadoTabela.get(container);
  estadoTabela.set(container, {
    lista,
    onPaginaChange,
    onTamanhoPaginaChange,
    onFiltroStatusChange,
    onConsultaChange,
    searchTimer: prevEstado?.searchTimer,
  });

  const shellExists = container.querySelector(".notes-table-shell");
  if (!shellExists) {
    container.innerHTML = `
      <div class="notes-table-shell">
        <div id="nota-recebivel-banner" class="nota-recebivel-banner" hidden role="status" aria-live="polite"></div>
        <div class="notes-filter-root"></div>
        <div class="notes-table-frame w-full min-w-0">
          <div class="notes-table-head">
            <div class="notes-table-head-inner">
              <table class="notes-table notes-table--head w-full text-left text-sm">
                ${COLGROUP_HTML}
                ${theadHtml()}
              </table>
            </div>
          </div>
          <div class="notes-table-scroll">
            <table class="notes-table notes-table--body w-full divide-y divide-slate-200 text-left text-sm">
              ${COLGROUP_HTML}
              <tbody class="divide-y divide-slate-100 bg-white"></tbody>
            </table>
          </div>
        </div>
        <div class="notes-pagination-root"></div>
      </div>
    `;
    vincularInteracoes(container);
    vincularSyncScrollTabela(container);
  }

  const headThead = container.querySelector(".notes-table--head thead");
  if (headThead) {
    headThead.outerHTML = theadHtml();
  }

  const tbody = container.querySelector("tbody");
  const filtroRoot = container.querySelector(".notes-filter-root");
  const pagRoot = container.querySelector(".notes-pagination-root");
  const banner = container.querySelector("#nota-recebivel-banner");
  if (filtroRoot) {
    filtroRoot.innerHTML = htmlBarraFiltros(filtroStatus, carregando, {
      buscaNota: opts?.buscaNota,
      dataInicio: opts?.dataInicio,
      dataFim: opts?.dataFim,
    });
    container.dataset.boundFiltro = "";
    const toolbar = filtroRoot.querySelector(".notes-toolbar");
    if (toolbar) toolbar.dataset.boundConsulta = "";
    vincularInteracoes(container);
  }
  if (tbody) {
    if (lista.length === 0 && paginacao?.total_linhas === 0) {
      tbody.innerHTML = `<tr><td class="notes-table__empty" colspan="5">${t("table.emptyFilter")}</td></tr>`;
    } else {
      tbody.innerHTML = htmlLinhas(lista);
    }
  }
  if (pagRoot && paginacao) {
    pagRoot.innerHTML = htmlPaginacao(paginacao, carregando);
    container.dataset.boundPagination = "";
    vincularInteracoes(container);
  }
  if (banner) {
    banner.hidden = true;
    banner.innerHTML = "";
  }

  vincularWheelScrollTabela(container.querySelector(".notes-table-scroll"));

  const tamanhoPagina = paginacao?.tamanho_pagina ?? TAMANHO_PAGINA;
  const linhasCorpo =
    lista.length === 0 && paginacao?.total_linhas === 0 ? 0 : lista.length;
  agendarRealinhamentoColunas(container);
  requestAnimationFrame(() => {
    ajustarViewportScrollTabela(container, linhasCorpo, tamanhoPagina);
    agendarRealinhamentoColunas(container);
  });
}
