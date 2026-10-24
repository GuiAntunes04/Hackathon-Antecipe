from pathlib import Path

bak = Path("app/static/js/components/dashboard-resumo.js.bak").read_text(encoding="utf-8")
lines = bak.splitlines()

def wrap_module(name, imports, start, end, fn_rename):
    body = "\n".join(lines[start:end])
    for old, new in fn_rename:
        body = body.replace(f"function {old}", f"export function {new}", 1)
    return imports + "\n\n" + body + "\n"

fin = wrap_module(
    "tab-financial",
    'import { t } from "../i18n.js";\nimport { escapeHtml } from "../lib/format.js";\nimport { htmlSufixoSacadosHero } from "./dashboard-sacado-combobox.js";',
    1128,
    1189,
    [("htmlSlideFinanceiro", "htmlTabFinanceiro")],
)
rej = wrap_module(
    "tab-rejected",
    'import { t } from "../i18n.js";\nimport { escapeHtml } from "../lib/format.js";\nimport { htmlSufixoSacadosHero } from "./dashboard-sacado-combobox.js";',
    1194,
    1285,
    [("htmlSlideRecusadas", "htmlTabRecusadas")],
)

notes_lines = lines[1286:1310]
notes_body = "\n".join(notes_lines)
notes_body = notes_body.replace("function htmlSlideTabela", "export function htmlTabNotas", 1)
notes_body = notes_body.replace(
    'class="dashboard-carousel__slide dashboard-carousel__slide--table"',
    'class="dashboard-view dashboard-view--notes dashboard-carousel__slide dashboard-carousel__slide--table"',
    1,
)
notes_imports = '/** Montagem da aba Notas e helpers do #table-root. */\n'
notes = notes_imports + notes_body + "\n"

fin = fin.replace(
    'class="dashboard-carousel__slide dashboard-carousel__slide--financial"',
    'class="dashboard-view dashboard-view--financial dashboard-carousel__slide dashboard-carousel__slide--financial"',
    1,
)
rej = rej.replace(
    'class="dashboard-carousel__slide dashboard-carousel__slide--recusadas"',
    'class="dashboard-view dashboard-view--rejected dashboard-carousel__slide dashboard-carousel__slide--recusadas"',
    1,
)

out = Path("app/static/js/components/dashboard")
out.mkdir(parents=True, exist_ok=True)
(out / "tab-financial.js").write_text(fin, encoding="utf-8")
(out / "tab-rejected.js").write_text(rej, encoding="utf-8")
(out / "tab-notes.js").write_text(notes, encoding="utf-8")
print("tabs ok")
