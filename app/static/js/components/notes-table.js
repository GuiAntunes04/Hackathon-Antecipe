import { FILTRO_TODAS, TAMANHO_PAGINA, TAMANHOS_PAGINA } from "../config.js";
import { escapeHtml, formatMoney } from "../lib/format.js";

/**
 * Valor exibido na coluna Valor: líquido se aprovada, nominal se recusada.
 * @param {object} nota
 */
function valorColuna(nota) {
  const lower = String(nota.status ?? "").toLowerCase();
  if (lower === "aprovada" && nota.valor_liquido != null) {
    return formatMoney(nota.valor_liquido);
  }
  if (nota.valor_nominal != null) {
    return formatMoney(nota.valor_nominal);
  }
  return formatMoney(nota.valor_liquido);
}

/**
 * @param {object} nota
 * @returns {number}
 */
function valorAReceber(nota) {
  const lower = String(nota.status ?? "").toLowerCase();
  if (lower !== "aprovada") return 0;
  const v = nota.valor_liquido;
  if (v == null || v === "") return 0;
  const num = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return Number.isNaN(num) ? 0 : num;
}

/** @param {object} nota */
function celulaStatus(nota) {
  const lower = String(nota.status ?? "").toLowerCase();

  if (lower === "aprovada") {
    return `<span class="badge-status badge-status--aprovada">Aprovada</span>`;
  }

  if (lower === "recusada") {
    return `<span class="badge-status badge-status--recusada">Recusada</span>`;
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
    const motivo = nota.motivo ? String(nota.motivo) : "Motivo não informado.";
    banner.classList.add("nota-recebivel-banner--recusada");
    banner.innerHTML = `
      <p class="nota-recebivel-banner__titulo">Recusa NF ${escapeHtml(String(doc))}</p>
      <p class="nota-recebivel-banner__motivo">${escapeHtml(motivo)}</p>
    `;
  } else {
    const valorFmt = formatMoney(valorAReceber(nota));
    banner.innerHTML = `
      <p class="nota-recebivel-banner__titulo">Simulação NF ${escapeHtml(String(doc))}</p>
      <p class="nota-recebivel-banner__valor">${escapeHtml(valorFmt)}</p>
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

const THEAD_HTML = `
  <thead class="notes-table__thead">
    <tr>
      <th scope="col" class="notes-table__cell notes-table__cell--nota">Nota</th>
      <th scope="col" class="notes-table__cell notes-table__cell--sacado">Sacado</th>
      <th scope="col" class="notes-table__cell notes-table__cell--vencimento">Vencimento</th>
      <th scope="col" class="notes-table__cell notes-table__cell--valor">Valor</th>
      <th scope="col" class="notes-table__cell notes-table__cell--status">Status</th>
    </tr>
  </thead>`;

/** @param {Array<object>} lista */
function htmlLinhas(lista) {
  return (lista || [])
    .map((nota, index) => {
      const doc = escapeHtml(nota.nu_documento ?? nota.linha ?? "");
      const recusada = String(nota.status ?? "").toLowerCase() === "recusada";
      const aria = recusada
        ? `Ver motivo da recusa da nota ${doc}`
        : `Ver quanto receber pela nota ${doc}`;
      return `<tr class="nota-row hover:bg-slate-50" data-nota-index="${index}" tabindex="0" role="button" aria-label="${aria}">
        <td class="notes-table__cell notes-table__cell--nota">${doc}</td>
        <td class="notes-table__cell notes-table__cell--sacado">${escapeHtml(nota.nome_sacado ?? "—")}</td>
        <td class="notes-table__cell notes-table__cell--vencimento">${escapeHtml(nota.data_vencimento ?? "—")}</td>
        <td class="notes-table__cell notes-table__cell--valor">${escapeHtml(valorColuna(nota))}</td>
        <td class="notes-table__cell notes-table__cell--status">${celulaStatus(nota)}</td>
      </tr>`;
    })
    .join("");
}

const FILTROS_UI = [
  { valor: FILTRO_TODAS, rotulo: "Todas" },
  { valor: "aprovada", rotulo: "Aceitas" },
  { valor: "recusada", rotulo: "Recusadas" },
];

/**
 * @param {string} filtroAtual
 * @param {boolean} carregando
 */
function htmlFiltroStatus(filtroAtual, carregando) {
  const ativo = filtroAtual || FILTRO_TODAS;
  const botoes = FILTROS_UI.map(({ valor, rotulo }) => {
    const isActive = valor === ativo;
    return `<button type="button" class="notes-filter__btn${
      isActive ? " notes-filter__btn--active" : ""
    }" data-filtro="${valor}" ${carregando ? "disabled" : ""} ${
      isActive ? 'aria-pressed="true"' : 'aria-pressed="false"'
    }>${rotulo}</button>`;
  }).join("");

  return `
    <div class="notes-filter" role="group" aria-label="Filtrar notas por status">
      ${botoes}
    </div>
  `;
}

/**
 * @param {number} atual
 * @param {number} total
 * @param {number} [vizinhos]
 * @returns {(number | "ellipsis")[]}
 */
function gerarNumerosPagina(atual, total, vizinhos = 2) {
  if (total <= 1) return [1];
  const paginas = new Set([1, total]);
  for (let i = atual - vizinhos; i <= atual + vizinhos; i += 1) {
    if (i >= 1 && i <= total) paginas.add(i);
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
  }>${item.toLocaleString("pt-BR")}</button>`;
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
    <nav class="notes-pagination" aria-label="Paginação das notas">
      <div class="notes-pagination__actions">
        <button type="button" class="notes-pagination__btn" data-pagina="${pagina - 1}" ${
          prevDisabled ? "disabled" : ""
        }>Anterior</button>
        <div class="notes-pagination__pages" role="group" aria-label="Números de página">
          ${numeros}
        </div>
        <button type="button" class="notes-pagination__btn" data-pagina="${pagina + 1}" ${
          nextDisabled ? "disabled" : ""
        }>Próxima</button>
        <label class="notes-pagination__size-label">
          <span class="notes-pagination__size-text">Mostrar</span>
          <select class="notes-pagination__size" ${carregando ? "disabled" : ""} aria-label="Mostrar notas por página">
            ${opcoesTamanho}
          </select>
        </label>
      </div>
      ${carregando ? `<p class="notes-pagination__loading" role="status">Carregando página…</p>` : ""}
    </nav>
  `;
}

/**
 * Alinha cabeçalho e corpo (largura útil + colunas + scroll horizontal).
 * @param {HTMLElement} container
 */
function alinharColunasTabela(container) {
  const scroll = container.querySelector(".notes-table-scroll");
  const headInner = container.querySelector(".notes-table-head-inner");
  const headTable = container.querySelector(".notes-table--head");
  const bodyTable = container.querySelector(".notes-table--body");
  if (!scroll || !headInner || !headTable || !bodyTable) return;

  const larguraUtil = scroll.clientWidth;
  const gutter = scroll.offsetWidth - scroll.clientWidth;
  const headWrap = container.querySelector(".notes-table-head");
  if (headWrap) {
    headWrap.style.paddingRight = `${gutter}px`;
  }

  const larguraPx = `${larguraUtil}px`;
  headTable.style.width = larguraPx;
  bodyTable.style.width = larguraPx;

  const linhaCorpo = bodyTable.querySelector("tbody tr");
  const referencia = linhaCorpo
    ? linhaCorpo.querySelectorAll("td")
    : headTable.querySelectorAll("th");
  const headCols = headTable.querySelectorAll("colgroup col");
  const bodyCols = bodyTable.querySelectorAll("colgroup col");

  referencia.forEach((celula, i) => {
    const px = `${celula.getBoundingClientRect().width}px`;
    if (headCols[i]) headCols[i].style.width = px;
    if (bodyCols[i]) bodyCols[i].style.width = px;
  });

  headInner.scrollLeft = scroll.scrollLeft;
}

function vincularSyncScrollTabela(container) {
  if (container.dataset.boundScrollSync === "1") return;
  const scroll = container.querySelector(".notes-table-scroll");
  const headInner = container.querySelector(".notes-table-head-inner");
  if (!scroll || !headInner) return;
  container.dataset.boundScrollSync = "1";
  scroll.addEventListener("scroll", () => {
    headInner.scrollLeft = scroll.scrollLeft;
  });
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => alinharColunasTabela(container));
    ro.observe(scroll);
    container._notesTableResizeObserver = ro;
  }
}

/** @type {WeakMap<HTMLElement, { lista: object[], onPaginaChange?: Function, onTamanhoPaginaChange?: Function, onFiltroStatusChange?: Function }>} */
const estadoTabela = new WeakMap();

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

  const filtro = container.querySelector(".notes-filter");
  if (filtro && container.dataset.boundFiltro !== "1") {
    container.dataset.boundFiltro = "1";
    filtro.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filtro]");
      if (!btn || btn.disabled || !estado.onFiltroStatusChange) return;
      estado.onFiltroStatusChange(String(btn.dataset.filtro));
    });
  }

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
 * @param {{ notas?: Array<object>, paginacao?: object, filtroStatus?: string, carregando?: boolean, onPaginaChange?: (pagina: number) => void, onTamanhoPaginaChange?: (tamanho: number) => void, onFiltroStatusChange?: (filtro: string) => void }} opts
 */
export function renderNotesTable(container, opts) {
  const notas = opts?.notas ?? (Array.isArray(opts) ? opts : []);
  const paginacao = opts?.paginacao;
  const filtroStatus = opts?.filtroStatus ?? FILTRO_TODAS;
  const carregando = Boolean(opts?.carregando);
  const onPaginaChange = opts?.onPaginaChange;
  const onTamanhoPaginaChange = opts?.onTamanhoPaginaChange;
  const onFiltroStatusChange = opts?.onFiltroStatusChange;
  const lista = notas || [];

  estadoTabela.set(container, {
    lista,
    onPaginaChange,
    onTamanhoPaginaChange,
    onFiltroStatusChange,
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
                ${THEAD_HTML}
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

  const tbody = container.querySelector("tbody");
  const filtroRoot = container.querySelector(".notes-filter-root");
  const pagRoot = container.querySelector(".notes-pagination-root");
  const banner = container.querySelector("#nota-recebivel-banner");
  if (filtroRoot) {
    filtroRoot.innerHTML = htmlFiltroStatus(filtroStatus, carregando);
    container.dataset.boundFiltro = "";
  }
  if (tbody) {
    if (lista.length === 0 && paginacao?.total_linhas === 0) {
      tbody.innerHTML = `<tr><td class="notes-table__empty" colspan="5">Nenhuma nota neste filtro.</td></tr>`;
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

  requestAnimationFrame(() => {
    alinharColunasTabela(container);
  });
}
