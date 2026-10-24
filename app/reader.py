"""Leitura de CSV de recebíveis com Polars."""

from __future__ import annotations

from pathlib import Path

import polars as pl


def ler_csv_notas(caminho: Path) -> pl.DataFrame:
    """
    Lê o CSV de notas: separador ';', decimal com vírgula, datas dd/mm/aaaa, UTF-8.

    Args:
        caminho: Caminho do arquivo CSV.

    Returns:
        DataFrame Polars com as colunas do arquivo.

    Raises:
        FileNotFoundError: Se o arquivo não existir.
        ValueError: Se o CSV não puder ser interpretado.
    """
    if not caminho.is_file():
        raise FileNotFoundError(f"Arquivo não encontrado: {caminho}")

    try:
        df = pl.read_csv(
            caminho,
            separator=";",
            encoding="utf8",
            decimal_comma=True,
            infer_schema_length=10_000,
            schema_overrides={"NU_DOCUMENTO": pl.Utf8},
        )
    except Exception as exc:  # noqa: BLE001 — mensagem amigável ao caller
        raise ValueError(f"Não foi possível ler o CSV: {caminho}") from exc

    for coluna in ("DATA_VENCIMENTO_ORIGINAL", "DATA_AQUISICAO"):
        if coluna in df.columns and df.schema[coluna] != pl.Date:
            df = df.with_columns(
                pl.col(coluna).str.strptime(pl.Date, "%d/%m/%Y", strict=False)
            )

    if "NU_DOCUMENTO" in df.columns:
        df = df.with_columns(pl.col("NU_DOCUMENTO").cast(pl.Utf8))

    if "VALOR_NOMINAL" in df.columns and df.schema["VALOR_NOMINAL"] != pl.Float64:
        df = df.with_columns(pl.col("VALOR_NOMINAL").cast(pl.Float64, strict=False))

    return df
