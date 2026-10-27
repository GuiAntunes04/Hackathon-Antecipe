import { t } from "../../i18n.js";
import { escapeHtml } from "../../lib/format.js";
import { htmlSufixoSacadosHero } from "./dashboard-sacado-combobox.js";

export function htmlTabFinanceiro(fin, serieMeses, sacadosFiltrados = []) {
  const chartVazio = serieMeses.length === 0;
  const sufixoSacados = htmlSufixoSacadosHero(sacadosFiltrados);

  return `
    <div class="dashboard-view dashboard-view--financial dashboard-carousel__slide dashboard-carousel__slide--financial" id="dashboard-panel-0" role="tabpanel" aria-labelledby="dashboard-tab-0" tabindex="0">
      <div class="dashboard-resumo__inner dashboard-resumo__inner--financial" role="group" aria-label="${t("dashboard.financialRegion")}">
        ${
          !fin.temAprovadas
            ? `<p class="dashboard-resumo__empty dashboard-resumo__empty--financial">${t("dashboard.financialEmpty")}</p>`
            : `
        <div class="dashboard-financeiro">
          <header class="dashboard-financeiro__hero">
            <p class="dashboard-financeiro__hero-label">${t("dashboard.totalReceive")}${sufixoSacados}</p>
            <p class="dashboard-financeiro__hero-value tabular-nums">${escapeHtml(fin.totalReceber)}</p>
            <p class="dashboard-financeiro__hero-hint">${t("dashboard.totalReceiveHint")}</p>
          </header>
          <div class="dashboard-financeiro__body">
          <div class="dashboard-financeiro__totals">
            <article class="dashboard-financeiro__kpi">
              <p class="dashboard-financeiro__label">${t("dashboard.financialGross")}</p>
              <p class="dashboard-financeiro__value tabular-nums">${escapeHtml(fin.totalBruto)}</p>
            </article>
            <article class="dashboard-financeiro__kpi">
              <p class="dashboard-financeiro__label">${t("dashboard.financialNet")}</p>
              <p class="dashboard-financeiro__value tabular-nums">${escapeHtml(fin.totalLiquido)}</p>
            </article>
          </div>
          <div class="dashboard-financeiro__highlights">
            <article class="dashboard-financeiro__highlight">
              <p class="dashboard-financeiro__label">${t("dashboard.financialTopDrawee")}</p>
              <p class="dashboard-financeiro__highlight-name">${escapeHtml(fin.sacadoTop.nome)}</p>
              <p class="dashboard-financeiro__highlight-value tabular-nums">${escapeHtml(fin.sacadoTop.valor)}</p>
            </article>
            <article class="dashboard-financeiro__highlight dashboard-financeiro__highlight--note">
              <p class="dashboard-financeiro__label">${t("dashboard.financialTopNote")}</p>
              <p class="dashboard-financeiro__highlight-name">${escapeHtml(fin.notaTop.doc)}</p>
              <p class="dashboard-financeiro__highlight-meta">
                <span>${escapeHtml(fin.notaTop.sacado)}</span>
                <span class="dashboard-financeiro__highlight-sep" aria-hidden="true">·</span>
                <span class="tabular-nums">${escapeHtml(fin.notaTop.vencimento)}</span>
              </p>
              <p class="dashboard-financeiro__highlight-value tabular-nums">${escapeHtml(fin.notaTop.valor)}</p>
            </article>
          </div>
          <figure class="dashboard-resumo__chart-box dashboard-resumo__chart-box--wide dashboard-financeiro__chart">
            <figcaption class="dashboard-resumo__chart-title">${t("dashboard.monthlyChart")}</figcaption>
            ${
              chartVazio
                ? `<p class="dashboard-resumo__empty dashboard-resumo__empty--inline">${t("dashboard.monthlyEmpty")}</p>`
                : `
            <div class="dashboard-resumo__chart-canvas-wrap dashboard-resumo__chart-canvas-wrap--line">
              <canvas data-chart="monthly" aria-label="${t("dashboard.monthlyChart")}"></canvas>
            </div>`
            }
          </figure>
          </div>
        </div>`
        }
      </div>
    </div>`;
}
