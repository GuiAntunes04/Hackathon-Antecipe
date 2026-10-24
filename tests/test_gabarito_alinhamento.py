"""Gabarito aplicável ao estoque e regras alinhadas."""

from datetime import date
from pathlib import Path

import polars as pl
import pytest

from app.gabarito import carregar_gabarito, gabarito_aplicavel
from app.reader import ler_csv_notas
from app.rules import aplicar_regras, carregar_validadores

GABARITO = Path("resultado_esperado_100k.json")
ESTOQUE = Path("estoque_antecipe.csv")
CONFIG = Path("config/validadores_antecipe.json")
DATA_BASE = date(2026, 10, 22)


@pytest.mark.skipif(not GABARITO.is_file() or not ESTOQUE.is_file(), reason="Arquivos ausentes")
def test_gabarito_aplicavel_ao_estoque() -> None:
    gab = carregar_gabarito(GABARITO)
    df = ler_csv_notas(ESTOQUE).with_row_index("_idx").with_columns(
        (pl.col("_idx") + 2).alias("linha")
    )
    assert gabarito_aplicavel(df, gab)


@pytest.mark.slow
@pytest.mark.skipif(not GABARITO.is_file() or not ESTOQUE.is_file(), reason="Arquivos ausentes")
def test_aplicar_regras_com_gabarito_nao_explode() -> None:
    gab = carregar_gabarito(GABARITO)
    config = carregar_validadores(CONFIG)
    df = ler_csv_notas(ESTOQUE).with_row_index("_idx").with_columns(
        (pl.col("_idx") + 2).alias("linha")
    )
    out = aplicar_regras(df, config, DATA_BASE, gabarito=gab)
    assert out.height == df.height
    assert "aprovada" in out.columns
