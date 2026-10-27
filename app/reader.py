"""Leitura de CSV de recebíveis com Polars."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

import polars as pl

_READ_KWARGS = {
    "separator": ";",
    "encoding": "utf8",
    "decimal_comma": True,
    "infer_schema_length": 10_000,
    "schema_overrides": {"NU_DOCUMENTO": pl.Utf8},
}


def _pos_processar_csv_notas(df: pl.DataFrame) -> pl.DataFrame:
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


def _ler_csv_polars(fonte: Path | BytesIO, rotulo_erro: str) -> pl.DataFrame:
    try:
        df = pl.read_csv(fonte, **_READ_KWARGS)
    except Exception as exc:  # noqa: BLE001 — mensagem amigável ao caller
        raise ValueError(f"Não foi possível ler o CSV: {rotulo_erro}") from exc
    return _pos_processar_csv_notas(df)


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
    return _ler_csv_polars(caminho, str(caminho))


def ler_csv_notas_bytes(conteudo: bytes) -> pl.DataFrame:
    """Lê CSV de notas a partir de bytes (evita gravar upload em disco)."""
    if not conteudo:
        raise ValueError("Arquivo CSV vazio.")
    return _ler_csv_polars(BytesIO(conteudo), "upload")
