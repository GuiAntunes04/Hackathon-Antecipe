import { getLocale, t } from "../i18n.js";
import { formatMoney } from "../lib/format.js";

/** @type {WeakMap<HTMLElement, object[]>} */
const chartInstances = new WeakMap();

/** @type {WeakMap<HTMLElement, number>} */
const slideIndexByRoot = new WeakMap();

const DASHBOARD_SLIDE_COUNT = 3;

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
 * @param {string | undefined} dataVencimento
 * @returns {{ year: number, month: number, key: string } | null}
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

/**
 * @param {number} year
 * @param {number} month
 */
function rotuloMes(year, month) {
  const d = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat(getLocale(), { month: "short", year: "numeric" }).format(d);
}

/**
 * @param {object[]} notas
 */
/**
 * @param {string} texto
 * @param {number} [max]
 */
function rotuloMotivoCurto(texto, max = 42) {
  const s = String(texto ?? "").trim();
  if (!s) return t("dashboard.errorsUnknown");
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

/**
 * @param {object[]} notas
 */
function agregarMotivosRecusa(notas) {
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
    .slice(0, 8)
    .map(([motivo, qtd]) => ({ motivo, qtd }));
}

function agregarTotaisPorMes(notas) {
  /** @type {Map<string, { year: number, month: number, total: number, qtd: number }>} */
  const map = new Map();

  for (const nota of notas || []) {
    if (String(nota.status ?? "").toLowerCase() !== "aprovada") continue;
    const parsed = parseMesVencimento(nota.data_vencimento);
    if (!parsed) continue;
    const bruto = nota.valor_liquido;
    const num =
      typeof bruto === "number"
        ? bruto
        : Number(String(bruto ?? "").replace(",", "."));
    const valor = Number.isFinite(num) ? num : 0;

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
 * @param {HTMLElement} container
 * @param {{ aprovadas: number, recusadas: number, totalLinhas: number }} ctx
 */
function montarGraficosResumo(container, ctx) {
  const ChartGlobal = window.Chart;
  if (!ChartGlobal) return;

  const doughnutCanvas = container.querySelector('[data-chart="doughnut"]');
  const barCanvas = container.querySelector('[data-chart="bar"]');
  if (!doughnutCanvas || !barCanvas) return;

  const instances = chartInstances.get(container) ?? [];
  const labelApproved = t("chart.approved");
  const labelRejected = t("chart.rejected");

  const verde = "rgb(16, 185, 129)";
  const verdeBorda = "rgb(5, 150, 105)";
  const vermelho = "rgb(248, 113, 113)";
  const vermelhoBorda = "rgb(220, 38, 38)";
  const grid = "rgb(226 232 240)";
  const texto = "rgb(100, 116, 139)";

  instances.push(
    new ChartGlobal(doughnutCanvas, {
      type: "doughnut",
      data: {
        labels: [labelApproved, labelRejected],
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
        labels: [labelApproved, labelRejected],
        datasets: [
          {
            label: t("chart.notes"),
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
            ticks: { color: texto, font: { size: 10 }, precision: 0 },
          },
          y: {
            grid: { display: false },
            ticks: { color: "rgb(51, 65, 85)", font: { size: 11, weight: "600" } },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(item) {
                return ` ${item.parsed.x}${t("chart.noteCount")}`;
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
function montarGraficoErros(container, serie) {
  const ChartGlobal = window.Chart;
  if (!ChartGlobal || !serie.length) return;

  const canvas = container.querySelector('[data-chart="errors"]');
  if (!canvas) return;

  const instances = chartInstances.get(container) ?? [];
  const labels = serie.map((p) => rotuloMotivoCurto(p.motivo));
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
            maxBarThickness: 22,
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
function montarGraficoMensal(container, serie) {
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

/**
 * @param {HTMLElement} container
 * @param {number} slide
 */
function aplicarSlide(container, slide) {
  const track = container.querySelector(".dashboard-carousel__track");
  const prev = container.querySelector(".dashboard-carousel__nav--prev");
  const next = container.querySelector(".dashboard-carousel__nav--next");
  if (!track) return;

  const alvo = Math.max(0, Math.min(DASHBOARD_SLIDE_COUNT - 1, slide));
  slideIndexByRoot.set(container, alvo);
  const offsetPct = (100 / DASHBOARD_SLIDE_COUNT) * alvo;
  track.style.transform = `translate3d(-${offsetPct}%, 0, 0)`;
  track.dataset.slide = String(alvo);

  if (prev) prev.hidden = alvo === 0;
  if (next) next.hidden = alvo === DASHBOARD_SLIDE_COUNT - 1;
}

/** @param {HTMLElement} carouselRoot */
function vincularCarousel(carouselRoot) {
  carouselRoot.addEventListener("click", (e) => {
    const prev = e.target.closest(".dashboard-carousel__nav--prev");
    const next = e.target.closest(".dashboard-carousel__nav--next");
    const host = carouselRoot.parentElement;
    if (!host) return;
    const atual = slideIndexByRoot.get(host) ?? 0;
    if (next && atual < DASHBOARD_SLIDE_COUNT - 1) aplicarSlide(host, atual + 1);
    if (prev && atual > 0) aplicarSlide(host, atual - 1);
  });
}

function htmlSlideResumo(totalReceber, totalLinhas, aprovadas, recusadas, taxa) {
  return `
    <div class="dashboard-carousel__slide">
      <div class="dashboard-resumo__inner" role="group" aria-label="${t("dashboard.region")}">
        <div class="dashboard-resumo__top">
          <h2 class="dashboard-resumo__heading">${t("dashboard.heading")}</h2>
          <div class="dashboard-resumo__money-block">
            <p class="dashboard-resumo__label dashboard-resumo__label--inline">${t("dashboard.totalReceive")}</p>
            <p class="dashboard-resumo__kpi-money tabular-nums">${totalReceber}</p>
          </div>
        </div>
        <div class="dashboard-resumo__layout">
          <figure class="dashboard-resumo__chart-box">
            <figcaption class="dashboard-resumo__chart-title">${t("dashboard.distribution")}</figcaption>
            <div class="dashboard-resumo__chart-canvas-wrap dashboard-resumo__chart-canvas-wrap--donut">
              <canvas data-chart="doughnut" aria-label="${t("dashboard.chartDonut")}"></canvas>
            </div>
          </figure>
          <figure class="dashboard-resumo__chart-box">
            <figcaption class="dashboard-resumo__chart-title">${t("dashboard.qtyByStatus")}</figcaption>
            <div class="dashboard-resumo__chart-canvas-wrap dashboard-resumo__chart-canvas-wrap--bar">
              <canvas data-chart="bar" aria-label="${t("dashboard.chartBar")}"></canvas>
            </div>
          </figure>
          <div class="dashboard-resumo__stats">
            <article class="dashboard-resumo__stat">
              <p class="dashboard-resumo__label">${t("dashboard.validated")}</p>
              <p class="dashboard-resumo__value tabular-nums">${totalLinhas}</p>
            </article>
            <article class="dashboard-resumo__stat dashboard-resumo__stat--aprovada">
              <p class="dashboard-resumo__label">${t("dashboard.approved")}</p>
              <p class="dashboard-resumo__value tabular-nums">${aprovadas}</p>
              <p class="dashboard-resumo__hint">${taxa}</p>
            </article>
            <article class="dashboard-resumo__stat dashboard-resumo__stat--recusada">
              <p class="dashboard-resumo__label">${t("dashboard.rejected")}</p>
              <p class="dashboard-resumo__value tabular-nums">${recusadas}</p>
            </article>
          </div>
        </div>
      </div>
    </div>`;
}

/**
 * @param {ReturnType<typeof agregarTotaisPorMes>} serie
 */
function htmlSlideMensal(serie) {
  const vazio = serie.length === 0;
  const lista = serie
    .map(
      (p) =>
        `<li><span>${rotuloMes(p.year, p.month)}</span><strong class="tabular-nums">${formatMoney(p.total)}</strong></li>`
    )
    .join("");

  return `
    <div class="dashboard-carousel__slide dashboard-carousel__slide--monthly">
      <div class="dashboard-resumo__inner dashboard-resumo__inner--monthly" role="group" aria-label="${t("dashboard.monthlyRegion")}">
        <div class="dashboard-resumo__top">
          <h2 class="dashboard-resumo__heading">${t("dashboard.monthlyHeading")}</h2>
          <p class="dashboard-resumo__subheading">${t("dashboard.monthlySubtitle")}</p>
        </div>
        ${
          vazio
            ? `<p class="dashboard-resumo__empty">${t("dashboard.monthlyEmpty")}</p>`
            : `
        <figure class="dashboard-resumo__chart-box dashboard-resumo__chart-box--wide">
          <figcaption class="dashboard-resumo__chart-title">${t("dashboard.monthlyChart")}</figcaption>
          <div class="dashboard-resumo__chart-canvas-wrap dashboard-resumo__chart-canvas-wrap--line">
            <canvas data-chart="monthly" aria-label="${t("dashboard.monthlyChart")}"></canvas>
          </div>
        </figure>
        <ul class="dashboard-resumo__month-list">${lista}</ul>`
        }
      </div>
    </div>`;
}

/**
 * @param {ReturnType<typeof agregarMotivosRecusa>} serie
 */
function htmlSlideErros(serie) {
  const vazio = serie.length === 0;
  return `
    <div class="dashboard-carousel__slide dashboard-carousel__slide--errors">
      <div class="dashboard-resumo__inner dashboard-resumo__inner--errors" role="group" aria-label="${t("dashboard.errorsRegion")}">
        <div class="dashboard-resumo__top">
          <h2 class="dashboard-resumo__heading">${t("dashboard.errorsHeading")}</h2>
          <p class="dashboard-resumo__subheading">${t("dashboard.errorsSubtitle")}</p>
        </div>
        ${
          vazio
            ? `<p class="dashboard-resumo__empty">${t("dashboard.errorsEmpty")}</p>`
            : `
        <figure class="dashboard-resumo__chart-box dashboard-resumo__chart-box--wide">
          <figcaption class="dashboard-resumo__chart-title">${t("dashboard.errorsChart")}</figcaption>
          <div class="dashboard-resumo__chart-canvas-wrap dashboard-resumo__chart-canvas-wrap--errors">
            <canvas data-chart="errors" aria-label="${t("dashboard.errorsChart")}"></canvas>
          </div>
        </figure>`
        }
      </div>
    </div>`;
}

/**
 * @param {HTMLElement} container
 * @param {{ total_a_receber?: number | null, resumo?: { total_linhas?: number, aprovadas?: number, recusadas?: number }, notas?: object[] }} data
 */
export function renderDashboardResumo(container, data) {
  const slideAnterior = slideIndexByRoot.get(container) ?? 0;
  destroyCharts(container);

  const resumo = data.resumo || {};
  const totalLinhas =
    typeof resumo.total_linhas === "number" ? resumo.total_linhas : 0;
  const aprovadas = typeof resumo.aprovadas === "number" ? resumo.aprovadas : 0;
  const recusadas = typeof resumo.recusadas === "number" ? resumo.recusadas : 0;
  const totalReceber = formatMoney(data.total_a_receber);
  const taxa = taxaAprovacao(totalLinhas, aprovadas);
  const serieMeses = agregarTotaisPorMes(data.notas || []);
  const serieErros = agregarMotivosRecusa(data.notas || []);
  const slideAnteriorClamped = Math.min(
    slideAnterior,
    DASHBOARD_SLIDE_COUNT - 1
  );

  container.innerHTML = `
    <div class="dashboard-carousel">
      <button type="button" class="dashboard-carousel__nav dashboard-carousel__nav--prev" aria-label="${t("dashboard.prevSlide")}" hidden>‹</button>
      <div class="dashboard-carousel__viewport">
        <div class="dashboard-carousel__track" data-slide="0">
          ${htmlSlideResumo(totalReceber, totalLinhas, aprovadas, recusadas, taxa)}
          ${htmlSlideMensal(serieMeses)}
          ${htmlSlideErros(serieErros)}
        </div>
      </div>
      <button type="button" class="dashboard-carousel__nav dashboard-carousel__nav--next" aria-label="${t("dashboard.nextSlide")}">›</button>
    </div>
    <table class="dashboard-resumo__sr-table visually-hidden">
      <caption>${t("dashboard.caption")}</caption>
      <tbody>
        <tr><th scope="row">${t("dashboard.srValidated")}</th><td>${totalLinhas}</td></tr>
        <tr><th scope="row">${t("dashboard.approved")}</th><td>${aprovadas}</td></tr>
        <tr><th scope="row">${t("dashboard.rejected")}</th><td>${recusadas}</td></tr>
        <tr><th scope="row">${t("dashboard.totalReceive")}</th><td>${totalReceber}</td></tr>
      </tbody>
    </table>
  `;

  montarGraficosResumo(container, { aprovadas, recusadas, totalLinhas });
  if (serieMeses.length > 0) montarGraficoMensal(container, serieMeses);
  if (serieErros.length > 0) montarGraficoErros(container, serieErros);

  const carousel = container.querySelector(".dashboard-carousel");
  if (carousel) vincularCarousel(carousel);
  aplicarSlide(container, slideAnteriorClamped);
}
