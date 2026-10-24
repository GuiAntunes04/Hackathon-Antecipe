"""Testes de upload real (POST /validar) e fim do modo demo na API."""

from io import BytesIO
from pathlib import Path

from fastapi.testclient import TestClient

from app.api import app
from app.mock_validacao import resultado_simulado


def test_resultado_simulado_tem_dez_notas() -> None:
    """Fixture legada do módulo mock (não exposta na API)."""
    dados = resultado_simulado()
    assert len(dados["notas"]) == 10
    aprovadas = [n for n in dados["notas"] if n["status"] == "aprovada"]
    total_esperado = round(
        sum(n["valor_liquido"] for n in aprovadas if n["valor_liquido"] is not None),
        2,
    )
    assert dados["total_a_receber"] == total_esperado


def test_get_index_html() -> None:
    with TestClient(app) as client:
        resposta = client.get("/")
    assert resposta.status_code == 200
    assert "antecipe-demo-data" not in resposta.text


def test_get_validar_demo_descontinuado() -> None:
    with TestClient(app) as client:
        resposta = client.get("/validar/demo")
    assert resposta.status_code == 404


def test_post_validar_usa_pipeline() -> None:
    fixture = (
        Path(__file__).resolve().parent / "fixtures" / "notas_exemplo.csv"
    ).read_bytes()
    with TestClient(app) as client:
        resposta = client.post(
            "/validar",
            files={"arquivo": ("notas_exemplo.csv", BytesIO(fixture), "text/csv")},
        )
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["job_id"]
    assert corpo["resumo"]["total_linhas"] == 6
    assert len(corpo["notas"]) == 6
    assert corpo["paginacao"]["total_paginas"] == 1
