"""Testes de PostgreSQL (pulados se o banco não estiver acessível)."""

from __future__ import annotations

import os
import uuid

import pytest

from app import db
from app.lote_repository import pagina_lote_postgres, salvar_lote_postgres

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://antecipe:senha_ficticia_exemplo@localhost:5432/antecipe",
)


def _postgres_disponivel() -> bool:
    return db.verificar_conexao(DATABASE_URL)


pytestmark = pytest.mark.skipif(
    not _postgres_disponivel(),
    reason="PostgreSQL indisponível (subir docker compose up db)",
)


def test_init_schema_idempotente() -> None:
    with db.conexao(DATABASE_URL) as conn:
        db.init_schema(conn)
        db.init_schema(conn)


def test_salvar_e_paginar_lote_postgres() -> None:
    with db.conexao(DATABASE_URL) as conn:
        db.init_schema(conn)

    resultado = {
        "data_base": "2026-10-22",
        "resumo": {"total_linhas": 3, "aprovadas": 2, "recusadas": 1},
        "total_a_receber": 150.0,
        "notas": [
            {
                "linha": 2,
                "nu_documento": "A1",
                "nome_sacado": "Sacado A",
                "data_vencimento": "01/11/2026",
                "valor_nominal": 100.0,
                "status": "aprovada",
                "motivo": "",
                "valor_liquido": 90.0,
            },
            {
                "linha": 3,
                "nu_documento": "B2",
                "nome_sacado": "Sacado B",
                "data_vencimento": "02/11/2026",
                "valor_nominal": 200.0,
                "status": "recusada",
                "motivo": "Teste",
                "valor_liquido": None,
            },
            {
                "linha": 4,
                "nu_documento": "C3",
                "nome_sacado": "Sacado C",
                "data_vencimento": "03/11/2026",
                "valor_nominal": 50.0,
                "status": "aprovada",
                "motivo": "",
                "valor_liquido": 60.0,
            },
        ],
    }
    job_id = salvar_lote_postgres(DATABASE_URL, resultado, nome_arquivo="test.csv")
    assert len(job_id) == 32

    pag1 = pagina_lote_postgres(
        DATABASE_URL, job_id, pagina=1, tamanho_pagina=2, filtro_status="todas"
    )
    assert len(pag1["notas"]) == 2
    assert pag1["paginacao"]["total_paginas"] == 2

    pag_filtro = pagina_lote_postgres(
        DATABASE_URL, job_id, pagina=1, tamanho_pagina=10, filtro_status="aprovada"
    )
    assert len(pag_filtro["notas"]) == 2
    assert pag_filtro["filtro_status"] == "aprovada"

    with db.conexao(DATABASE_URL) as conn:
        conn.execute(
            "DELETE FROM validacao_lote WHERE id = %s",
            (uuid.UUID(hex=job_id),),
        )
        conn.commit()
