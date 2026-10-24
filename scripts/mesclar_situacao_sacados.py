#!/usr/bin/env python3
"""Mescla cnpj_situacao_mock.csv com sacados de um CSV de notas."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from app.situacao_merge import gravar_situacao_mesclada


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Mock (status reais) + sacados do estoque sem mock como ATIVA."
    )
    parser.add_argument(
        "--mock",
        type=Path,
        default=Path("cnpj_situacao_mock.csv"),
        help="CSV mock (DOC;SITUACAO_CADASTRAL)",
    )
    parser.add_argument(
        "--csv",
        type=Path,
        default=Path("estoque_antecipe.csv"),
        help="CSV de notas (extrai DOC_SACADO distintos)",
    )
    parser.add_argument(
        "--saida",
        type=Path,
        default=Path("data/situacao_sacados.csv"),
        help="Saída DOC_SACADO;SITUACAO",
    )
    args = parser.parse_args()
    total = gravar_situacao_mesclada(args.mock, args.csv, args.saida)
    print(f"Mesclados {total} sacados em {args.saida}")


if __name__ == "__main__":
    main()
