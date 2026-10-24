/** @typedef {"pt-BR" | "en-US"} LocaleId */

const STORAGE_KEY = "antecipe-locale";

/** @type {Record<LocaleId, Record<string, string>>} */
const MESSAGES = {
  "pt-BR": {
    "app.title": "Portal Antecipe",
    "lang.switch": "Trocar idioma",
    "lang.pt": "Português",
    "lang.en": "English",
    "upload.heading": "Enviar lote",
    "upload.hint": "Formato: separador ;, datas dd/mm/aaaa.",
    "upload.fileLabel": "Arquivo CSV",
    "upload.submit": "Validar",
    "upload.newBatch": "← Novo lote",
    "upload.tab": "Enviar lote",
    "results.tab": "Resultados",
    "status.validating": "Validando arquivo…",
    "status.done": "Validação concluída.",
    "status.errorPrefix": "Erro: ",
    "status.errorGeneric": "Não foi possível validar o arquivo. Tente novamente.",
    "toast.close": "Fechar",
    "status.loadPageError": "Erro ao carregar página: ",
    "dashboard.region": "Resumo da validação",
    "dashboard.heading": "Resumo do lote",
    "dashboard.totalReceive": "Total a receber",
    "dashboard.distribution": "Distribuição",
    "dashboard.qtyByStatus": "Quantidade por status",
    "dashboard.validated": "Validadas",
    "dashboard.approved": "Aprovadas",
    "dashboard.rejected": "Recusadas",
    "dashboard.chartDonut": "Gráfico de rosca: aprovadas e recusadas",
    "dashboard.chartBar": "Gráfico de barras: aprovadas e recusadas",
    "dashboard.caption": "Totais da validação",
    "dashboard.srValidated": "Notas validadas",
    "dashboard.nextSlide": "Próximo painel",
    "dashboard.prevSlide": "Painel anterior",
    "dashboard.monthlyRegion": "Evolução mensal",
    "dashboard.monthlyHeading": "Evolução por mês",
    "dashboard.monthlySubtitle": "Total a receber das aprovadas, por mês de vencimento",
    "dashboard.monthlyChart": "Variação ao longo dos meses",
    "dashboard.monthlySeries": "Total a receber",
    "dashboard.monthlyNotesShort": "notas",
    "dashboard.monthlyEmpty": "Sem datas de vencimento nas notas aprovadas.",
    "dashboard.errorsRegion": "Motivos de recusa",
    "dashboard.errorsHeading": "Erros do lote",
    "dashboard.errorsSubtitle": "Recusas agrupadas por motivo",
    "dashboard.errorsChart": "Quantidade por motivo",
    "dashboard.errorsEmpty": "Nenhuma nota recusada neste lote.",
    "dashboard.errorsUnknown": "Motivo não informado",
    "dashboard.errorsNotesShort": "notas",
    "chart.approved": "Aprovadas",
    "chart.rejected": "Recusadas",
    "chart.notes": "Notas",
    "chart.noteCount": " nota(s)",
    "table.note": "Nota",
    "table.drawee": "Sacado",
    "table.due": "Vencimento",
    "table.value": "Valor",
    "table.status": "Status",
    "table.statusApproved": "Aprovada",
    "table.statusRejected": "Recusada",
    "table.emptyFilter": "Nenhuma nota neste filtro.",
    "table.filterGroup": "Filtrar notas por status",
    "table.filterStatusLabel": "Status",
    "table.filterAll": "Todas",
    "table.filterApproved": "Aceitas",
    "table.filterRejected": "Recusadas",
    "table.ariaReject": "Ver motivo da recusa da nota {doc}",
    "table.ariaReceive": "Ver quanto receber pela nota {doc}",
    "table.pagination": "Paginação das notas",
    "table.prev": "Anterior",
    "table.next": "Próxima",
    "table.pageNumbers": "Números de página",
    "table.show": "Mostrar",
    "table.showPerPage": "Mostrar notas por página",
    "table.loadingPage": "Carregando página…",
    "table.searchNote": "Pesquisar nota",
    "table.searchPlaceholder": "Número da nota…",
    "table.dateStart": "Data início",
    "table.dateEnd": "Data fim",
    "table.toolbarConsulta": "Pesquisa e período de vencimento",
    "banner.rejectTitle": "Recusa NF {doc}",
    "banner.simTitle": "Simulação NF {doc}",
    "banner.noReason": "Motivo não informado.",
  },
  "en-US": {
    "app.title": "Antecipe Portal",
    "lang.switch": "Change language",
    "lang.pt": "Português",
    "lang.en": "English",
    "upload.heading": "Upload batch",
    "upload.hint": "Format: semicolon delimiter; dates dd/mm/yyyy.",
    "upload.fileLabel": "CSV file",
    "upload.submit": "Validate",
    "upload.newBatch": "← New batch",
    "upload.tab": "Upload batch",
    "results.tab": "Results",
    "status.validating": "Validating file…",
    "status.done": "Validation complete.",
    "status.errorPrefix": "Error: ",
    "status.errorGeneric": "Could not validate the file. Please try again.",
    "toast.close": "Close",
    "status.loadPageError": "Error loading page: ",
    "dashboard.region": "Validation summary",
    "dashboard.heading": "Batch summary",
    "dashboard.totalReceive": "Total receivable",
    "dashboard.distribution": "Distribution",
    "dashboard.qtyByStatus": "Count by status",
    "dashboard.validated": "Validated",
    "dashboard.approved": "Approved",
    "dashboard.rejected": "Rejected",
    "dashboard.chartDonut": "Doughnut chart: approved and rejected",
    "dashboard.chartBar": "Bar chart: approved and rejected",
    "dashboard.caption": "Validation totals",
    "dashboard.srValidated": "Notes validated",
    "dashboard.nextSlide": "Next panel",
    "dashboard.prevSlide": "Previous panel",
    "dashboard.monthlyRegion": "Monthly trend",
    "dashboard.monthlyHeading": "Month-over-month",
    "dashboard.monthlySubtitle": "Receivable total for approved notes, by due month",
    "dashboard.monthlyChart": "Change over months",
    "dashboard.monthlySeries": "Total receivable",
    "dashboard.monthlyNotesShort": "notes",
    "dashboard.monthlyEmpty": "No due dates on approved notes.",
    "dashboard.errorsRegion": "Rejection reasons",
    "dashboard.errorsHeading": "Batch errors",
    "dashboard.errorsSubtitle": "Rejections grouped by reason",
    "dashboard.errorsChart": "Count by reason",
    "dashboard.errorsEmpty": "No rejected notes in this batch.",
    "dashboard.errorsUnknown": "Reason not provided",
    "dashboard.errorsNotesShort": "notes",
    "chart.approved": "Approved",
    "chart.rejected": "Rejected",
    "chart.notes": "Notes",
    "chart.noteCount": " note(s)",
    "table.note": "Note",
    "table.drawee": "Drawee",
    "table.due": "Due date",
    "table.value": "Amount",
    "table.status": "Status",
    "table.statusApproved": "Approved",
    "table.statusRejected": "Rejected",
    "table.emptyFilter": "No notes match this filter.",
    "table.filterGroup": "Filter notes by status",
    "table.filterStatusLabel": "Status",
    "table.filterAll": "All",
    "table.filterApproved": "Approved",
    "table.filterRejected": "Rejected",
    "table.ariaReject": "View rejection reason for note {doc}",
    "table.ariaReceive": "View receivable amount for note {doc}",
    "table.pagination": "Notes pagination",
    "table.prev": "Previous",
    "table.next": "Next",
    "table.pageNumbers": "Page numbers",
    "table.show": "Show",
    "table.showPerPage": "Notes per page",
    "table.loadingPage": "Loading page…",
    "table.searchNote": "Search note",
    "table.searchPlaceholder": "Note number…",
    "table.dateStart": "Start date",
    "table.dateEnd": "End date",
    "table.toolbarConsulta": "Search and due date range",
    "banner.rejectTitle": "Rejected invoice {doc}",
    "banner.simTitle": "Simulation invoice {doc}",
    "banner.noReason": "Reason not provided.",
  },
};

/** @type {LocaleId[]} */
export const LOCALES = ["pt-BR", "en-US"];

/** @type {Set<(locale: LocaleId) => void>} */
const listeners = new Set();

/** @returns {LocaleId} */
export function getLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en-US" || stored === "pt-BR") return stored;
  } catch {
    /* storage indisponível */
  }
  const nav = navigator.language || "pt-BR";
  return nav.toLowerCase().startsWith("en") ? "en-US" : "pt-BR";
}

/** @param {LocaleId} next */
export function setLocale(next) {
  if (!LOCALES.includes(next)) return;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  applyDocumentLocale();
  listeners.forEach((fn) => fn(next));
}

/**
 * @param {string} key
 * @param {Record<string, string | number>} [vars]
 */
export function t(key, vars) {
  const locale = getLocale();
  let text = MESSAGES[locale][key] ?? MESSAGES["pt-BR"][key] ?? key;
  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    });
  }
  return text;
}

/** @param {(locale: LocaleId) => void} fn */
export function onLocaleChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function applyDocumentLocale() {
  document.documentElement.lang = getLocale();
  document.title = t("app.title");
}
