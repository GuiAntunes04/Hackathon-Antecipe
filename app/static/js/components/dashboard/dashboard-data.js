import { getLocale, t } from "../../i18n.js";
import { formatMoney } from "../../lib/format.js";

/**
 * @param {unknown} valor
 */
export function parseValorNumerico(valor) {
  if (valor == null || valor === "") return 0;
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
  const num = Number(String(valor).replace(",", "."));
  return Number.isFinite(num) ? num : 0;
}

/**
 * @param {string} texto
 * @param {number} [max]
 */
export function rotuloMotivoCurto(texto, max = 42) {
  const s = String(texto ?? "").trim();
  if (!s) return t("dashboard.errorsUnknown");
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

/**
 * @param {object[]} notas
 * @param {number | null | undefined} totalAReceberApi
 */
export function calcularResumoFinanceiro(notas, totalAReceberApi) {
  let totalBruto = 0;
  let totalLiquido = 0;
  /** @type {Map<string, number>} */
  const volumePorSacado = new Map();
  /** @type {object | null} */
  let notaMaiorLiquido = null;
  let maiorLiquido = -Infinity;

  for (const nota of notas || []) {
    if (String(nota.status ?? "").toLowerCase() !== "aprovada") continue;
    const nominal = parseValorNumerico(nota.valor_nominal);
    const liquido = parseValorNumerico(nota.valor_liquido);
    totalBruto += nominal;
    totalLiquido += liquido;

    const sacado = String(nota.nome_sacado ?? "").trim() || t("dashboard.finUnknownDrawee");
    volumePorSacado.set(sacado, (volumePorSacado.get(sacado) ?? 0) + nominal);

    if (liquido > maiorLiquido) {
      maiorLiquido = liquido;
      notaMaiorLiquido = nota;
    }
  }

  let sacadoTopNome = "—";
  let sacadoTopValor = 0;
  for (const [nome, vol] of volumePorSacado) {
    if (vol > sacadoTopValor) {
      sacadoTopValor = vol;
      sacadoTopNome = nome;
    }
  }

  const receberNum =
    totalAReceberApi != null && Number.isFinite(Number(totalAReceberApi))
      ? Number(totalAReceberApi)
      : totalLiquido;

  return {
    totalReceber: formatMoney(receberNum),
    totalBruto: formatMoney(totalBruto),
    totalLiquido: formatMoney(totalLiquido),
    sacadoTop: {
      nome: sacadoTopNome,
      valor: sacadoTopValor > 0 ? formatMoney(sacadoTopValor) : "—",
    },
    notaTop: notaMaiorLiquido
      ? {
          doc: String(notaMaiorLiquido.nu_documento ?? notaMaiorLiquido.linha ?? "—"),
          sacado:
            String(notaMaiorLiquido.nome_sacado ?? "").trim() || t("dashboard.finUnknownDrawee"),
          vencimento: String(notaMaiorLiquido.data_vencimento ?? "").trim() || "—",
          valor: formatMoney(notaMaiorLiquido.valor_liquido),
        }
      : { doc: "—", sacado: "—", vencimento: "—", valor: "—" },
    temAprovadas: totalBruto > 0 || totalLiquido > 0 || receberNum > 0,
  };
}

/**
 * @param {string | undefined} dataVencimento
 */
function parseMesVencimento(dataVencimento) {
  if (!dataVencimento || typeof dataVencimento !== "string") return null;
  const partes = dataVencimento.trim().split("/");
  if (partes.length !== 3) return null;
  const dia = Number(partes[0]);
  const mes = Number(partes[1]);
  const ano = Number(partes[2]);
  if (!Number.isFinite(dia) || !Number.isFinite(mes) || !Number.isFinite(ano)) return null;
  if (mes < 1 || mes > 12) return null;
  return {
    year: ano,
    month: mes,
    key: `${ano}-${String(mes).padStart(2, "0")}`,
  };
}

/** @param {number} year @param {number} month */
export function rotuloMes(year, month) {
  const d = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat(getLocale(), { month: "short", year: "numeric" }).format(d);
}

/** @param {object[]} notas */
export function agregarTotaisPorMes(notas) {
  /** @type {Map<string, { year: number, month: number, total: number, qtd: number }>} */
  const map = new Map();

  for (const nota of notas || []) {
    if (String(nota.status ?? "").toLowerCase() !== "aprovada") continue;
    const parsed = parseMesVencimento(nota.data_vencimento);
    if (!parsed) continue;
    const valor = parseValorNumerico(nota.valor_liquido);

    const atual = map.get(parsed.key) ?? {
      year: parsed.year,
      month: parsed.month,
      total: 0,
      qtd: 0,
    };
    atual.total += valor;
    atual.qtd += 1;
    map.set(parsed.key, atual);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}

/**
 * @param {object[]} notas
 */
export function agregarMotivosRecusa(notas) {
  /** @type {Map<string, number>} */
  const map = new Map();

  for (const nota of notas || []) {
    if (String(nota.status ?? "").toLowerCase() !== "recusada") continue;
    const bruto = String(nota.motivo ?? "").trim();
    const chave = bruto || t("dashboard.errorsUnknown");
    map.set(chave, (map.get(chave) ?? 0) + 1);
  }

  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([motivo, qtd]) => ({ motivo, qtd }));
}

/**
 * @param {object[]} notas
 * @param {{ total_linhas?: number, aprovadas?: number, recusadas?: number }} resumo
 */
export function calcularPainelRecusadas(notas, resumo) {
  const totalLinhas =
    typeof resumo.total_linhas === "number" ? resumo.total_linhas : 0;
  const aprovadas = typeof resumo.aprovadas === "number" ? resumo.aprovadas : 0;
  const recusadas = typeof resumo.recusadas === "number" ? resumo.recusadas : 0;
  const pctRecusadas =
    totalLinhas > 0 ? Math.round((recusadas / totalLinhas) * 100) : 0;

  /** @type {Map<string, number>} */
  const recusasPorSacado = new Map();
  /** @type {object | null} */
  let notaMaiorValor = null;
  let maiorValor = -Infinity;
  let totalPerdidoNum = 0;

  for (const nota of notas || []) {
    if (String(nota.status ?? "").toLowerCase() !== "recusada") continue;

    const sacado =
      String(nota.nome_sacado ?? "").trim() || t("dashboard.finUnknownDrawee");
    recusasPorSacado.set(sacado, (recusasPorSacado.get(sacado) ?? 0) + 1);

    const valor = parseValorNumerico(nota.valor_nominal ?? nota.valor_liquido);
    totalPerdidoNum += valor;
    if (valor > maiorValor) {
      maiorValor = valor;
      notaMaiorValor = nota;
    }
  }

  const sacadosTop = [...recusasPorSacado.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([nome, qtd]) => ({ nome, qtd }));

  return {
    totalLinhas,
    aprovadas,
    recusadas,
    pctRecusadas,
    totalPerdido:
      totalPerdidoNum > 0 ? formatMoney(totalPerdidoNum) : formatMoney(0),
    sacadosTop,
    notaTop: notaMaiorValor
      ? {
          doc: String(notaMaiorValor.nu_documento ?? notaMaiorValor.linha ?? "—"),
          sacado:
            String(notaMaiorValor.nome_sacado ?? "").trim() ||
            t("dashboard.finUnknownDrawee"),
          vencimento: String(notaMaiorValor.data_vencimento ?? "").trim() || "—",
          valor: formatMoney(maiorValor),
          motivo: rotuloMotivoCurto(notaMaiorValor.motivo, 64),
        }
      : {
          doc: "—",
          sacado: "—",
          vencimento: "—",
          valor: "—",
          motivo: "—",
        },
  };
}
