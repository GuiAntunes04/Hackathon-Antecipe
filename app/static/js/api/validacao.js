import { TAMANHO_PAGINA, URL_VALIDAR, URL_VALIDAR_DEMO, urlValidarLote } from "../config.js";

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
 * Envia CSV; valida o arquivo inteiro e devolve a primeira página (ou `pagina` informada).
 * @param {File} file
 * @param {{ pagina?: number, tamanhoPagina?: number, filtroStatus?: string }} [opts]
 */
export async function postValidar(file, opts = {}) {
  const pagina = opts.pagina ?? 1;
  const tamanho = opts.tamanhoPagina ?? TAMANHO_PAGINA;
  const params = new URLSearchParams({
    pagina: String(pagina),
    tamanho_pagina: String(tamanho),
  });
  if (opts.filtroStatus && opts.filtroStatus !== "todas") {
    params.set("status", opts.filtroStatus);
  }

  const body = new FormData();
  body.append("arquivo", file);

  const resp = await fetch(`${URL_VALIDAR}?${params}`, { method: "POST", body });
  return parseJsonOuErro(resp, resp.statusText);
}

/**
 * Carrega uma página de um lote já validado.
 * @param {string} jobId
 * @param {number} pagina
 * @param {number} [tamanhoPagina]
 * @param {string} [filtroStatus]
 */
export async function getValidarPagina(
  jobId,
  pagina,
  tamanhoPagina = TAMANHO_PAGINA,
  filtroStatus = "todas"
) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    tamanho_pagina: String(tamanhoPagina),
  });
  if (filtroStatus && filtroStatus !== "todas") {
    params.set("status", filtroStatus);
  }
  const resp = await fetch(`${urlValidarLote(jobId)}?${params}`);
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
