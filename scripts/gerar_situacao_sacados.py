#!/usr/bin/env python3
"""Gera data/situacao_sacados.csv a partir de um CSV de notas (DOC_SACADO únicos, ATIVA)."""

from __future__ import annotations

import argparse
from pathlib import Path

import polars as pl

from app.reader import ler_csv_notas


def gerar(caminho_csv: Path, saida: Path) -> int:
    """
    Extrai DOC_SACADO distintos e grava situacao ATIVA.

    Returns:
        Quantidade de sacados escritos.
    """
    df = ler_csv_notas(caminho_csv)
    sacados = df.select(pl.col("DOC_SACADO").unique().sort()).with_columns(
        pl.lit("ATIVA").alias("SITUACAO")
    )
    saida.parent.mkdir(parents=True, exist_ok=True)
    sacados.write_csv(saida, separator=";")
    return sacados.height


def main() -> None:
    parser = argparse.ArgumentParser(description="Gera situacao_sacados.csv")
    parser.add_argument(
        "--csv",
        type=Path,
        default=Path("estoque_antecipe.csv"),
        help="CSV de notas de origem",
    )
    parser.add_argument(
        "--saida",
        type=Path,
        default=Path("data/situacao_sacados.csv"),
        help="Arquivo de saída",
    )
    args = parser.parse_args()
    n = gerar(args.csv, args.saida)
    print(f"Gerados {n} sacados em {args.saida}")


if __name__ == "__main__":
    main()
