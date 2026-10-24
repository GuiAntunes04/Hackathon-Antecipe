"""Testes do endpoint de saúde."""

from fastapi.testclient import TestClient

from app.api import app


def test_saude_retorna_200() -> None:
    """GET /saude deve responder 200 com status ok e database ok."""
    with TestClient(app) as client:
        resposta = client.get("/saude")
    assert resposta.status_code == 200
    assert resposta.json() == {"status": "ok", "database": "ok"}


def test_saude_retorna_503_se_banco_indisponivel(monkeypatch) -> None:
    monkeypatch.setattr("app.api.db.verificar_conexao", lambda _url: False)
    with TestClient(app) as client:
        resposta = client.get("/saude")
    assert resposta.status_code == 503
    assert resposta.json()["database"] == "erro"
