"""Testes de leitura de CSV."""

from pathlib import Path

import polars as pl

from app.reader import ler_csv_notas, ler_csv_notas_bytes

FIXTURES = Path(__file__).parent / "fixtures"


def test_ler_csv_notas_tipos() -> None:
    df = ler_csv_notas(FIXTURES / "notas_exemplo.csv")
    assert df.height == 6
    assert df.schema["VALOR_NOMINAL"] == pl.Float64
    assert df.schema["DATA_VENCIMENTO_ORIGINAL"] == pl.Date
    assert df.schema["NU_DOCUMENTO"] == pl.Utf8
    assert df["VALOR_NOMINAL"][0] == 500.0


def test_ler_csv_notas_bytes_igual_arquivo() -> None:
    caminho = FIXTURES / "notas_exemplo.csv"
    df_arquivo = ler_csv_notas(caminho)
    df_bytes = ler_csv_notas_bytes(caminho.read_bytes())
    assert df_arquivo.equals(df_bytes)
