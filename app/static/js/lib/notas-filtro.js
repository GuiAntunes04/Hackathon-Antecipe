import { FILTRO_TODAS, TAMANHO_PAGINA } from "../config.js";
import { parseDataVencimentoBR, parseIsoDate } from "./format.js";

/** @param {string[] | string | undefined | null} sacadosFiltro */
export function normalizarSacadosFiltro(sacadosFiltro) {
  if (Array.isArray(sacadosFiltro)) {
    return sacadosFiltro.map((s) => String(s).trim()).filter(Boolean);
  }
  const legado = String(sacadosFiltro ?? "").trim();
  return legado ? [legado] : [];
}

/** @param {object[]} notas @param {string[] | string | undefined | null} sacadosFiltro */
export function filtrarNotasPorSacado(notas, sacadosFiltro) {
  const lista = normalizarSacadosFiltro(sacadosFiltro);
  if (lista.length === 0) return notas;
  const permitidos = new Set(lista.map((s) => s.toLowerCase()));
  return notas.filter((n) =>
    permitidos.has(
      String(n.nome_sacado ?? "")
        .trim()
        .toLowerCase()
    )
  );
}

/** @param {object[]} notas @param {string} filtro */
export function filtrarNotasPorStatus(notas, filtro) {
  if (filtro === FILTRO_TODAS) return notas;
  return notas.filter((n) => String(n.status || "").toLowerCase() === filtro);
}

/**
 * @param {object[]} notas
 * @param {{ sacadosFiltrados?: string[], filtroStatus?: string, buscaNota?: string, dataInicio?: string, dataFim?: string, mes?: string }} consulta
 */
export function filtrarNotasConsultaTabela(notas, consulta) {
  let out = filtrarNotasPorSacado(notas, consulta.sacadosFiltrados);
  out = filtrarNotasPorStatus(out, consulta.filtroStatus ?? FILTRO_TODAS);
  const q = String(consulta.buscaNota ?? "")
    .trim()
    .toLowerCase();
  if (q) {
    out = out.filter((n) => {
      const doc = String(n.nu_documento ?? n.linha ?? "").toLowerCase();
      return doc.includes(q);
    });
  }
  const mes = String(consulta.mes ?? "").trim();
  if (/^\d{4}-\d{2}$/.test(mes)) {
    out = out.filter((n) => mesVencimentoNota(n) === mes);
  }
  const inicio = parseIsoDate(consulta.dataInicio);
  const fim = parseIsoDate(consulta.dataFim);
  if (inicio || fim) {
    out = out.filter((n) => {
      const venc = parseDataVencimentoBR(n.data_vencimento);
      if (!venc) return false;
      if (inicio && venc < inicio) return false;
      if (fim && venc > fim) return false;
      return true;
    });
  }
  return out;
}

/** @param {object | null | undefined} nota @returns {string} `YYYY-MM` ou vazio */
export function mesVencimentoNota(nota) {
  const venc = parseDataVencimentoBR(nota?.data_vencimento);
  if (!venc) return "";
  return `${venc.getFullYear()}-${String(venc.getMonth() + 1).padStart(2, "0")}`;
}

/** @param {object[]} notas @returns {string[]} meses `YYYY-MM` em ordem */
export function listarMesesVencimento(notas) {
  const meses = new Set();
  for (const nota of notas || []) {
    const mes = mesVencimentoNota(nota);
    if (mes) meses.add(mes);
  }
  return [...meses].sort();
}

/** @param {number} totalLinhas @param {number} pagina @param {number} tamanho */
export function infoPaginacaoLocal(totalLinhas, pagina, tamanho) {
  const tamanhoPagina = tamanho > 0 ? tamanho : TAMANHO_PAGINA;
  if (totalLinhas <= 0) {
    return {
      pagina: 1,
      tamanho_pagina: tamanhoPagina,
      total_paginas: 1,
      total_linhas: 0,
    };
  }
  const totalPaginas = Math.max(1, Math.ceil(totalLinhas / tamanhoPagina));
  const paginaAtual = Math.max(1, Math.min(pagina, totalPaginas));
  return {
    pagina: paginaAtual,
    tamanho_pagina: tamanhoPagina,
    total_paginas: totalPaginas,
    total_linhas: totalLinhas,
  };
}

/** @param {object[]} notas @param {number} pagina @param {number} tamanho */
export function fatiarNotasPagina(notas, pagina, tamanho) {
  const inicio = (pagina - 1) * tamanho;
  return notas.slice(inicio, inicio + tamanho);
}
