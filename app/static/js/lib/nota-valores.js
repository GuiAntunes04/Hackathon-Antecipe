import { formatMoney } from "./format.js";

/** Desconto fixo da simulação na UI (2% sobre o nominal). */
export const DESCONTO_SIMULACAO_PERCENTUAL = 2;

/** @param {unknown} value */
function parseNumeroNota(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const bruto = String(value).trim();
  let normalizado = bruto;
  if (bruto.includes(",") && bruto.includes(".")) {
    normalizado = bruto.replace(/\./g, "").replace(",", ".");
  } else {
    normalizado = bruto.replace(",", ".");
  }
  const num = Number(normalizado);
  return Number.isFinite(num) ? num : null;
}

/**
 * Valor nominal da nota (coluna da tabela).
 * @param {object | null | undefined} nota
 * @returns {string}
 */
export function formatValorNominalNota(nota) {
  if (!nota) return "—";
  const nominal = parseNumeroNota(nota.valor_bruto ?? nota.valor_nominal);
  if (nominal == null) return "—";
  return formatMoney(nominal);
}

/**
 * @param {object | null | undefined} nota
 * @returns {number | null}
 */
export function calcularValorLiquidoSimulado(nota) {
  const nominal = parseNumeroNota(nota?.valor_bruto ?? nota?.valor_nominal);
  if (nominal == null) return null;
  const fator = 1 - DESCONTO_SIMULACAO_PERCENTUAL / 100;
  return Math.round(nominal * fator * 100) / 100;
}

/**
 * Simulação no banner: nominal menos 2%.
 * @param {object | null | undefined} nota
 * @returns {string}
 */
export function formatValorLiquidoSimulado(nota) {
  const liquido = calcularValorLiquidoSimulado(nota);
  if (liquido == null) return "—";
  return formatMoney(liquido);
}

/** @deprecated use formatValorNominalNota */
export function formatValorBrutoNota(nota) {
  return formatValorNominalNota(nota);
}
