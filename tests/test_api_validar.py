"""Testes de integração POST /validar."""

from pathlib import Path

from fastapi.testclient import TestClient

from app.api import app

FIXTURES = Path(__file__).parent / "fixtures"


def test_post_validar_csv(monkeypatch) -> None:
    monkeypatch.setenv("MOCK_VALIDACAO", "false")
    caminho = FIXTURES / "notas_exemplo.csv"
    with TestClient(app) as client:
        with caminho.open("rb") as fh:
            resp = client.post(
                "/validar",
                files={"arquivo": ("notas_exemplo.csv", fh, "text/csv")},
            )
    assert resp.status_code == 200
    body = resp.json()
    assert body["job_id"]
    assert body["resumo"]["total_linhas"] == 6
    assert len(body["notas"]) == 6
    assert body["paginacao"]["pagina"] == 1
