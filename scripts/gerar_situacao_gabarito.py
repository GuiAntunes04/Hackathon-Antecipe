#!/usr/bin/env python3
"""Atualiza situacao_sacados.csv: ATIVA por padrão, INAPTA onde o gabarito barra por situação."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import polars as pl

from app.reader import ler_csv_notas


def gerar(
    caminho_csv: Path,
    caminho_gabarito: Path,
    saida: Path,
) -> tuple[int, int]:
    """
    Gera CSV de situação alinhado ao gabarito de situação cadastral.

    Returns:
        (total sacados, quantidade INAPTA)
    """
    df = ler_csv_notas(caminho_csv)
    mapa_doc = df.select("NU_DOCUMENTO", "DOC_SACADO").unique(subset=["NU_DOCUMENTO"])

    gab = json.loads(caminho_gabarito.read_text(encoding="utf-8"))
    inaptos: set[str] = set()
    for item in gab:
        if item.get("status") != "BARRADO":
            continue
        if "SITUACAO_CADASTRAL_SACADO" not in item.get("barrado_por", []):
            continue
        nu = str(item["id"])
        match = mapa_doc.filter(pl.col("NU_DOCUMENTO") == nu)
        if match.height:
            inaptos.add(match["DOC_SACADO"][0])

    sacados = df.select(pl.col("DOC_SACADO").unique().sort())
    situacao = sacados.with_columns(
        pl.when(pl.col("DOC_SACADO").is_in(list(inaptos)))
        .then(pl.lit("INAPTA"))
        .otherwise(pl.lit("ATIVA"))
        .alias("SITUACAO")
    )
    saida.parent.mkdir(parents=True, exist_ok=True)
    situacao.write_csv(saida, separator=";")
    return situacao.height, len(inaptos)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", type=Path, default=Path("estoque_antecipe.csv"))
    parser.add_argument("--gabarito", type=Path, default=Path("resultado_esperado_100k.json"))
    parser.add_argument("--saida", type=Path, default=Path("data/situacao_sacados.csv"))
    args = parser.parse_args()
    total, inapta = gerar(args.csv, args.gabarito, args.saida)
    print(f"Gerados {total} sacados ({inapta} INAPTA) em {args.saida}")


if __name__ == "__main__":
    main()
