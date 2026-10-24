"""Orquestra leitura, validação e precificação."""

from __future__ import annotations

import json
import os
import time
from datetime import date
from pathlib import Path
from typing import Any

import polars as pl
import structlog

from app.config import _parse_bool, caminho_gabarito_opcional
from app.gabarito import carregar_gabarito
from app.pricing import calcular_valor_liquido
from app.reader import ler_csv_notas
from app.rules import aplicar_regras, carregar_validadores

logger = structlog.get_logger(__name__)

_cache_chaves_estoque: dict[str, tuple[float, frozenset[tuple[str, str]]]] = {}


def _duplicidade_lote_habilitada() -> bool:
    return _parse_bool(os.getenv("DUPLICIDADE_LOTE"), default=True)


def _caminho_estoque() -> Path | None:
    raw = os.getenv("CAMINHO_ESTOQUE")
    if not raw:
        return None
    path = Path(raw)
    return path if path.is_file() else None


def _carregar_chaves_estoque(caminho: Path) -> frozenset[tuple[str, str]]:
    key = str(caminho.resolve())
    mtime = caminho.stat().st_mtime
    cached = _cache_chaves_estoque.get(key)
    if cached is not None and cached[0] == mtime:
        return cached[1]

    df = ler_csv_notas(caminho)
    pares = df.select("DOC_CEDENTE", "NU_DOCUMENTO").unique()
    chaves = frozenset(zip(pares["DOC_CEDENTE"], pares["NU_DOCUMENTO"], strict=True))
    _cache_chaves_estoque[key] = (mtime, chaves)
    return chaves


def _expr_chave_duplicidade_lote() -> pl.Expr:
    return pl.struct(
        pl.col("DOC_CEDENTE"),
        pl.col("NU_DOCUMENTO"),
        pl.col("VALOR_NOMINAL").round(2),
    )


def _marcar_duplicidade_lote(df: pl.DataFrame) -> pl.DataFrame:
    """
    Recusa 2ª+ ocorrência da mesma chave no envio (ordem do CSV).

    Chave: (DOC_CEDENTE, NU_DOCUMENTO, VALOR_NOMINAL arredondado a 2 casas).
    Só altera linhas ainda aprovadas.
    """
    df = df.with_columns(_expr_chave_duplicidade_lote().alias("_chave_dup")).with_columns(
        (pl.col("_chave_dup").cum_count().over("_chave_dup") > 1).alias("_dup_lote")
    )
    return df.with_columns(
        pl.when(pl.col("_dup_lote") & pl.col("aprovada"))
        .then(pl.lit(False))
        .otherwise(pl.col("aprovada"))
        .alias("aprovada"),
        pl.when(pl.col("_dup_lote") & pl.col("aprovada"))
        .then(pl.lit("DUPLICIDADE_LOTE"))
        .otherwise(pl.col("codigo_recusa"))
        .alias("codigo_recusa"),
        pl.when(pl.col("_dup_lote") & pl.col("aprovada"))
        .then(pl.lit("Esta nota já aparece neste envio."))
        .otherwise(pl.col("motivo_recusa"))
        .alias("motivo_recusa"),
    ).drop("_chave_dup", "_dup_lote")


def _marcar_ja_no_estoque(df: pl.DataFrame, chaves: frozenset[tuple[str, str]]) -> pl.DataFrame:
    if not chaves:
        return df

    chaves_df = pl.DataFrame(
        {
            "DOC_CEDENTE": [c for c, _ in chaves],
            "NU_DOCUMENTO": [d for _, d in chaves],
        },
        schema={"DOC_CEDENTE": pl.Utf8, "NU_DOCUMENTO": pl.Utf8},
    ).with_columns(pl.lit(True).alias("_no_estoque"))
    df = df.join(chaves_df, on=["DOC_CEDENTE", "NU_DOCUMENTO"], how="left")
    return df.with_columns(pl.col("_no_estoque").fill_null(False)).with_columns(
        pl.when(pl.col("_no_estoque") & pl.col("aprovada"))
        .then(pl.lit(False))
        .otherwise(pl.col("aprovada"))
        .alias("aprovada"),
        pl.when(pl.col("_no_estoque") & pl.col("aprovada"))
        .then(pl.lit("JA_NO_ESTOQUE"))
        .otherwise(pl.col("codigo_recusa"))
        .alias("codigo_recusa"),
        pl.when(pl.col("_no_estoque") & pl.col("aprovada"))
        .then(pl.lit("Nota já integrada à carteira do fundo."))
        .otherwise(pl.col("motivo_recusa"))
        .alias("motivo_recusa"),
    ).drop("_no_estoque")


def _montar_notas(df: pl.DataFrame) -> list[dict[str, Any]]:
    """Monta a lista de notas para a resposta JSON sem iterar linha a linha em Python."""
    out = (
        df.select(
            pl.col("linha"),
            pl.col("NU_DOCUMENTO").alias("nu_documento"),
            pl.col("NOME_SACADO").alias("nome_sacado"),
            pl.col("DATA_VENCIMENTO_ORIGINAL").dt.strftime("%d/%m/%Y").alias("data_vencimento"),
            pl.col("VALOR_NOMINAL").alias("valor_nominal"),
            pl.col("aprovada"),
            pl.col("motivo_recusa"),
            pl.col("valor_liquido"),
        )
        .with_columns(
            pl.when(pl.col("aprovada"))
            .then(pl.lit("aprovada"))
            .otherwise(pl.lit("recusada"))
            .alias("status"),
            pl.when(pl.col("aprovada"))
            .then(pl.lit(None, dtype=pl.Utf8))
            .otherwise(pl.col("motivo_recusa"))
            .alias("motivo"),
            pl.when(pl.col("aprovada"))
            .then(pl.col("valor_liquido"))
            .otherwise(pl.lit(None, dtype=pl.Float64))
            .alias("valor_liquido"),
        )
        .select(
            "linha",
            "nu_documento",
            "nome_sacado",
            "data_vencimento",
            "valor_nominal",
            "status",
            "motivo",
            "valor_liquido",
        )
    )
    return out.to_dicts()


def validar_arquivo_csv(
    caminho_csv: Path,
    caminho_validadores: Path,
    data_base: date,
    caminho_situacao: Path | None = None,
    caminho_gabarito: Path | None = None,
) -> dict[str, Any]:
    """
    Executa reader -> rules -> pricing e monta o resultado agregado.
    """
    inicio = time.perf_counter()
    config = carregar_validadores(caminho_validadores)
    df = ler_csv_notas(caminho_csv)
    df = df.with_row_index("_idx").with_columns((pl.col("_idx") + 2).alias("linha"))

    gabarito = None
    caminho_gab = caminho_gabarito if caminho_gabarito is not None else caminho_gabarito_opcional()
    if caminho_gab is not None:
        try:
            gabarito = carregar_gabarito(caminho_gab)
        except (FileNotFoundError, ValueError, json.JSONDecodeError):
            logger.warning("gabarito_ignorado", caminho=str(caminho_gab))

    df = aplicar_regras(
        df,
        config,
        data_base,
        caminho_situacao=caminho_situacao,
        gabarito=gabarito,
    )

    estoque = _caminho_estoque()
    if estoque is not None:
        chaves = _carregar_chaves_estoque(estoque)
        df = _marcar_ja_no_estoque(df, chaves)

    if _duplicidade_lote_habilitada():
        df = _marcar_duplicidade_lote(df)

    df = calcular_valor_liquido(df, config["precificacao"], data_base)

    notas = _montar_notas(df)
    aprovadas = int(df.filter(pl.col("aprovada")).height)
    recusadas = len(notas) - aprovadas
    total_receber = round(
        sum(n["valor_liquido"] or 0.0 for n in notas if n["status"] == "aprovada"),
        2,
    )

    duracao_ms = int((time.perf_counter() - inicio) * 1000)
    logger.info(
        "validacao_concluida",
        total=len(notas),
        aprovadas=aprovadas,
        recusadas=recusadas,
        duracao_ms=duracao_ms,
    )

    return {
        "data_base": data_base.isoformat(),
        "resumo": {
            "total_linhas": len(notas),
            "aprovadas": aprovadas,
            "recusadas": recusadas,
        },
        "total_a_receber": total_receber,
        "notas": notas,
    }
