import { t } from "../../i18n.js";
import { formatMoney } from "../../lib/format.js";
import { agregarMotivosRecusa, agregarTotaisPorMes, rotuloMes, rotuloMotivoCurto } from "./dashboard-data.js";

/** @type {WeakMap<HTMLElement, object[]>} */
const chartInstances = new WeakMap();

/** @param {HTMLElement} container */
export function destroyDashboardCharts(container) {
  const list = chartInstances.get(container);
  if (list) {
    list.forEach((c) => c.destroy());
  }
  chartInstances.set(container, []);
}

/**
 * @param {HTMLElement} container
 * @param {{ aprovadas: number, recusadas: number, totalLinhas: number }} ctx
 */
export function montarGraficoRosca(container, ctx) {
  const ChartGlobal = window.Chart;
  const canvas = container.querySelector('[data-chart="doughnut"]');
  if (!ChartGlobal || !canvas) return;

  const instances = chartInstances.get(container) ?? [];
  const labelApproved = t("chart.approved");
  const labelRejected = t("chart.rejected");
  const verde = "rgb(16, 185, 129)";
  const vermelho = "rgb(248, 113, 113)";
  const texto = "rgb(100, 116, 139)";

  const aprovadas = ctx.aprovadas;
  const recusadas = ctx.recusadas;
  const data =
    aprovadas === 0 && recusadas === 0 ? [1, 0] : [aprovadas, recusadas];
  const bg =
    aprovadas === 0 && recusadas === 0
      ? ["rgb(226 232 240)", vermelho]
      : [verde, vermelho];

  instances.push(
    new ChartGlobal(canvas, {
      type: "doughnut",
      data: {
        labels: [labelApproved, labelRejected],
        datasets: [
          {
            data,
            backgroundColor: bg,
            borderColor: ["#fff", "#fff"],
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "58%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              padding: 10,
              color: texto,
              font: { size: 10, weight: "600" },
            },
          },
          tooltip: {
            filter(item) {
              return !(aprovadas === 0 && recusadas === 0 && item.dataIndex === 0);
            },
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

  chartInstances.set(container, instances);
}

/**
 * @param {HTMLElement} container
 * @param {ReturnType<typeof agregarMotivosRecusa>} serie
 */
export function montarGraficoMotivos(container, serie) {
  const ChartGlobal = window.Chart;
  if (!ChartGlobal || !serie.length) return;

  const canvas = container.querySelector('[data-chart="errors"]');
  if (!canvas) return;

  const instances = chartInstances.get(container) ?? [];
  const labels = serie.map((p) => rotuloMotivoCurto(p.motivo, 36));
  const valores = serie.map((p) => p.qtd);
  const vermelho = "rgb(248, 113, 113)";
  const vermelhoBorda = "rgb(220, 38, 38)";
  const grid = "rgb(226 232 240)";

  instances.push(
    new ChartGlobal(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: t("chart.notes"),
            data: valores,
            backgroundColor: vermelho,
            borderColor: vermelhoBorda,
            borderWidth: 1,
            borderRadius: 4,
            maxBarThickness: 24,
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
            ticks: { color: "rgb(100, 116, 139)", font: { size: 10 }, precision: 0 },
          },
          y: {
            grid: { display: false },
            ticks: {
              color: "rgb(51, 65, 85)",
              font: { size: 10, weight: "600" },
              autoSkip: false,
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title(items) {
                const idx = items[0]?.dataIndex ?? 0;
                return serie[idx]?.motivo ?? "";
              },
              label(item) {
                return ` ${item.parsed.x} ${t("dashboard.errorsNotesShort")}`;
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
 * @param {ReturnType<typeof agregarTotaisPorMes>} serie
 */
export function montarGraficoMensal(container, serie) {
  const ChartGlobal = window.Chart;
  if (!ChartGlobal) return;

  const canvas = container.querySelector('[data-chart="monthly"]');
  if (!canvas) return;

  const instances = chartInstances.get(container) ?? [];
  const labels = serie.map((p) => rotuloMes(p.year, p.month));
  const valores = serie.map((p) => Math.round(p.total * 100) / 100);
  const verde = "rgb(16, 185, 129)";
  const verdeFill = "rgb(16, 185, 129, 0.12)";

  instances.push(
    new ChartGlobal(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: t("dashboard.monthlySeries"),
            data: valores,
            borderColor: verde,
            backgroundColor: verdeFill,
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "rgb(71, 85, 105)", font: { size: 10, weight: "600" } },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgb(241, 245, 249)" },
            ticks: {
              color: "rgb(100, 116, 139)",
              font: { size: 10 },
              callback(value) {
                return formatMoney(value);
              },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(ctx) {
                const idx = ctx.dataIndex;
                const qtd = serie[idx]?.qtd ?? 0;
                return ` ${formatMoney(ctx.parsed.y)} · ${qtd} ${t("dashboard.monthlyNotesShort")}`;
              },
            },
          },
        },
      },
    })
  );

  chartInstances.set(container, instances);
}
