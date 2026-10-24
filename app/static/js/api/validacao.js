import { URL_VALIDAR, URL_VALIDAR_DEMO } from "../config.js";

/**
 * Envia CSV para validação.
 * @param {File} file
 * @returns {Promise<{ total_a_receber?: number, notas?: Array<object> }>}
 */
export async function postValidar(file) {
  const body = new FormData();
  body.append("arquivo", file);

  const resp = await fetch(URL_VALIDAR, { method: "POST", body });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || resp.statusText);
  }
  return resp.json();
}

/**
 * Lote de demonstração (disponível quando o servidor está com MOCK_VALIDACAO).
 * @returns {Promise<{ total_a_receber?: number, notas?: Array<object> } | null>}
 */
export async function getValidacaoDemo() {
  const resp = await fetch(URL_VALIDAR_DEMO);
  if (resp.status === 404) return null;
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || resp.statusText);
  }
  return resp.json();
}
