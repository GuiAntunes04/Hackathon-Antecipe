import { URL_VALIDAR, URL_VALIDAR_DEMO, urlValidarLote } from "../config.js";

/**
 * @param {string} body
 * @param {string} fallback
 */
function mensagemErroApi(body, fallback) {
  if (!body) return fallback;
  try {
    const data = JSON.parse(body);
    const detail = data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  } catch {
    /* corpo não-JSON */
  }
  return body.length > 200 ? `${body.slice(0, 200)}…` : body;
}

/**
 * @param {Response} resp
 * @param {string} fallback
 */
async function parseJsonOuErro(resp, fallback) {
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(mensagemErroApi(text, fallback));
  }
  return resp.json();
}

/**
 * Envia CSV; valida o arquivo inteiro e devolve todas as notas de uma vez.
 * @param {File} file
 */
export async function postValidar(file) {
  const body = new FormData();
  body.append("arquivo", file);

  const resp = await fetch(URL_VALIDAR, { method: "POST", body });
  return parseJsonOuErro(resp, resp.statusText);
}

/**
 * Recarrega o lote completo já validado (sem paginação na API).
 * @param {string} jobId
 */
export async function getValidarLote(jobId) {
  const resp = await fetch(urlValidarLote(jobId));
  return parseJsonOuErro(resp, resp.statusText);
}

/**
 * Lote de demonstração (disponível quando o servidor está com MOCK_VALIDACAO).
 * @returns {Promise<{ total_a_receber?: number, notas?: Array<object> } | null>}
 */
export async function getValidacaoDemo() {
  const resp = await fetch(URL_VALIDAR_DEMO);
  if (resp.status === 404) return null;
  return parseJsonOuErro(resp, resp.statusText);
}
