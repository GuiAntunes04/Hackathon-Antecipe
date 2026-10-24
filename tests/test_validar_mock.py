"""Testes do POST /validar com mock temporário."""

from io import BytesIO

from fastapi.testclient import TestClient

from app.api import app
from app.mock_validacao import resultado_simulado


def test_resultado_simulado_tem_dez_notas() -> None:
    dados = resultado_simulado()
    assert len(dados["notas"]) == 10
    aprovadas = [n for n in dados["notas"] if n["status"] == "aprovada"]
    total_esperado = round(
        sum(n["valor_liquido"] for n in aprovadas if n["valor_liquido"] is not None),
        2,
    )
    assert dados["total_a_receber"] == total_esperado


def test_get_validar_demo_com_mock_retorna_200(monkeypatch) -> None:
    monkeypatch.setenv("MOCK_VALIDACAO", "true")
    with TestClient(app) as client:
        resposta = client.get("/validar/demo")
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert len(corpo["notas"]) == 10
    assert corpo["total_a_receber"] == resultado_simulado()["total_a_receber"]


def test_get_index_com_mock_inclui_demo_no_html(monkeypatch) -> None:
    monkeypatch.setenv("MOCK_VALIDACAO", "true")
    with TestClient(app) as client:
        resposta = client.get("/")
    assert resposta.status_code == 200
    assert "antecipe-demo-data" in resposta.text
    assert "application/json" in resposta.text


def test_get_validar_demo_sem_mock_retorna_404(monkeypatch) -> None:
    monkeypatch.setenv("MOCK_VALIDACAO", "false")
    with TestClient(app) as client:
        resposta = client.get("/validar/demo")
    assert resposta.status_code == 404


def test_post_validar_com_mock_retorna_200(monkeypatch) -> None:
    monkeypatch.setenv("MOCK_VALIDACAO", "true")
    with TestClient(app) as client:
        resposta = client.post(
            "/validar",
            files={"arquivo": ("teste.csv", BytesIO(b"a;b\n"), "text/csv")},
        )
    assert resposta.status_code == 200
    corpo = resposta.json()
    assert len(corpo["notas"]) == 10
    assert corpo["total_a_receber"] == resultado_simulado()["total_a_receber"]
