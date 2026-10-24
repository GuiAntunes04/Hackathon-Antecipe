import { t } from "../../i18n.js";
import { escapeHtml } from "../../lib/format.js";
import { htmlSufixoSacadosHero } from "./dashboard-sacado-combobox.js";

export function htmlTabRecusadas(dados, serieErros, sacadosFiltrados = []) {
  const sufixoSacados = htmlSufixoSacadosHero(sacadosFiltrados);
  const listaSacados =
    dados.sacadosTop.length > 0
      ? `<ol class="dashboard-recusadas__rank">
          ${dados.sacadosTop
            .map(
              (e, i) => `
            <li class="dashboard-recusadas__rank-item">
              <span class="dashboard-recusadas__rank-pos" aria-hidden="true">${i + 1}</span>
              <span class="dashboard-recusadas__rank-name">${escapeHtml(e.nome)}</span>
              <span class="dashboard-recusadas__rank-qty tabular-nums">${e.qtd}</span>
            </li>`
            )
            .join("")}
        </ol>`
      : `<p class="dashboard-recusadas__empty">${t("dashboard.errorsEmpty")}</p>`;

  const blocoMotivos =
    serieErros.length > 0
      ? `
        <figure class="dashboard-recusadas__motivos">
          <figcaption class="dashboard-recusadas__caption">${t("dashboard.errorsChart")}</figcaption>
          <div class="dashboard-recusadas__motivos-canvas">
            <canvas data-chart="errors" aria-label="${t("dashboard.errorsChart")}"></canvas>
          </div>
        </figure>`
      : `<p class="dashboard-recusadas__empty dashboard-recusadas__empty--motivos">${t("dashboard.errorsEmpty")}</p>`;

  return `
    <div class="dashboard-view dashboard-view--rejected dashboard-carousel__slide dashboard-carousel__slide--recusadas" id="dashboard-panel-1" role="tabpanel" aria-labelledby="dashboard-tab-1" tabindex="0">
      <div class="dashboard-recusadas" role="region" aria-label="${t("dashboard.rejectedSummaryRegion")}">
        <header class="dashboard-recusadas__hero">
          <p class="dashboard-recusadas__hero-label">${t("dashboard.totalLost")}${sufixoSacados}</p>
          <p class="dashboard-recusadas__hero-value tabular-nums">${escapeHtml(dados.totalPerdido)}</p>
          <p class="dashboard-recusadas__hero-hint">${t("dashboard.totalLostHint")}</p>
        </header>
        <div class="dashboard-recusadas__body">
          <section class="dashboard-recusadas__overview" aria-label="${t("dashboard.distribution")}">
            <figure class="dashboard-recusadas__donut">
              <figcaption class="dashboard-recusadas__caption">${t("dashboard.distribution")}</figcaption>
              <div class="dashboard-recusadas__donut-canvas">
                <canvas data-chart="doughnut" aria-label="${t("dashboard.chartDonut")}"></canvas>
              </div>
            </figure>
            <div class="dashboard-recusadas__overview-meta">
              <div class="dashboard-recusadas__kpis">
                <article class="dashboard-recusadas__kpi">
                  <p class="dashboard-recusadas__kpi-label">${t("dashboard.totalNotes")}</p>
                  <p class="dashboard-recusadas__kpi-value tabular-nums">${dados.totalLinhas}</p>
                </article>
                <article class="dashboard-recusadas__kpi dashboard-recusadas__kpi--danger">
                  <p class="dashboard-recusadas__kpi-label">${t("dashboard.rejectedNotes")}</p>
                  <p class="dashboard-recusadas__kpi-value tabular-nums">${dados.recusadas}</p>
                </article>
              </div>
              <p class="dashboard-recusadas__pct tabular-nums">
                ${t("dashboard.pctRejected", { pct: String(dados.pctRecusadas) })}
              </p>
            </div>
          </section>
          <section class="dashboard-recusadas__split">
            <div class="dashboard-recusadas__stack">
              <div class="dashboard-recusadas__block dashboard-recusadas__rank-wrap">
                <p class="dashboard-recusadas__caption">${t("dashboard.topRejectedDrawees")}</p>
                ${listaSacados}
              </div>
              <article class="dashboard-recusadas__block dashboard-recusadas__card dashboard-recusadas__card--note">
                <p class="dashboard-recusadas__kpi-label">${t("dashboard.rejectedTopNote")}</p>
                <p class="dashboard-recusadas__card-title">${escapeHtml(dados.notaTop.doc)}</p>
                <p class="dashboard-recusadas__card-meta">
                  <span>${escapeHtml(dados.notaTop.sacado)}</span>
                  <span aria-hidden="true">·</span>
                  <span class="tabular-nums">${escapeHtml(dados.notaTop.vencimento)}</span>
                </p>
                <p class="dashboard-recusadas__card-value tabular-nums">${escapeHtml(dados.notaTop.valor)}</p>
                ${
                  dados.notaTop.motivo && dados.notaTop.motivo !== "—"
                    ? `<p class="dashboard-recusadas__card-motivo">${escapeHtml(dados.notaTop.motivo)}</p>`
                    : ""
                }
              </article>
            </div>
            <div class="dashboard-recusadas__block dashboard-recusadas__motivos-wrap">
              ${blocoMotivos}
            </div>
          </section>
        </div>
      </div>
    </div>`;
}
