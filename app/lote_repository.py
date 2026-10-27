"""Persistência de lotes validados em PostgreSQL."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from typing import Any

import psycopg.rows

from app import db
from app.lote_paginacao import (
    TAMANHO_PAGINA_PADRAO,
    info_paginacao,
    normalizar_filtro_status,
)


def _parse_data_base(valor: str | date | None) -> date:
    if isinstance(valor, date):
        return valor
    if not valor:
        raise ValueError("data_base ausente no resultado da validação.")
    return date.fromisoformat(str(valor))


def _job_id_para_uuid(job_id: str) -> uuid.UUID:
    if not job_id.isalnum() or len(job_id) != 32:
        raise ValueError("Identificador de lote inválido.")
    return uuid.UUID(hex=job_id)


def _nota_para_linha(lote_id: uuid.UUID, nota: dict[str, Any]) -> tuple[Any, ...]:
    motivo = nota.get("motivo")
    if motivo is not None and str(motivo).strip() == "":
        motivo = None
    valor_liquido = nota.get("valor_liquido")
    return (
        lote_id,
        int(nota["linha"]),
        str(nota.get("nu_documento") or ""),
        str(nota.get("nome_sacado") or ""),
        str(nota.get("data_vencimento") or ""),
        Decimal(str(nota.get("valor_nominal") or 0)),
        str(nota.get("status") or ""),
        motivo,
        Decimal(str(valor_liquido)) if valor_liquido is not None else None,
    )


def _linha_para_nota(row: dict[str, Any]) -> dict[str, Any]:
    valor_liquido = row.get("valor_liquido")
    return {
        "linha": row["linha"],
        "nu_documento": row["nu_documento"],
        "nome_sacado": row["nome_sacado"],
        "data_vencimento": row["data_vencimento"],
        "valor_nominal": float(row["valor_nominal"]),
        "status": row["status"],
        "motivo": row["motivo"] or "",
        "valor_liquido": float(valor_liquido) if valor_liquido is not None else None,
    }


def salvar_lote_postgres(
    database_url: str,
    resultado: dict[str, Any],
    nome_arquivo: str | None = None,
) -> str:
    """Insere lote e notas (COPY) e devolve job_id (hex)."""
    notas = resultado.get("notas") or []
    resumo = resultado.get("resumo") or {}
    job_id = uuid.uuid4().hex
    lote_id = uuid.UUID(hex=job_id)
    data_base = _parse_data_base(resultado.get("data_base"))
    total_receber = Decimal(str(resultado.get("total_a_receber") or 0))

    with db.conexao(database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO validacao_lote (
                    id, data_base, total_a_receber,
                    total_linhas, aprovadas, recusadas, nome_arquivo
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    lote_id,
                    data_base,
                    total_receber,
                    int(resumo.get("total_linhas") or len(notas)),
                    int(resumo.get("aprovadas") or 0),
                    int(resumo.get("recusadas") or 0),
                    nome_arquivo,
                ),
            )
            if notas:
                linhas_copy = [_nota_para_linha(lote_id, nota) for nota in notas]
                with cur.copy(
                    """
                    COPY validacao_nota (
                        validacao_lote_id, linha, nu_documento, nome_sacado,
                        data_vencimento, valor_nominal, status, motivo, valor_liquido
                    ) FROM STDIN
                    """
                ) as copy:
                    for linha in linhas_copy:
                        copy.write_row(linha)
        conn.commit()
    return job_id


def _carregar_metadados_lote(
    conn: psycopg.Connection, lote_id: uuid.UUID
) -> dict[str, Any]:
    with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(
            """
            SELECT data_base, total_a_receber, total_linhas, aprovadas, recusadas
            FROM validacao_lote
            WHERE id = %s
            """,
            (lote_id,),
        )
        row = cur.fetchone()
    if row is None:
        raise FileNotFoundError(f"Lote não encontrado: {lote_id.hex}")
    return {
        "data_base": row["data_base"].isoformat(),
        "total_a_receber": float(row["total_a_receber"]),
        "resumo": {
            "total_linhas": row["total_linhas"],
            "aprovadas": row["aprovadas"],
            "recusadas": row["recusadas"],
        },
    }


def carregar_lote_completo_postgres(database_url: str, job_id: str) -> dict[str, Any]:
    """Carrega metadados + todas as notas em uma única consulta (sem COUNT extra)."""
    lote_id = _job_id_para_uuid(job_id)

    with db.conexao(database_url) as conn:
        meta = _carregar_metadados_lote(conn, lote_id)
        with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            cur.execute(
                """
                SELECT linha, nu_documento, nome_sacado, data_vencimento,
                       valor_nominal, status, motivo, valor_liquido
                FROM validacao_nota
                WHERE validacao_lote_id = %s
                ORDER BY linha
                """,
                (lote_id,),
            )
            notas = [_linha_para_nota(r) for r in cur.fetchall()]

    return {
        "data_base": meta["data_base"],
        "total_a_receber": meta["total_a_receber"],
        "resumo": meta["resumo"],
        "notas": notas,
    }


def pagina_lote_postgres(
    database_url: str,
    job_id: str,
    pagina: int,
    tamanho_pagina: int = TAMANHO_PAGINA_PADRAO,
    filtro_status: str | None = None,
) -> dict[str, Any]:
    """Consulta uma página de notas no Postgres (filtro + LIMIT/OFFSET)."""
    lote_id = _job_id_para_uuid(job_id)
    filtro = normalizar_filtro_status(filtro_status)

    with db.conexao(database_url) as conn:
        meta = _carregar_metadados_lote(conn, lote_id)

        params_count: list[Any] = [lote_id]
        filtro_sql = ""
        if filtro != "todas":
            filtro_sql = " AND status = %s"
            params_count.append(filtro)

        with conn.cursor() as cur:
            cur.execute(
                f"SELECT COUNT(*) FROM validacao_nota WHERE validacao_lote_id = %s{filtro_sql}",
                params_count,
            )
            total_linhas = int(cur.fetchone()[0])

        pag = info_paginacao(total_linhas, pagina, tamanho_pagina)
        offset = (pag["pagina"] - 1) * pag["tamanho_pagina"]

        params_page: list[Any] = [lote_id]
        if filtro != "todas":
            params_page.append(filtro)
        params_page.extend([pag["tamanho_pagina"], offset])

        with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
            cur.execute(
                f"""
                SELECT linha, nu_documento, nome_sacado, data_vencimento,
                       valor_nominal, status, motivo, valor_liquido
                FROM validacao_nota
                WHERE validacao_lote_id = %s{filtro_sql}
                ORDER BY linha
                LIMIT %s OFFSET %s
                """,
                params_page,
            )
            notas = [_linha_para_nota(r) for r in cur.fetchall()]

    return {
        "job_id": job_id,
        "data_base": meta["data_base"],
        "resumo": meta["resumo"],
        "total_a_receber": meta["total_a_receber"],
        "filtro_status": filtro,
        "paginacao": pag,
        "notas": notas,
    }
