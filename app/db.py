"""Conexão com PostgreSQL via psycopg 3."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Generator

import psycopg

_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS validacao_lote (
    id UUID PRIMARY KEY,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_base DATE NOT NULL,
    total_a_receber NUMERIC(18, 2) NOT NULL,
    total_linhas INT NOT NULL,
    aprovadas INT NOT NULL,
    recusadas INT NOT NULL,
    nome_arquivo TEXT
);

CREATE TABLE IF NOT EXISTS validacao_nota (
    validacao_lote_id UUID NOT NULL REFERENCES validacao_lote(id) ON DELETE CASCADE,
    linha INT NOT NULL,
    nu_documento TEXT NOT NULL,
    nome_sacado TEXT NOT NULL,
    data_vencimento TEXT NOT NULL,
    valor_nominal NUMERIC(18, 2) NOT NULL,
    status TEXT NOT NULL,
    motivo TEXT,
    valor_liquido NUMERIC(18, 2),
    PRIMARY KEY (validacao_lote_id, linha)
);

CREATE INDEX IF NOT EXISTS idx_validacao_nota_lote_linha
    ON validacao_nota (validacao_lote_id, linha);

CREATE INDEX IF NOT EXISTS idx_validacao_nota_lote_status
    ON validacao_nota (validacao_lote_id, status);
"""


@contextmanager
def conexao(database_url: str) -> Generator[psycopg.Connection, None, None]:
    """Context manager que abre e fecha uma conexão com o Postgres."""
    conn = psycopg.connect(database_url)
    try:
        yield conn
    finally:
        conn.close()


def verificar_conexao(database_url: str) -> bool:
    """Testa se o banco está acessível."""
    try:
        with conexao(database_url) as conn:
            conn.execute("SELECT 1")
        return True
    except Exception:
        return False


def init_schema(conn: psycopg.Connection) -> None:
    """Cria tabelas e índices idempotentemente."""
    conn.execute(_SCHEMA_SQL)
    conn.commit()
