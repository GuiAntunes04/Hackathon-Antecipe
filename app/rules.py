"""Regras de validação carregadas de validadores_antecipe.json."""

from __future__ import annotations

from collections.abc import Callable
from pathlib import Path
from typing import Any

import polars as pl


def carregar_validadores(caminho: Path) -> dict[str, Any]:
    """
    Carrega o JSON de validadores do disco.

    Args:
        caminho: Caminho para validadores_antecipe.json.

    Returns:
        Estrutura parseada do JSON.

    Raises:
        NotImplementedError: Implementação pendente.
    """
    raise NotImplementedError("Carregamento de validadores ainda não implementado.")


def validadores_ativos(config: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Retorna apenas entradas com ``ativo: true``.

    Raises:
        NotImplementedError: Implementação pendente.
    """
    raise NotImplementedError("Filtro de validadores ativos ainda não implementado.")


def mapear_codigo_para_funcao(codigo: str) -> Callable[..., bool]:
    """
    Mapeia o código do validador (ex.: CNPJ_SACADO_VALIDO) para a função correspondente.

    Raises:
        NotImplementedError: Implementação pendente.
    """
    raise NotImplementedError("Mapeamento código -> função ainda não implementado.")


def aplicar_regras(
    df: pl.DataFrame,
    config: dict[str, Any],
    data_base: Any,
) -> pl.DataFrame:
    """
    Aplica todas as regras ativas a cada linha do DataFrame.

    Raises:
        NotImplementedError: Implementação pendente.
    """
    raise NotImplementedError("Aplicação de regras ainda não implementada.")
