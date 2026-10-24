"""Geração e manutenção de ``data/situacao_sacados.csv`` (situação cadastral dos sacados)."""

from __future__ import annotations

from pathlib import Path

import polars as pl
import structlog

from app.reader import ler_csv_notas

logger = structlog.get_logger(__name__)

SITUACAO_PATH = Path("data/situacao_sacados.csv")
ESTOQUE_CSV_PADRAO = Path("estoque_antecipe.csv")


def gerar_de_notas(caminho_csv: Path, saida: Path = SITUACAO_PATH) -> int:
    """
    Extrai ``DOC_SACADO`` distintos do CSV de notas e grava ``SITUACAO=ATIVA``.

    Returns:
        Quantidade de sacados no arquivo de saída.
    """
    df = ler_csv_notas(caminho_csv)
    sacados = df.select(pl.col("DOC_SACADO").unique().sort()).with_columns(
        pl.lit("ATIVA").alias("SITUACAO")
    )
    saida.parent.mkdir(parents=True, exist_ok=True)
    sacados.write_csv(saida, separator=";")
    return sacados.height


def _ler_situacao_existente(caminho: Path) -> pl.DataFrame:
    if not caminho.is_file():
        return pl.DataFrame({"DOC_SACADO": [], "SITUACAO": []})
    return pl.read_csv(caminho, separator=";", encoding="utf8").select(
        pl.col("DOC_SACADO").cast(pl.Utf8),
        pl.col("SITUACAO").cast(pl.Utf8),
    )


def incorporar_sacados_do_csv(caminho_notas: Path, saida: Path = SITUACAO_PATH) -> Path:
    """
    Garante que todo ``DOC_SACADO`` do CSV de upload conste na situação (default ATIVA).
    Usado antes do pipeline para não recusar tudo por situação desconhecida.
    """
    novos = (
        ler_csv_notas(caminho_notas)
        .select(pl.col("DOC_SACADO").unique())
        .with_columns(pl.lit("ATIVA").alias("SITUACAO"))
    )
    existente = _ler_situacao_existente(saida)
    if existente.height == 0:
        combinado = novos.sort("DOC_SACADO")
    else:
        combinado = (
            pl.concat([existente, novos], how="vertical_relaxed")
            .unique(subset=["DOC_SACADO"], keep="first")
            .sort("DOC_SACADO")
        )
    saida.parent.mkdir(parents=True, exist_ok=True)
    combinado.write_csv(saida, separator=";")
    logger.info(
        "situacao_sacados_atualizada",
        origem=str(caminho_notas),
        total_sacados=combinado.height,
        arquivo=str(saida),
    )
    return saida


def garantir_arquivo_situacao(
    origem: Path | None = None,
    saida: Path = SITUACAO_PATH,
) -> Path | None:
    """
    Se ``saida`` não existir, gera a partir de ``origem`` ou ``estoque_antecipe.csv``.
    """
    if saida.is_file():
        return saida
    candidato = origem or ESTOQUE_CSV_PADRAO
    if not candidato.is_file():
        logger.warning(
            "situacao_sacados_ausente",
            arquivo=str(saida),
            origem=str(candidato),
        )
        return None
    n = gerar_de_notas(candidato, saida)
    logger.info("situacao_sacados_gerada", origem=str(candidato), sacados=n, arquivo=str(saida))
    return saida
