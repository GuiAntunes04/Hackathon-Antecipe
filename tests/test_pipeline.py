"""Testes do pipeline de validação."""

from datetime import date
from pathlib import Path

from app.pipeline import validar_arquivo_csv

FIXTURES = Path(__file__).parent / "fixtures"
CONFIG = Path("config/validadores_antecipe.json")
DATA_BASE = date(2026, 10, 22)


def test_pipeline_fixture_pequeno() -> None:
    out = validar_arquivo_csv(
        FIXTURES / "notas_exemplo.csv",
        CONFIG,
        DATA_BASE,
        caminho_situacao=FIXTURES / "situacao_sacados.csv",
    )
    assert out["resumo"]["total_linhas"] == 6
    assert "total_a_receber" in out
    assert out["notas"][0]["status"] in ("aprovada", "recusada")
    assert out["data_base"] == "2026-10-22"


def test_concentracao_segunda_nota() -> None:
    """Segunda nota aprovável recusa se concentrar acima do limite do JSON."""
    situacao = FIXTURES / "situacao_sacados.csv"
    out = validar_arquivo_csv(
        FIXTURES / "concentracao.csv",
        CONFIG,
        DATA_BASE,
        caminho_situacao=situacao,
    )
    by_linha = {n["linha"]: n for n in out["notas"]}
    assert by_linha[2]["status"] == "aprovada"
    assert by_linha[3]["status"] == "recusada"
    assert "limite" in (by_linha[3]["motivo"] or "").lower()
