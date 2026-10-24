import { getValidacaoDemo, postValidar } from "./api/validacao.js";
import { mountUploadPanel } from "./components/upload-panel.js";
import { renderNotesTable } from "./components/notes-table.js";
import { renderSummary } from "./components/summary.js";

const statusEl = document.getElementById("status");
const uploadRoot = document.getElementById("upload-root");
const summaryRoot = document.getElementById("summary-root");
const tableRoot = document.getElementById("table-root");

const STATUS_VARIANTS = {
  secondary:
    "rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700",
  success:
    "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800",
  danger: "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800",
};

function setStatus(message, variant = "") {
  statusEl.textContent = message;
  if (!message) {
    statusEl.className = "mt-4 empty:hidden";
    return;
  }
  const styles = STATUS_VARIANTS[variant] || STATUS_VARIANTS.secondary;
  statusEl.className = `mt-4 ${styles}`;
}

function hideResults() {
  summaryRoot.classList.add("hidden");
  tableRoot.classList.add("hidden");
}

function showResults() {
  summaryRoot.classList.remove("hidden");
  tableRoot.classList.remove("hidden");
}

function aplicarResultadoValidacao(data) {
  renderSummary(summaryRoot, data);
  renderNotesTable(tableRoot, data.notas || []);
  showResults();
}

/** Demo embutida no HTML quando o servidor está com MOCK_VALIDACAO. */
function lerDemoEmbutida() {
  const el = document.getElementById("antecipe-demo-data");
  if (!el?.textContent?.trim()) return null;
  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}

mountUploadPanel(uploadRoot, {
  async onSubmit(file) {
    setStatus("Enviando…", "secondary");
    hideResults();

    try {
      const data = await postValidar(file);
      setStatus("Validação concluída.", "success");
      aplicarResultadoValidacao(data);
    } catch (err) {
      setStatus("Erro: " + err.message, "danger");
      hideResults();
    }
  },
});

(async function carregarDemoInicial() {
  try {
    let data = lerDemoEmbutida();
    if (!data) {
      data = await getValidacaoDemo();
    }
    if (!data) return;
    aplicarResultadoValidacao(data);
    setStatus("Ambiente de teste: lote de demonstração já carregado.", "secondary");
  } catch (err) {
    setStatus("Erro ao carregar demo: " + err.message, "danger");
  }
})();
