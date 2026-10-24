"""Persistência de resultados de validação para paginação na API."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from uuid import uuid4

from app import lote_repository
from app.config import PersistenciaLote
from app.lote_paginacao import (
    TAMANHO_PAGINA_PADRAO,
    fatiar_notas,
    filtrar_notas_por_status,
    info_paginacao,
    normalizar_filtro_status,
)

LOTE_DIR = Path("data") / "lotes"

# Re-export para compatibilidade com imports existentes
__all__ = [
    "LOTE_DIR",
    "TAMANHO_PAGINA_PADRAO",
    "FILTRO_TODAS",
    "FILTROS_STATUS_VALIDOS",
    "garantir_diretorio",
    "salvar_lote",
    "carregar_lote",
    "info_paginacao",
    "fatiar_notas",
    "normalizar_filtro_status",
    "filtrar_notas_por_status",
    "resposta_pagina_lote",
    "resposta_pagina_job",
]

from app.lote_paginacao import FILTRO_TODAS, FILTROS_STATUS_VALIDOS  # noqa: E402


def _caminho_lote(job_id: str) -> Path:
    if not job_id.isalnum() or len(job_id) > 64:
        raise ValueError("Identificador de lote inválido.")
    return LOTE_DIR / f"{job_id}.json"


def garantir_diretorio() -> None:
    LOTE_DIR.mkdir(parents=True, exist_ok=True)


def _salvar_lote_json(resultado: dict[str, Any]) -> str:
    garantir_diretorio()
    job_id = uuid4().hex
    payload = {
        "data_base": resultado.get("data_base"),
        "resumo": resultado.get("resumo"),
        "total_a_receber": resultado.get("total_a_receber"),
        "notas": resultado.get("notas") or [],
    }
    _caminho_lote(job_id).write_text(
        json.dumps(payload, ensure_ascii=False),
        encoding="utf-8",
    )
    return job_id


def salvar_lote(
    resultado: dict[str, Any],
    *,
    database_url: str,
    persistencia: PersistenciaLote = "postgres",
    nome_arquivo: str | None = None,
) -> str:
    """Grava o lote e devolve job_id."""
    if persistencia == "json":
        return _salvar_lote_json(resultado)
    return lote_repository.salvar_lote_postgres(
        database_url, resultado, nome_arquivo=nome_arquivo
    )


def carregar_lote(job_id: str) -> dict[str, Any]:
    """Carrega lote do JSON (modo json ou testes)."""
    caminho = _caminho_lote(job_id)
    if not caminho.is_file():
        raise FileNotFoundError(f"Lote não encontrado: {job_id}")
    return json.loads(caminho.read_text(encoding="utf-8"))


def resposta_pagina_lote(
    lote: dict[str, Any],
    job_id: str,
    pagina: int,
    tamanho_pagina: int = TAMANHO_PAGINA_PADRAO,
    filtro_status: str | None = None,
) -> dict[str, Any]:
    """Monta resposta a partir de um dict de lote em memória (JSON / pós-validação)."""
    notas = lote.get("notas") or []
    resumo = lote.get("resumo") or {}
    filtro = normalizar_filtro_status(filtro_status)
    notas_filtradas = filtrar_notas_por_status(notas, filtro)
    total_linhas = len(notas_filtradas)
    pag = info_paginacao(total_linhas, pagina, tamanho_pagina)
    return {
        "job_id": job_id,
        "data_base": lote.get("data_base"),
        "resumo": resumo,
        "total_a_receber": lote.get("total_a_receber"),
        "filtro_status": filtro,
        "paginacao": pag,
        "notas": fatiar_notas(notas_filtradas, pag["pagina"], pag["tamanho_pagina"]),
    }


def resposta_pagina_job(
    job_id: str,
    *,
    database_url: str,
    persistencia: PersistenciaLote,
    pagina: int,
    tamanho_pagina: int = TAMANHO_PAGINA_PADRAO,
    filtro_status: str | None = None,
) -> dict[str, Any]:
    """Devolve uma página do lote persistido (Postgres ou JSON)."""
    if persistencia == "postgres":
        return lote_repository.pagina_lote_postgres(
            database_url,
            job_id,
            pagina=pagina,
            tamanho_pagina=tamanho_pagina,
            filtro_status=filtro_status,
        )
    lote = carregar_lote(job_id)
    return resposta_pagina_lote(
        lote,
        job_id,
        pagina=pagina,
        tamanho_pagina=tamanho_pagina,
        filtro_status=filtro_status,
    )
