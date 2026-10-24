/** Carrega Chart.js sob demanda (só na tela de resultados). */

/** @type {Promise<typeof Chart> | null} */
let chartPromise = null;

const CHART_CDN =
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js";

/**
 * @returns {Promise<typeof Chart>}
 */
export function ensureChartJs() {
  const existente = window.Chart;
  if (existente) {
    return Promise.resolve(existente);
  }
  if (!chartPromise) {
    chartPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = CHART_CDN;
      script.crossOrigin = "anonymous";
      script.async = true;
      script.onload = () => {
        if (window.Chart) {
          resolve(window.Chart);
        } else {
          reject(new Error("Chart.js não expôs window.Chart."));
        }
      };
      script.onerror = () => reject(new Error("Falha ao carregar Chart.js."));
      document.head.appendChild(script);
    });
  }
  return chartPromise;
}
