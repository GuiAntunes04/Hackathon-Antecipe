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

/**
 * @param {HTMLElement} container
 * @param {Array<object>} notas
 */
export function renderNotesTable(container, notas) {
  const lista = notas || [];

  const rows = lista
    .map((nota, index) => {
      const doc = escapeHtml(nota.nu_documento ?? nota.linha ?? "");
      const recusada = String(nota.status ?? "").toLowerCase() === "recusada";
      const aria = recusada
        ? `Ver motivo da recusa da nota ${doc}`
        : `Ver quanto receber pela nota ${doc}`;
      return `<tr class="nota-row hover:bg-slate-50" data-nota-index="${index}" tabindex="0" role="button" aria-label="${aria}">
        <td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">${doc}</td>
        <td class="px-4 py-3 text-sm leading-snug text-slate-600 break-words">${escapeHtml(nota.nome_sacado ?? "—")}</td>
        <td class="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-slate-700">${escapeHtml(nota.data_vencimento ?? "—")}</td>
        <td class="whitespace-nowrap px-4 py-3 text-right text-sm font-medium tabular-nums text-slate-900">${escapeHtml(valorColuna(nota))}</td>
        <td class="px-4 py-3 text-sm">${celulaStatus(nota)}</td>
      </tr>`;
    })
    .join("");

  container.innerHTML = `
    <h2 class="text-lg font-semibold text-slate-900">Notas do lote</h2>
    <p class="mt-1 text-sm text-slate-500">Clique em uma linha: simulação se aprovada; motivo da recusa se recusada.</p>
    <div id="nota-recebivel-banner" class="nota-recebivel-banner" hidden role="status" aria-live="polite"></div>
    <div class="mt-3 w-full min-w-0">
      <table class="notes-table w-full divide-y divide-slate-200 text-left text-sm">
        <colgroup>
          <col class="col-nota" />
          <col class="col-sacado" />
          <col class="col-vencimento" />
          <col class="col-valor" />
          <col class="col-status" />
        </colgroup>
        <thead class="bg-slate-50">
          <tr>
            <th scope="col" class="px-4 py-3 font-semibold text-slate-700">Nota</th>
            <th scope="col" class="px-4 py-3 font-semibold text-slate-700">Sacado</th>
            <th scope="col" class="px-4 py-3 font-semibold text-slate-700">Vencimento</th>
            <th scope="col" class="px-4 py-3 text-right font-semibold text-slate-700">Valor</th>
            <th scope="col" class="px-4 py-3 font-semibold text-slate-700">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">${rows}</tbody>
      </table>
    </div>
  `;

  const banner = container.querySelector("#nota-recebivel-banner");
  const tbody = container.querySelector("tbody");

  function selecionarLinha(tr) {
    container.querySelectorAll(".nota-row--selected").forEach((el) => {
      el.classList.remove("nota-row--selected");
    });
    tr.classList.add("nota-row--selected");
  }

  function aoEscolherNota(tr) {
    const index = Number(tr.dataset.notaIndex);
    const nota = lista[index];
    if (!nota || !banner) return;
    selecionarLinha(tr);
    mostrarBannerNota(banner, nota);
  }

  tbody?.addEventListener("click", (e) => {
    const tr = e.target.closest("tr.nota-row");
    if (tr) aoEscolherNota(tr);
  });

  tbody?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const tr = e.target.closest("tr.nota-row");
    if (!tr) return;
    e.preventDefault();
    aoEscolherNota(tr);
  });
}
