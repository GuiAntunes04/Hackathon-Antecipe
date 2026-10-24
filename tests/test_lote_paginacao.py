"""Paginação de lotes validados."""

from io import BytesIO
from pathlib import Path

from fastapi.testclient import TestClient

from app import lote_cache
from app.api import app

FIXTURES = Path(__file__).parent / "fixtures"


def test_resposta_pagina_fatia_notas() -> None:
    lote = {
        "data_base": "2026-10-22",
        "resumo": {"total_linhas": 25, "aprovadas": 10, "recusadas": 15},
        "total_a_receber": 100.0,
        "notas": [{"linha": i} for i in range(1, 26)],
    }
    pag1 = lote_cache.resposta_pagina_lote(lote, "abc", pagina=1, tamanho_pagina=10)
    assert len(pag1["notas"]) == 10
    assert pag1["notas"][0]["linha"] == 1
    assert pag1["paginacao"]["total_paginas"] == 3

    pag3 = lote_cache.resposta_pagina_lote(lote, "abc", pagina=3, tamanho_pagina=10)
    assert len(pag3["notas"]) == 5
    assert pag3["notas"][-1]["linha"] == 25


def test_post_validar_retorna_lote_completo(monkeypatch, tmp_path) -> None:
    monkeypatch.setenv("MOCK_VALIDACAO", "false")
    monkeypatch.setattr(lote_cache, "LOTE_DIR", tmp_path / "lotes")

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
    assert body["paginacao"]["total_paginas"] == 1
    assert body["paginacao"]["total_linhas"] == 6


def test_get_lote_retorna_todas_notas(monkeypatch, tmp_path) -> None:
    monkeypatch.setenv("MOCK_VALIDACAO", "false")
    monkeypatch.setattr(lote_cache, "LOTE_DIR", tmp_path / "lotes")

    notas = [{"linha": i, "nu_documento": f"N{i}"} for i in range(1, 16)]
    job_id = lote_cache.salvar_lote(
        {
            "data_base": "2026-10-22",
            "resumo": {"total_linhas": 15, "aprovadas": 0, "recusadas": 15},
            "total_a_receber": 0,
            "notas": notas,
        }
    )

    with TestClient(app) as client:
        resp = client.get(f"/validar/lote/{job_id}")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["notas"]) == 15
    assert body["notas"][0]["linha"] == 1
    assert body["notas"][-1]["linha"] == 15


def test_resposta_lote_completo() -> None:
    lote = {
        "data_base": "2026-10-22",
        "resumo": {"total_linhas": 3, "aprovadas": 1, "recusadas": 2},
        "total_a_receber": 50.0,
        "notas": [{"linha": 1}, {"linha": 2}, {"linha": 3}],
    }
    out = lote_cache.resposta_lote_completo(lote, "job1")
    assert len(out["notas"]) == 3
    assert out["paginacao"]["total_linhas"] == 3
    assert out["paginacao"]["total_paginas"] == 1


def test_filtro_aprovadas_reduz_paginacao() -> None:
    notas = [
        {"linha": 1, "status": "aprovada"},
        {"linha": 2, "status": "recusada"},
        {"linha": 3, "status": "aprovada"},
        {"linha": 4, "status": "recusada"},
    ]
    lote = {
        "data_base": "2026-10-22",
        "resumo": {"total_linhas": 4, "aprovadas": 2, "recusadas": 2},
        "total_a_receber": 10.0,
        "notas": notas,
    }
    out = lote_cache.resposta_pagina_lote(
        lote, "x", pagina=1, tamanho_pagina=10, filtro_status="aprovada"
    )
    assert out["filtro_status"] == "aprovada"
    assert len(out["notas"]) == 2
    assert out["paginacao"]["total_linhas"] == 2


def test_get_lote_inexistente_404() -> None:
    with TestClient(app) as client:
        resp = client.get("/validar/lote/naoexiste123")
    assert resp.status_code == 404
