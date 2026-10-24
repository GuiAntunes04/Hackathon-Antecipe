#!/usr/bin/env python3
"""Gera data/situacao_sacados.csv a partir de um CSV de notas (DOC_SACADO únicos, ATIVA)."""

from __future__ import annotations

import argparse
from pathlib import Path

from app.situacao_sacados import gerar_de_notas


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
    n = gerar_de_notas(args.csv, args.saida)
    print(f"Gerados {n} sacados em {args.saida}")


if __name__ == "__main__":
    main()
