"""One-off split helpers — run manually if needed."""
from pathlib import Path

ROOT = Path("app/static/js/components")
src = (ROOT / "dashboard-resumo.js").read_text(encoding="utf-8")
lines = src.splitlines()

# data: 38-268 (1-based) -> 37:268
data_body = lines[37:268]
data_header = """import { getLocale, t } from "../i18n.js";
import { formatMoney } from "../lib/format.js";

"""
data_exports = [
    "export function parseValorNumerico",
    "export function rotuloMotivoCurto",
    "export function calcularResumoFinanceiro",
    "export function agregarTotaisPorMes",
    "export function agregarMotivosRecusa",
    "export function calcularPainelRecusadas",
    "export function rotuloMes",
]
data_text = data_header + "\n".join(data_body) + "\n"
for fn in data_exports:
    name = fn.replace("export function ", "")
    data_text = data_text.replace(f"function {name}", fn, 1)

(ROOT / "dashboard" / "dashboard-data.js").write_text(data_text, encoding="utf-8")
print("dashboard-data.js", len(data_body), "lines")
