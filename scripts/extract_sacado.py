from pathlib import Path

src = Path("app/static/js/components/dashboard-resumo.js.bak").read_text(encoding="utf-8").splitlines()
block = src[514:1031]
header = """import { escapeHtml } from "../lib/format.js";
import { t } from "../i18n.js";

"""
out = Path("app/static/js/components/dashboard/dashboard-sacado-combobox.js")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(header + "\n".join(block) + "\n", encoding="utf-8")
print("wrote", out, "lines", len(block))
