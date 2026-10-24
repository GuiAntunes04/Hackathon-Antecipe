"""Cálculo de valor líquido (precificação)."""

from __future__ import annotations

from datetime import date
from typing import Any

import polars as pl


def calcular_valor_liquido(
    df: pl.DataFrame,
    config_precificacao: dict[str, Any],
    data_base: date,
) -> pl.DataFrame:
    """
    Calcula o valor líquido por nota conforme parâmetros do JSON.

    A data-base dos cálculos é sempre ``data_base``, nunca a data do sistema.
    """
    metodo = config_precificacao.get("metodo")
    if metodo != "DESCONTO_SIMPLES":
        raise ValueError(f"Método de precificação não suportado: {metodo!r}")

    taxa = float(config_precificacao["taxa_mensal_percentual"])
    base_dias = int(config_precificacao["base_dias"])
    data_base_lit = pl.lit(data_base, dtype=pl.Date)

    prazo_dias = (pl.col("DATA_VENCIMENTO_ORIGINAL") - data_base_lit).dt.total_days()
    desconto = pl.col("VALOR_NOMINAL") * (taxa / 100.0) * (prazo_dias / float(base_dias))
    liquido = (pl.col("VALOR_NOMINAL") - desconto).round(2)

    if "aprovada" not in df.columns:
        raise ValueError("DataFrame deve conter coluna 'aprovada' (aplicar regras antes).")

    return df.with_columns(
        pl.when(pl.col("aprovada"))
        .then(liquido)
        .otherwise(None)
        .alias("valor_liquido"),
    )
