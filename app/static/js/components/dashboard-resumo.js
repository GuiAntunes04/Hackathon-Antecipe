import { t } from "../i18n.js";
import { escapeHtml } from "../lib/format.js";
import {
  agregarMotivosRecusa,
  agregarTotaisPorMes,
  calcularPainelRecusadas,
  calcularResumoFinanceiro,
} from "./dashboard/dashboard-data.js";
import {
  destroyDashboardCharts,
  montarGraficoMensal,
  montarGraficoMotivos,
  montarGraficoRosca,
} from "./dashboard/dashboard-charts.js";
import {
  aplicarTabDashboard,
  capturarTabAtualDashboard,
  DASHBOARD_TAB_COUNT,
  resetDashboardSlide,
  vincularAbasDashboard,
} from "./dashboard/dashboard-shell.js";
import {
  htmlBarraAbas,
  registrarSacadoRecente,
  vincularComboboxSacadoDashboard,
} from "./dashboard/dashboard-sacado-combobox.js";
import { htmlTabFinanceiro } from "./dashboard/tab-financial.js";
import { htmlTabRecusadas } from "./dashboard/tab-rejected.js";
import {
  guardarTableRootForaDoDashboard,
  htmlTabNotas,
  montarTabelaNoDashboard,
} from "./dashboard/tab-notes.js";

export { resetDashboardSlide, registrarSacadoRecente, vincularComboboxSacadoDashboard };

/**
 * @param {HTMLElement} container
 * @param {{ total_a_receber?: number | null, resumo?: { total_linhas?: number, aprovadas?: number, recusadas?: number }, notas?: object[], sacadosFiltrados?: string[], sacadosOpcoes?: string[] }} data
 */
export function renderDashboardResumo(container, data) {
  guardarTableRootForaDoDashboard(container);
  const tabAnterior = capturarTabAtualDashboard(container);
  destroyDashboardCharts(container);

  const resumo = data.resumo || {};
  const notas = data.notas || [];
  const serieErros = agregarMotivosRecusa(notas);
  const serieMeses = agregarTotaisPorMes(notas);
  const painel = calcularPainelRecusadas(notas, resumo);
  const resumoFinanceiro = calcularResumoFinanceiro(notas, data.total_a_receber);
  const tabAtivo = Math.min(tabAnterior, DASHBOARD_TAB_COUNT - 1);
  const sacadosFiltrados = data.sacadosFiltrados ?? [];

  container.innerHTML = `
    <div class="dashboard-panel">
      ${htmlBarraAbas(tabAtivo, sacadosFiltrados, data.sacadosOpcoes ?? [])}
      <div class="dashboard-carousel">
        <div class="dashboard-carousel__viewport">
          <div
            class="dashboard-carousel__track dashboard-views"
            data-active-tab="${tabAtivo}"
            data-slide="${tabAtivo}"
          >
            ${htmlTabFinanceiro(resumoFinanceiro, serieMeses, sacadosFiltrados)}
            ${htmlTabRecusadas(painel, serieErros, sacadosFiltrados)}
            ${htmlTabNotas()}
          </div>
        </div>
      </div>
    </div>
    <table class="dashboard-resumo__sr-table visually-hidden">
      <caption>${t("dashboard.caption")}</caption>
      <tbody>
        <tr><th scope="row">${t("dashboard.srValidated")}</th><td>${painel.totalLinhas}</td></tr>
        <tr><th scope="row">${t("dashboard.approved")}</th><td>${painel.aprovadas}</td></tr>
        <tr><th scope="row">${t("dashboard.rejected")}</th><td>${painel.recusadas}</td></tr>
        <tr><th scope="row">${t("dashboard.totalReceive")}</th><td>${escapeHtml(resumoFinanceiro.totalReceber)}</td></tr>
        <tr><th scope="row">${t("dashboard.pctRejectedSr")}</th><td>${painel.pctRecusadas}%</td></tr>
        <tr><th scope="row">${t("dashboard.totalLost")}</th><td>${escapeHtml(painel.totalPerdido)}</td></tr>
      </tbody>
    </table>
  `;

  if (serieMeses.length > 0) montarGraficoMensal(container, serieMeses);
  montarGraficoRosca(container, {
    aprovadas: painel.aprovadas,
    recusadas: painel.recusadas,
    totalLinhas: painel.totalLinhas,
  });
  montarGraficoMotivos(container, serieErros);

  montarTabelaNoDashboard(container);

  const panel = container.querySelector(".dashboard-panel");
  if (panel) vincularAbasDashboard(panel);
  vincularComboboxSacadoDashboard(container);
  aplicarTabDashboard(container, tabAtivo);
}
