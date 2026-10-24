"""Orquestra leitura, validação e precificação."""

from __future__ import annotations

import os
import time
from datetime import date, datetime
from pathlib import Path
from typing import Any

import polars as pl
import structlog

from app.pricing import calcular_valor_liquido
from app.reader import ler_csv_notas
from app.rules import aplicar_regras, carregar_validadores

logger = structlog.get_logger(__name__)


def _formatar_data_vencimento(valor: Any) -> str | None:
    if valor is None:
        return None
    if isinstance(valor, datetime):
        return valor.date().strftime("%d/%m/%Y")
    if isinstance(valor, date):
        return valor.strftime("%d/%m/%Y")
    return str(valor)


def _caminho_estoque() -> Path | None:
    raw = os.getenv("CAMINHO_ESTOQUE")
    if not raw:
        return None
    path = Path(raw)
    return path if path.is_file() else None


def _carregar_chaves_estoque(caminho: Path) -> frozenset[tuple[str, str]]:
    df = ler_csv_notas(caminho)
    pares = df.select("DOC_CEDENTE", "NU_DOCUMENTO").unique()
    return frozenset(
        (row["DOC_CEDENTE"], row["NU_DOCUMENTO"])
        for row in pares.iter_rows(named=True)
    )


def _marcar_duplicidade_lote(df: pl.DataFrame) -> pl.DataFrame:
    """Recusa ocorrências repetidas de (DOC_CEDENTE, NU_DOCUMENTO) no mesmo envio."""
    chave = pl.concat_str([pl.col("DOC_CEDENTE"), pl.lit("|"), pl.col("NU_DOCUMENTO")])
    vistos: set[str] = set()
    duplicada: list[bool] = []
    for row in df.iter_rows(named=True):
        k = f"{row['DOC_CEDENTE']}|{row['NU_DOCUMENTO']}"
        if k in vistos:
            duplicada.append(True)
        else:
            vistos.add(k)
            duplicada.append(False)
    return df.with_columns(pl.Series("_dup_lote", duplicada)).with_columns(
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
    ).drop("_dup_lote")


def _marcar_ja_no_estoque(df: pl.DataFrame, chaves: frozenset[tuple[str, str]]) -> pl.DataFrame:
    def no_estoque(row: dict[str, Any]) -> bool:
        return (row["DOC_CEDENTE"], row["NU_DOCUMENTO"]) in chaves

    flags = [no_estoque(row) for row in df.iter_rows(named=True)]
    return df.with_columns(pl.Series("_no_estoque", flags)).with_columns(
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


def validar_arquivo_csv(
    caminho_csv: Path,
    caminho_validadores: Path,
    data_base: date,
    caminho_situacao: Path | None = None,
) -> dict[str, Any]:
    """
    Executa reader -> rules -> pricing e monta o resultado agregado.
    """
    inicio = time.perf_counter()
    config = carregar_validadores(caminho_validadores)
    df = ler_csv_notas(caminho_csv)
    df = df.with_row_index("_idx").with_columns((pl.col("_idx") + 2).alias("linha"))

    df = aplicar_regras(df, config, data_base, caminho_situacao=caminho_situacao)

    estoque = _caminho_estoque()
    if estoque is not None:
        chaves = _carregar_chaves_estoque(estoque)
        df = _marcar_ja_no_estoque(df, chaves)

    df = _marcar_duplicidade_lote(df)

    df = calcular_valor_liquido(df, config["precificacao"], data_base)

    notas: list[dict[str, Any]] = []
    for row in df.iter_rows(named=True):
        aprovada = bool(row["aprovada"])
        notas.append(
            {
                "linha": int(row["linha"]),
                "nu_documento": row.get("NU_DOCUMENTO"),
                "nome_sacado": row.get("NOME_SACADO"),
                "data_vencimento": _formatar_data_vencimento(
                    row.get("DATA_VENCIMENTO_ORIGINAL")
                ),
                "valor_nominal": row.get("VALOR_NOMINAL"),
                "status": "aprovada" if aprovada else "recusada",
                "motivo": None if aprovada else row.get("motivo_recusa"),
                "valor_liquido": row.get("valor_liquido") if aprovada else None,
            }
        )

    aprovadas = sum(1 for n in notas if n["status"] == "aprovada")
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
