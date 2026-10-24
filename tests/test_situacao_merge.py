"""Mescla mock de situação + sacados do estoque."""

import json
from datetime import date
from pathlib import Path

import polars as pl
import pytest

from app.rules import aplicar_regras
from app.situacao_merge import mesclar_mock_com_notas

ROOT = Path(__file__).resolve().parent.parent
MOCK = ROOT / "cnpj_situacao_mock.csv"
ESTOQUE = ROOT / "estoque_antecipe.csv"
FIXTURES = Path(__file__).parent / "fixtures"
DATA_BASE = date(2026, 10, 22)
SACADO_MEGA = "57.018.055/0001-46"
SACADO_INAPTA_MOCK = "03.638.251/0001-94"


@pytest.mark.skipif(
    not MOCK.is_file() or not ESTOQUE.is_file(),
    reason="mock ou estoque ausente",
)
def test_mesclar_sacado_ausente_no_mock_vira_ativa() -> None:
    df = mesclar_mock_com_notas(MOCK, ESTOQUE)
    row = df.filter(pl.col("DOC_SACADO") == SACADO_MEGA)
    assert row.height == 1
    assert row["SITUACAO"][0] == "ATIVA"


@pytest.mark.skipif(
    not MOCK.is_file() or not ESTOQUE.is_file(),
    reason="mock ou estoque ausente",
)
def test_mesclar_inapta_do_mock_preservada() -> None:
    df = mesclar_mock_com_notas(MOCK, ESTOQUE)
    row = df.filter(pl.col("DOC_SACADO") == SACADO_INAPTA_MOCK)
    assert row.height == 1
    assert row["SITUACAO"][0] == "INAPTA"


@pytest.mark.skipif(
    not MOCK.is_file() or not ESTOQUE.is_file(),
    reason="mock ou estoque ausente",
)
def test_mega_nao_recusa_por_situacao_desconhecida(tmp_path: Path) -> None:
    mesclado = tmp_path / "situacao.csv"
    from app.situacao_merge import gravar_situacao_mesclada

    gravar_situacao_mesclada(MOCK, ESTOQUE, mesclado)
    config = json.loads((FIXTURES / "validadores_minimo.json").read_text(encoding="utf-8"))
    df = pl.DataFrame(
        {
            "DOC_SACADO": [SACADO_MEGA],
            "TIPO_RECEBIVEL": ["Duplicata"],
            "VALOR_NOMINAL": [233.51],
            "DATA_VENCIMENTO_ORIGINAL": [date(2026, 10, 31)],
            "DATA_AQUISICAO": [date(2026, 5, 7)],
        }
    )
    out = aplicar_regras(df, config, DATA_BASE, caminho_situacao=mesclado)
    assert out["aprovada"][0] is True
    assert out["codigo_recusa"][0] is None
