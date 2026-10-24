import { formatMoney } from "../lib/format.js";

/** @type {WeakMap<HTMLElement, object[]>} */
const chartInstances = new WeakMap();

/** @param {HTMLElement} container */
function destroyCharts(container) {
  const list = chartInstances.get(container);
  if (list) {
    list.forEach((c) => c.destroy());
  }
  chartInstances.set(container, []);
}

/**
 * @param {number | null | undefined} total
 * @param {number | null | undefined} aprovadas
 * @returns {string}
 */
function taxaAprovacao(total, aprovadas) {
  if (total == null || total <= 0 || aprovadas == null) return "—";
  return `${Math.round((aprovadas / total) * 100)}%`;
}

/**
 * @param {HTMLElement} container
 * @param {{ aprovadas: number, recusadas: number, totalLinhas: number, taxa: string, totalReceber: string }} ctx
 */
function montarGraficos(container, ctx) {
  const ChartGlobal = window.Chart;
  if (!ChartGlobal) return;

  const doughnutCanvas = container.querySelector('[data-chart="doughnut"]');
  const barCanvas = container.querySelector('[data-chart="bar"]');
  if (!doughnutCanvas || !barCanvas) return;

  const instances = [];

  const verde = "rgb(16, 185, 129)";
  const verdeBorda = "rgb(5, 150, 105)";
  const vermelho = "rgb(248, 113, 113)";
  const vermelhoBorda = "rgb(220, 38, 38)";
  const grid = "rgb(226, 232, 240)";
  const texto = "rgb(100, 116, 139)";

  instances.push(
    new ChartGlobal(doughnutCanvas, {
      type: "doughnut",
      data: {
        labels: ["Aprovadas", "Recusadas"],
        datasets: [
          {
            data: [ctx.aprovadas, ctx.recusadas],
            backgroundColor: [verde, vermelho],
            borderColor: ["#fff", "#fff"],
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              padding: 12,
              color: texto,
              font: { size: 11, weight: "600" },
            },
          },
          tooltip: {
            callbacks: {
              label(item) {
                const v = item.parsed;
                const pct =
                  ctx.totalLinhas > 0
                    ? ` (${Math.round((v / ctx.totalLinhas) * 100)}%)`
                    : "";
                return ` ${item.label}: ${v}${pct}`;
              },
            },
          },
        },
      },
    })
  );

  instances.push(
    new ChartGlobal(barCanvas, {
      type: "bar",
      data: {
        labels: ["Aprovadas", "Recusadas"],
        datasets: [
          {
            label: "Notas",
            data: [ctx.aprovadas, ctx.recusadas],
            backgroundColor: [verde, vermelho],
            borderColor: [verdeBorda, vermelhoBorda],
            borderWidth: 1,
            borderRadius: 6,
            maxBarThickness: 48,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: grid },
            ticks: {
              color: texto,
              font: { size: 10 },
              precision: 0,
            },
          },
          y: {
            grid: { display: false },
            ticks: {
              color: "rgb(51, 65, 85)",
              font: { size: 11, weight: "600" },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(item) {
                return ` ${item.parsed.x} nota(s)`;
              },
            },
          },
        },
      },
    })
  );

  chartInstances.set(container, instances);
}

/**
 * @param {HTMLElement} container
 * @param {{ total_a_receber?: number | null, resumo?: { total_linhas?: number, aprovadas?: number, recusadas?: number } }} data
 */
export function renderDashboardResumo(container, data) {
  destroyCharts(container);

  const resumo = data.resumo || {};
  const totalLinhas =
    typeof resumo.total_linhas === "number" ? resumo.total_linhas : 0;
  const aprovadas = typeof resumo.aprovadas === "number" ? resumo.aprovadas : 0;
  const recusadas = typeof resumo.recusadas === "number" ? resumo.recusadas : 0;
  const totalReceber = formatMoney(data.total_a_receber);
  const taxa = taxaAprovacao(totalLinhas, aprovadas);

  container.innerHTML = `
    <div class="dashboard-resumo__inner" role="region" aria-label="Resumo da validação">
      <div class="dashboard-resumo__top">
        <h2 class="dashboard-resumo__heading">Resumo do lote</h2>
        <div class="dashboard-resumo__money-block">
          <p class="dashboard-resumo__label dashboard-resumo__label--inline">Total a receber</p>
          <p class="dashboard-resumo__kpi-money tabular-nums">${totalReceber}</p>
        </div>
      </div>
      <div class="dashboard-resumo__layout">
        <figure class="dashboard-resumo__chart-box">
          <figcaption class="dashboard-resumo__chart-title">Distribuição</figcaption>
          <div class="dashboard-resumo__chart-canvas-wrap dashboard-resumo__chart-canvas-wrap--donut">
            <canvas data-chart="doughnut" aria-label="Gráfico de rosca: aprovadas e recusadas"></canvas>
          </div>
        </figure>
        <figure class="dashboard-resumo__chart-box">
          <figcaption class="dashboard-resumo__chart-title">Quantidade por status</figcaption>
          <div class="dashboard-resumo__chart-canvas-wrap dashboard-resumo__chart-canvas-wrap--bar">
            <canvas data-chart="bar" aria-label="Gráfico de barras: aprovadas e recusadas"></canvas>
          </div>
        </figure>
        <div class="dashboard-resumo__stats">
          <article class="dashboard-resumo__stat">
            <p class="dashboard-resumo__label">Validadas</p>
            <p class="dashboard-resumo__value tabular-nums">${totalLinhas}</p>
          </article>
          <article class="dashboard-resumo__stat dashboard-resumo__stat--aprovada">
            <p class="dashboard-resumo__label">Aprovadas</p>
            <p class="dashboard-resumo__value tabular-nums">${aprovadas}</p>
            <p class="dashboard-resumo__hint">${taxa}</p>
          </article>
          <article class="dashboard-resumo__stat dashboard-resumo__stat--recusada">
            <p class="dashboard-resumo__label">Recusadas</p>
            <p class="dashboard-resumo__value tabular-nums">${recusadas}</p>
          </article>
        </div>
      </div>
      <table class="dashboard-resumo__sr-table visually-hidden">
        <caption>Totais da validação</caption>
        <tbody>
          <tr><th scope="row">Notas validadas</th><td>${totalLinhas}</td></tr>
          <tr><th scope="row">Aprovadas</th><td>${aprovadas}</td></tr>
          <tr><th scope="row">Recusadas</th><td>${recusadas}</td></tr>
          <tr><th scope="row">Total a receber</th><td>${totalReceber}</td></tr>
        </tbody>
      </table>
    </div>
  `;

  montarGraficos(container, {
    aprovadas,
    recusadas,
    totalLinhas,
    taxa,
    totalReceber,
  });
}
