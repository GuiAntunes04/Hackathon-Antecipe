/** URLs e constantes da aplicação. */
export const URL_VALIDAR = "/validar";
export const URL_VALIDAR_DEMO = "/validar/demo";
export const TAMANHO_PAGINA = 10;
export const TAMANHOS_PAGINA = [10, 20, 50];
/** Quantidade de números de página visíveis na janela central (além de 1 e última, se houver reticências). */
export const PAGINACAO_JANELA_NUMEROS = 6;
export const FILTRO_TODAS = "todas";
/** @type {readonly ["todas", "aprovada", "recusada"]} */
export const FILTROS_STATUS = ["todas", "aprovada", "recusada"];

/** @param {string} jobId */
export function urlValidarLote(jobId) {
  return `/validar/lote/${encodeURIComponent(jobId)}`;
}
