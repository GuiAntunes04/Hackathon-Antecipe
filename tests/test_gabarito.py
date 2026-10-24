"""Comparação opcional com resultado_esperado_100k.json."""

import json
from datetime import date
from pathlib import Path

import pytest

from app.pipeline import validar_arquivo_csv

CONFIG = Path("config/validadores_antecipe.json")
GABARITO = Path("resultado_esperado_100k.json")
ESTOQUE = Path("estoque_antecipe.csv")
DATA_BASE = date(2026, 10, 22)


@pytest.mark.slow
def test_gabarito_linhas_chave() -> None:
    """Linhas 2–3 e amostra de aderência ao gabarito."""
    if not GABARITO.is_file() or not ESTOQUE.is_file():
        pytest.skip("Arquivos de gabarito ou estoque ausentes")

    gab = {x["linha"]: x for x in json.loads(GABARITO.read_text(encoding="utf-8"))}
    out = validar_arquivo_csv(ESTOQUE, CONFIG, DATA_BASE)
    by_linha = {n["linha"]: n for n in out["notas"]}

    assert by_linha[2]["status"] == "aprovada"
    assert by_linha[3]["status"] == "recusada"
    motivo3 = (by_linha[3]["motivo"] or "").lower()
    assert "limite" in motivo3 or "concentr" in motivo3

    ok = 0
    for lin in range(2, 502):
        if lin not in gab or lin not in by_linha:
            continue
        exp = gab[lin]["status"] == "APROVADO"
        got = by_linha[lin]["status"] == "aprovada"
        if exp == got:
            ok += 1
    assert ok >= 340, f"Aderência nas linhas 2–501: {ok}/500 (meta 340; gap principal: situação cadastral por linha)"
