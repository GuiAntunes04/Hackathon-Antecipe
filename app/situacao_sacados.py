"""Situação cadastral: mock oficial (``cnpj_situacao_mock.csv``) e utilitários legados."""

from __future__ import annotations

from pathlib import Path

import polars as pl
import structlog

from app.reader import ler_csv_notas

logger = structlog.get_logger(__name__)

SITUACAO_PATH = Path("data/situacao_sacados.csv")
MOCK_SITUACAO_PADRAO = Path("cnpj_situacao_mock.csv")
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


def _mesclar_sacados_na_situacao(
    caminho_notas: Path,
    base: Path,
) -> pl.DataFrame:
    """Une sacados do CSV de notas à situação ``base`` (novos sacados → ATIVA)."""
    novos = (
        ler_csv_notas(caminho_notas)
        .select(pl.col("DOC_SACADO").unique())
        .with_columns(pl.lit("ATIVA").alias("SITUACAO"))
    )
    existente = _ler_situacao_existente(base)
    if existente.height == 0:
        return novos.sort("DOC_SACADO")
    return (
        pl.concat([existente, novos], how="vertical_relaxed")
        .unique(subset=["DOC_SACADO"], keep="first")
        .sort("DOC_SACADO")
    )


def situacao_para_validacao(
    caminho_notas: Path,
    base: Path,
    saida_temporaria: Path,
) -> Path:
    """
    Gera CSV de situação para um upload sem alterar o arquivo canônico ``base``.

    Sacados já presentes em ``base`` mantêm o status da mescla mock+estoque;
    sacados novos do upload recebem ATIVA.
    """
    combinado = _mesclar_sacados_na_situacao(caminho_notas, base)
    saida_temporaria.parent.mkdir(parents=True, exist_ok=True)
    combinado.write_csv(saida_temporaria, separator=";")
    logger.info(
        "situacao_validacao_temporaria",
        origem=str(caminho_notas),
        base=str(base),
        total_sacados=combinado.height,
        arquivo=str(saida_temporaria),
    )
    return saida_temporaria


def incorporar_sacados_do_csv(caminho_notas: Path, saida: Path = SITUACAO_PATH) -> Path:
    """
    Garante que todo ``DOC_SACADO`` do CSV conste em ``saida`` (default ATIVA se novo).

    Preferir ``situacao_para_validacao`` na API para não sobrescrever a mescla canônica.
    """
    combinado = _mesclar_sacados_na_situacao(caminho_notas, saida)
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
    saida: Path | None = None,
) -> Path | None:
    """
    Retorna o CSV de situação configurado se existir (sem mesclar estoque).

    ``origem`` ignorado (compatibilidade); use ``CAMINHO_SITUACAO=cnpj_situacao_mock.csv``.
    """
    del origem
    caminho = saida if saida is not None else MOCK_SITUACAO_PADRAO
    if caminho.is_file():
        return caminho
    logger.warning("situacao_cadastral_ausente", arquivo=str(caminho))
    return None
