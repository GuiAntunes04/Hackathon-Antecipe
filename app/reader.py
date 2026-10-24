"""Leitura de CSV de recebíveis com Polars."""

from __future__ import annotations

from pathlib import Path

import polars as pl


def ler_csv_notas(caminho: Path) -> pl.DataFrame:
    """
    Lê o CSV de notas: separador ';', decimal com vírgula, datas dd/mm/aaaa, UTF-8.

    Args:
        caminho: Caminho do arquivo CSV.

    Returns:
        DataFrame Polars com as colunas do arquivo.

    Raises:
        NotImplementedError: Implementação pendente.
    """
    raise NotImplementedError("Leitura de CSV ainda não implementada.")
