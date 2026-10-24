import { formatMoney } from "../lib/format.js";

/**
 * @param {HTMLElement} container
 * @param {{ total_a_receber?: number }} data
 */
export function renderSummary(container, data) {
  const total = formatMoney(data.total_a_receber);
  container.innerHTML = `
    <h2 class="text-lg font-semibold text-slate-900">Resultado</h2>
    <div class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3" role="status">
      <p class="text-sm text-emerald-900">
        <span class="font-semibold">Total a receber:</span>
        <span class="ml-1 text-lg font-bold tabular-nums">${total}</span>
      </p>
    </div>
  `;
}
