"""Configuração da aplicação a partir de variáveis de ambiente."""

from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import date
from pathlib import Path


def _parse_data_base(valor: str) -> date:
    """Converte DATA_BASE (dd/mm/aaaa) em date."""
    partes = valor.strip().split("/")
    if len(partes) != 3:
        raise ValueError(f"DATA_BASE inválida (esperado dd/mm/aaaa): {valor!r}")
    dia, mes, ano = int(partes[0]), int(partes[1]), int(partes[2])
    return date(ano, mes, dia)


@dataclass(frozen=True)
class Config:
    """Parâmetros carregados do ambiente."""

    database_url: str
    data_base: date
    caminho_validadores: Path
    log_level: str


def carregar_config() -> Config:
    """Lê variáveis de ambiente e retorna Config."""
    data_base_raw = os.getenv("DATA_BASE", "22/10/2026")
    caminho_raw = os.getenv("CAMINHO_VALIDADORES", "config/validadores_antecipe.json")
    return Config(
        database_url=os.getenv(
            "DATABASE_URL",
            "postgresql://antecipe:senha@localhost:5432/antecipe",
        ),
        data_base=_parse_data_base(data_base_raw),
        caminho_validadores=Path(caminho_raw),
        log_level=os.getenv("LOG_LEVEL", "INFO").upper(),
    )
