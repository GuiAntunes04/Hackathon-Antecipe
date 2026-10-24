"""Mescla mock de situação cadastral com sacados do CSV de notas."""

from __future__ import annotations

from pathlib import Path

import polars as pl

from app.reader import ler_csv_notas
from app.rules import _normalizar_colunas_situacao


def mesclar_mock_com_notas(caminho_mock: Path, caminho_notas: Path) -> pl.DataFrame:
    """
    Para cada DOC_SACADO distinto em ``caminho_notas``:
    status do mock se existir; senão ATIVA.
    Nunca altera status já presentes no mock para sacados do lote.
    """
    bruto_mock = pl.read_csv(caminho_mock, separator=";", encoding="utf8")
    mock = _normalizar_colunas_situacao(bruto_mock)

    notas = ler_csv_notas(caminho_notas)
    sacados = notas.select(pl.col("DOC_SACADO").cast(pl.Utf8).unique().sort())

    com_mock = sacados.join(mock, on="DOC_SACADO", how="left")
    return com_mock.with_columns(
        pl.coalesce(pl.col("SITUACAO"), pl.lit("ATIVA")).alias("SITUACAO")
    ).select("DOC_SACADO", "SITUACAO")


def gravar_situacao_mesclada(
    caminho_mock: Path,
    caminho_notas: Path,
    caminho_saida: Path,
) -> int:
    """Grava CSV mesclado e devolve quantidade de sacados."""
    df = mesclar_mock_com_notas(caminho_mock, caminho_notas)
    caminho_saida.parent.mkdir(parents=True, exist_ok=True)
    df.write_csv(caminho_saida, separator=";")
    return df.height
