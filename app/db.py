"""Conexão com PostgreSQL via psycopg 3."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Generator

import psycopg


@contextmanager
def conexao(database_url: str) -> Generator[psycopg.Connection, None, None]:
    """
    Context manager que abre e fecha uma conexão com o Postgres.

    Raises:
        NotImplementedError: Implementação pendente.
    """
    raise NotImplementedError("Conexão com banco ainda não implementada.")


def verificar_conexao(database_url: str) -> bool:
    """
    Testa se o banco está acessível.

    Raises:
        NotImplementedError: Implementação pendente.
    """
    raise NotImplementedError("Verificação de conexão ainda não implementada.")
