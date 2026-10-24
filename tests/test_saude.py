"""Testes do endpoint de saúde."""

from fastapi.testclient import TestClient

from app.api import app


def test_saude_retorna_200() -> None:
    """GET /saude deve responder 200 com status ok."""
    with TestClient(app) as client:
        resposta = client.get("/saude")
    assert resposta.status_code == 200
    assert resposta.json() == {"status": "ok"}
