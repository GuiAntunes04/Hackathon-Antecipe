"""Testes de integração POST /validar."""

from pathlib import Path

from fastapi.testclient import TestClient

from app.api import app

FIXTURES = Path(__file__).parent / "fixtures"


def test_post_validar_csv() -> None:
    caminho = FIXTURES / "notas_exemplo.csv"
    with TestClient(app) as client:
        with caminho.open("rb") as fh:
            resp = client.post(
                "/validar",
                files={"arquivo": ("notas_exemplo.csv", fh, "text/csv")},
            )
    assert resp.status_code == 200
    body = resp.json()
    assert body["resumo"]["total_linhas"] == 6
    assert "notas" in body
