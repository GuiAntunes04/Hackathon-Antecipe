import { getLocale } from "../i18n.js";

/**
 * Escapa HTML para uso seguro em strings de template.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  const el = document.createElement("span");
  el.textContent = value == null ? "" : String(value);
  return el.innerHTML;
}

/**
 * Formata valor monetário em BRL.
 * @param {unknown} value
 * @returns {string}
 */
export function formatMoney(value) {
  if (value == null || value === "") {
    return "—";
  }
  const num = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (Number.isNaN(num)) {
    return String(value);
  }
  return num.toLocaleString(getLocale(), { style: "currency", currency: "BRL" });
}

/**
 * @param {string | undefined | null} dataVencimento dd/mm/aaaa
 * @returns {Date | null}
 */
export function parseDataVencimentoBR(dataVencimento) {
  if (!dataVencimento || typeof dataVencimento !== "string") return null;
  const partes = dataVencimento.trim().split("/");
  if (partes.length !== 3) return null;
  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  const ano = Number(partes[2]);
  if (!Number.isFinite(dia) || !Number.isFinite(mes) || !Number.isFinite(ano)) return null;
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  const d = new Date(ano, mes - 1, dia);
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return null;
  return d;
}

/**
 * @param {string | undefined | null} iso yyyy-mm-dd (input type=date)
 * @returns {Date | null}
 */
export function parseIsoDate(iso) {
  if (!iso || typeof iso !== "string") return null;
  const partes = iso.split("-");
  if (partes.length !== 3) return null;
  const ano = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);
  if (!Number.isFinite(dia) || !Number.isFinite(mes) || !Number.isFinite(ano)) return null;
  return new Date(ano, mes - 1, dia);
}
