"""Testes de precificação."""

from datetime import date

import polars as pl
import pytest

from app.pricing import calcular_valor_liquido

DATA_BASE = date(2026, 10, 22)
PRECIFICACAO = {
    "metodo": "DESCONTO_SIMPLES",
    "taxa_mensal_percentual": 2.0,
    "base_dias": 30,
}


def test_desconto_simples_linha_aprovada() -> None:
    df = pl.DataFrame(
        {
            "VALOR_NOMINAL": [1000.0],
            "DATA_VENCIMENTO_ORIGINAL": [date(2026, 12, 22)],
            "aprovada": [True],
        }
    )
    out = calcular_valor_liquido(df, PRECIFICACAO, DATA_BASE)
    assert out["valor_liquido"][0] == 959.33


def test_recusada_sem_valor_liquido() -> None:
    df = pl.DataFrame(
        {
            "VALOR_NOMINAL": [1000.0],
            "DATA_VENCIMENTO_ORIGINAL": [date(2026, 12, 22)],
            "aprovada": [False],
        }
    )
    out = calcular_valor_liquido(df, PRECIFICACAO, DATA_BASE)
    assert out["valor_liquido"][0] is None


def test_vencimento_anterior_data_base_liquido_igual_nominal() -> None:
    """Nota já vencida na data-base: sem «desconto negativo» (líquido > bruto)."""
    df = pl.DataFrame(
        {
            "VALOR_NOMINAL": [2278.08],
            "DATA_VENCIMENTO_ORIGINAL": [date(2026, 10, 7)],
            "aprovada": [True],
        }
    )
    out = calcular_valor_liquido(df, PRECIFICACAO, DATA_BASE)
    assert out["valor_liquido"][0] == 2278.08


def test_metodo_desconhecido() -> None:
    df = pl.DataFrame(
        {
            "VALOR_NOMINAL": [100.0],
            "DATA_VENCIMENTO_ORIGINAL": [date(2026, 12, 22)],
            "aprovada": [True],
        }
    )
    with pytest.raises(ValueError):
        calcular_valor_liquido(df, {"metodo": "OUTRO"}, DATA_BASE)
