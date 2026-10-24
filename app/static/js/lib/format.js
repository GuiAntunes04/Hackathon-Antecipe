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
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
