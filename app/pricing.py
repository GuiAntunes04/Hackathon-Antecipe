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

    A data-base dos cálculos é sempre ``data_base`` (variável DATA_BASE), nunca a data do sistema.

    Raises:
        NotImplementedError: Implementação pendente.
    """
    raise NotImplementedError("Precificação ainda não implementada.")
