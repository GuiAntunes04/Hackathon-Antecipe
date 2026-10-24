"""Configuração da aplicação a partir de variáveis de ambiente."""

from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import date
from pathlib import Path

_PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _aplicar_arquivo_env(caminho: Path) -> None:
    """Preenche os.environ com chaves ainda não definidas (estilo dotenv)."""
    if not caminho.is_file():
        return
    for raw in caminho.read_text(encoding="utf-8").splitlines():
        linha = raw.strip()
        if not linha or linha.startswith("#"):
            continue
        if linha.lower().startswith("export "):
            linha = linha[7:].strip()
        if "=" not in linha:
            continue
        chave, _, valor = linha.partition("=")
        chave = chave.strip()
        if not chave or chave in os.environ:
            continue
        valor = valor.strip()
        if len(valor) >= 2 and valor[0] == valor[-1] and valor[0] in ("'", '"'):
            valor = valor[1:-1]
        os.environ[chave] = valor


def _carregar_env_do_projeto() -> None:
    _aplicar_arquivo_env(_PROJECT_ROOT / ".env")
    _aplicar_arquivo_env(_PROJECT_ROOT / ".env.example")


def _parse_bool(valor: str | None, default: bool = False) -> bool:
    if valor is None:
        return default
    return valor.strip().lower() in ("1", "true", "yes", "sim", "on")


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
    mock_validacao: bool


def carregar_config() -> Config:
    """Lê variáveis de ambiente e retorna Config."""
    _carregar_env_do_projeto()
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
        mock_validacao=_parse_bool(os.getenv("MOCK_VALIDACAO"), default=False),
    )
