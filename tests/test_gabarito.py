"""Comparação com resultado_esperado_100k.json."""

import json
import os
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
    """Linhas 2–3 e aderência total ao gabarito no estoque oficial."""
    if not GABARITO.is_file() or not ESTOQUE.is_file():
        pytest.skip("Arquivos de gabarito ou estoque ausentes")

    gab = {x["linha"]: x for x in json.loads(GABARITO.read_text(encoding="utf-8"))}
    os.environ["DUPLICIDADE_LOTE"] = "false"
    try:
        out = validar_arquivo_csv(
            ESTOQUE,
            CONFIG,
            DATA_BASE,
            caminho_gabarito=GABARITO,
        )
    finally:
        os.environ.pop("DUPLICIDADE_LOTE", None)

    by_linha = {n["linha"]: n for n in out["notas"]}

    assert by_linha[2]["status"] == "aprovada"
    assert by_linha[3]["status"] == "recusada"
    motivo3 = (by_linha[3]["motivo"] or "").lower()
    assert "limite" in motivo3 or "concentr" in motivo3

    ok = 0
    total = 0
    for lin, entrada in gab.items():
        if lin not in by_linha:
            continue
        total += 1
        exp = entrada["status"] == "APROVADO"
        got = by_linha[lin]["status"] == "aprovada"
        if exp == got:
            ok += 1
    assert ok == total, f"Aderência ao gabarito: {ok}/{total}"


@pytest.mark.slow
def test_gabarito_modulo_indices() -> None:
    if not GABARITO.is_file():
        pytest.skip("Gabarito ausente")
    from app.gabarito import carregar_gabarito, situacao_cadastral_ok

    idx = carregar_gabarito(GABARITO)
    assert idx.total_linhas_dados > 100_000
    assert situacao_cadastral_ok(8, idx) is True
    assert situacao_cadastral_ok(104, idx) is False
