"""Helpers de paginação e filtro de status (compartilhados por JSON e Postgres)."""

from __future__ import annotations

import math
from typing import Any

TAMANHO_PAGINA_PADRAO = 10
FILTRO_TODAS = "todas"
FILTROS_STATUS_VALIDOS = frozenset({FILTRO_TODAS, "aprovada", "recusada"})


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


def fatiar_notas(notas: list[Any], pagina: int, tamanho_pagina: int) -> list[Any]:
    inicio = (pagina - 1) * tamanho_pagina
    fim = inicio + tamanho_pagina
    return notas[inicio:fim]


def filtrar_notas_por_status(notas: list[Any], filtro: str) -> list[Any]:
    if filtro == FILTRO_TODAS:
        return notas
    alvo = filtro.lower()
    return [n for n in notas if str(n.get("status", "")).lower() == alvo]
