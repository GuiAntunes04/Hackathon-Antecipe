"""Persistência de resultados de validação para paginação na API."""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any
from uuid import uuid4

LOTE_DIR = Path("data") / "lotes"
TAMANHO_PAGINA_PADRAO = 10
FILTRO_TODAS = "todas"
FILTROS_STATUS_VALIDOS = frozenset({FILTRO_TODAS, "aprovada", "recusada"})


def _caminho_lote(job_id: str) -> Path:
    if not job_id.isalnum() or len(job_id) > 64:
        raise ValueError("Identificador de lote inválido.")
    return LOTE_DIR / f"{job_id}.json"


def garantir_diretorio() -> None:
    LOTE_DIR.mkdir(parents=True, exist_ok=True)


def salvar_lote(resultado: dict[str, Any]) -> str:
    """Grava resultado completo e devolve job_id."""
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


def carregar_lote(job_id: str) -> dict[str, Any]:
    caminho = _caminho_lote(job_id)
    if not caminho.is_file():
        raise FileNotFoundError(f"Lote não encontrado: {job_id}")
    return json.loads(caminho.read_text(encoding="utf-8"))


def info_paginacao(total_linhas: int, pagina: int, tamanho_pagina: int) -> dict[str, int]:
    if tamanho_pagina < 1:
        tamanho_pagina = TAMANHO_PAGINA_PADRAO
    if total_linhas <= 0:
        return {
            "pagina": 1,
            "tamanho_pagina": tamanho_pagina,
            "total_paginas": 1,
            "total_linhas": 0,
        }
    total_paginas = max(1, math.ceil(total_linhas / tamanho_pagina))
    pagina = max(1, min(pagina, total_paginas))
    return {
        "pagina": pagina,
        "tamanho_pagina": tamanho_pagina,
        "total_paginas": total_paginas,
        "total_linhas": total_linhas,
    }


def fatiar_notas(notas: list[Any], pagina: int, tamanho_pagina: int) -> list[Any]:
    inicio = (pagina - 1) * tamanho_pagina
    fim = inicio + tamanho_pagina
    return notas[inicio:fim]


def normalizar_filtro_status(valor: str | None) -> str:
    """Retorna 'todas', 'aprovada' ou 'recusada'."""
    if valor is None or not str(valor).strip():
        return FILTRO_TODAS
    bruto = str(valor).strip().lower()
    if bruto in (FILTRO_TODAS, "all"):
        return FILTRO_TODAS
    if bruto in ("aprovada", "aprovadas", "aceita", "aceitas"):
        return "aprovada"
    if bruto in ("recusada", "recusadas"):
        return "recusada"
    raise ValueError(
        f"Filtro de status inválido: {valor!r}. Use todas, aprovada ou recusada."
    )


def filtrar_notas_por_status(notas: list[Any], filtro: str) -> list[Any]:
    if filtro == FILTRO_TODAS:
        return notas
    alvo = filtro.lower()
    return [n for n in notas if str(n.get("status", "")).lower() == alvo]


def resposta_pagina_lote(
    lote: dict[str, Any],
    job_id: str,
    pagina: int,
    tamanho_pagina: int = TAMANHO_PAGINA_PADRAO,
    filtro_status: str | None = None,
) -> dict[str, Any]:
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
