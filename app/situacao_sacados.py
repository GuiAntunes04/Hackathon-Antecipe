"""Situação cadastral: mock oficial (``cnpj_situacao_mock.csv``)."""

from __future__ import annotations

from pathlib import Path

import polars as pl
import structlog

from app.reader import ler_csv_notas

logger = structlog.get_logger(__name__)

MOCK_SITUACAO_PADRAO = Path("cnpj_situacao_mock.csv")


def gerar_de_notas(caminho_csv: Path, saida: Path) -> int:
    """
    Extrai ``DOC_SACADO`` distintos do CSV de notas e grava ``SITUACAO=ATIVA``.

    Legado para scripts locais; produção usa ``cnpj_situacao_mock.csv``.
    """
    df = ler_csv_notas(caminho_csv)
    sacados = df.select(pl.col("DOC_SACADO").unique().sort()).with_columns(
        pl.lit("ATIVA").alias("SITUACAO")
    )
    saida.parent.mkdir(parents=True, exist_ok=True)
    sacados.write_csv(saida, separator=";")
    return sacados.height


def garantir_arquivo_situacao(
    origem: Path | None = None,
    saida: Path | None = None,
) -> Path | None:
    """Retorna o CSV de situação se existir (``CAMINHO_SITUACAO`` / mock padrão)."""
    del origem
    caminho = saida if saida is not None else MOCK_SITUACAO_PADRAO
    if caminho.is_file():
        return caminho
    logger.warning("situacao_cadastral_ausente", arquivo=str(caminho))
    return None
