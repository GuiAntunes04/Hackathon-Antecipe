"""Fixtures globais: testes locais sem Postgres usam lotes em JSON."""

from __future__ import annotations

import pytest


@pytest.fixture(autouse=True)
def _ambiente_testes_sem_postgres(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("PERSISTENCIA_LOTE", "json")
    monkeypatch.setattr("app.api.db.verificar_conexao", lambda _url: True)
