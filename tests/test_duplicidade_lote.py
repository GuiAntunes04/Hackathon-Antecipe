"""Testes de duplicidade no lote (chave cedente + documento + valor)."""

import polars as pl

from app.pipeline import _marcar_duplicidade_lote


def _linhas_aprovadas(
    cedente: str,
    documento: str,
    valores: list[float],
) -> pl.DataFrame:
    n = len(valores)
    return pl.DataFrame(
        {
            "DOC_CEDENTE": [cedente] * n,
            "NU_DOCUMENTO": [documento] * n,
            "VALOR_NOMINAL": valores,
            "aprovada": [True] * n,
            "codigo_recusa": [None] * n,
            "motivo_recusa": [None] * n,
        }
    )


def test_mesmo_cedente_doc_valores_diferentes_nao_duplica() -> None:
    df = _linhas_aprovadas("10.0/0001-01", "NF-1", [500.0, 750.0])
    out = _marcar_duplicidade_lote(df)
    assert out["aprovada"].to_list() == [True, True]
    assert out["codigo_recusa"].to_list() == [None, None]


def test_mesma_chave_tripla_segunda_recusada() -> None:
    df = _linhas_aprovadas("10.0/0001-01", "NF-1", [500.0, 500.0])
    out = _marcar_duplicidade_lote(df)
    assert out["aprovada"].to_list() == [True, False]
    assert out["codigo_recusa"][1] == "DUPLICIDADE_LOTE"
    assert "envio" in (out["motivo_recusa"][1] or "").lower()


def test_terceira_repeticao_chave_tripla_recusada() -> None:
    df = _linhas_aprovadas("10.0/0001-01", "NF-1", [100.0, 100.0, 100.0])
    out = _marcar_duplicidade_lote(df)
    assert out["aprovada"].to_list() == [True, False, False]
    assert out["codigo_recusa"][2] == "DUPLICIDADE_LOTE"
