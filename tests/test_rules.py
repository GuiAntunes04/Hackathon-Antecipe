"""Testes do motor de regras."""

from datetime import date
from pathlib import Path

import polars as pl
import pytest

from app.reader import ler_csv_notas
from app.rules import (
    _aplicar_concentracao_maxima_sacado,
    carregar_validadores,
    cnpj_valido,
    mapear_codigo_para_funcao,
    validadores_ativos,
    aplicar_regras,
)

FIXTURES = Path(__file__).parent / "fixtures"
DATA_BASE = date(2026, 10, 22)


@pytest.fixture
def config_minimo() -> dict:
    return carregar_validadores(FIXTURES / "validadores_minimo.json")


@pytest.fixture
def df_notas() -> pl.DataFrame:
    return ler_csv_notas(FIXTURES / "notas_exemplo.csv")


def test_carregar_validadores(config_minimo: dict) -> None:
    assert len(config_minimo["validadores"]) == 6
    assert config_minimo["precificacao"]["metodo"] == "DESCONTO_SIMPLES"


def test_carregar_validadores_arquivo_inexistente() -> None:
    with pytest.raises(FileNotFoundError):
        carregar_validadores(Path("nao_existe.json"))


def test_validadores_ativos(config_minimo: dict) -> None:
    ativos = validadores_ativos(config_minimo)
    assert len(ativos) == 6
    assert all(v["ativo"] for v in ativos)


def test_cnpj_valido() -> None:
    assert cnpj_valido("22.144.961/0001-02")
    assert not cnpj_valido("11.111.111/1111-11")


def test_mapear_codigo_desconhecido() -> None:
    with pytest.raises(KeyError):
        mapear_codigo_para_funcao("CONCENTRACAO_MAXIMA_SACADO")


def test_aplicar_regras_casos(df_notas: pl.DataFrame, config_minimo: dict) -> None:
    situacao = FIXTURES / "situacao_sacados.csv"
    out = aplicar_regras(df_notas, config_minimo, DATA_BASE, caminho_situacao=situacao)

    by_doc = {row["NU_DOCUMENTO"]: row for row in out.iter_rows(named=True)}

    assert by_doc["NU001"]["aprovada"] is True
    assert by_doc["NU001"]["codigo_recusa"] is None

    assert by_doc["NU002"]["aprovada"] is False
    assert by_doc["NU002"]["codigo_recusa"] == "VALOR_MINIMO"

    assert by_doc["NU003"]["codigo_recusa"] == "TIPO_RECEBIVEL"

    assert by_doc["NU004"]["codigo_recusa"] == "CNPJ_SACADO_VALIDO"

    assert by_doc["NU005"]["codigo_recusa"] == "NAO_VENCIDA"

    assert by_doc["NU006"]["codigo_recusa"] == "PRAZO_MAXIMO"


def test_situacao_desconhecida(config_minimo: dict) -> None:
    df = pl.DataFrame(
        {
            "DOC_SACADO": ["68.937.649/0001-77"],
            "TIPO_RECEBIVEL": ["Duplicata"],
            "VALOR_NOMINAL": [500.0],
            "DATA_VENCIMENTO_ORIGINAL": [date(2026, 12, 7)],
            "DATA_AQUISICAO": [date(2026, 4, 27)],
        }
    )
    situacao = FIXTURES / "situacao_sacados.csv"
    out = aplicar_regras(df, config_minimo, DATA_BASE, caminho_situacao=situacao)
    assert out["codigo_recusa"][0] == "SITUACAO_CADASTRAL_SACADO"
    assert "confirmar" in out["motivo_recusa"][0].lower()


def test_validador_ativo_sem_implementacao() -> None:
    config = carregar_validadores(FIXTURES / "validadores_minimo.json")
    config["validadores"].append(
        {"codigo": "REGRA_FANTASMA", "ativo": True, "parametros": {}}
    )
    df = pl.DataFrame(
        {
            "DOC_SACADO": ["22.144.961/0001-02"],
            "TIPO_RECEBIVEL": ["Duplicata"],
            "VALOR_NOMINAL": [500.0],
            "DATA_VENCIMENTO_ORIGINAL": [date(2026, 12, 7)],
        }
    )
    with pytest.raises(ValueError, match="REGRA_FANTASMA"):
        aplicar_regras(df, config, DATA_BASE, caminho_situacao=FIXTURES / "situacao_sacados.csv")


def test_concentracao_nao_isenta_raiz_ja_recusada() -> None:
    """2ª nota da raiz recusada na concentração impede isenção de 3ª (mesma raiz)."""
    df = pl.DataFrame(
        {
            "DOC_SACADO": [
                "22.144.961/0001-02",
                "58.206.002/0001-11",
                "58.206.002/0002-00",
            ],
            "VALOR_NOMINAL": [1000.0, 3807.37, 4480.32],
            "aprovada": [True, True, True],
            "codigo_recusa": [None, None, None],
            "motivo_recusa": [None, None, None],
        }
    )
    out = _aplicar_concentracao_maxima_sacado(
        df, {"percentual_maximo": 10.0, "agrupamento": "RAIZ_CNPJ"}
    )
    assert out["aprovada"].to_list() == [True, False, False]
    assert out["codigo_recusa"][1] == "CONCENTRACAO_MAXIMA_SACADO"
    assert out["codigo_recusa"][2] == "CONCENTRACAO_MAXIMA_SACADO"
