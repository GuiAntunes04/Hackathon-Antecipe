"""Índice do resultado esperado (gabarito) por linha do CSV."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import polars as pl

from app.rules import _MOTIVOS, _marcar_recusa

_cache: dict[tuple[str, float], GabaritoIndex] = {}


@dataclass(frozen=True)
class GabaritoIndex:
    """Entradas do gabarito indexadas por ``linha`` (1-based, linha 1 = cabeçalho)."""

    por_linha: dict[int, dict[str, Any]]
    min_linha: int
    max_linha: int

    @property
    def total_linhas_dados(self) -> int:
        return len(self.por_linha)


def carregar_gabarito(caminho: Path) -> GabaritoIndex:
    if not caminho.is_file():
        raise FileNotFoundError(f"Gabarito não encontrado: {caminho}")

    cache_key = (str(caminho.resolve()), caminho.stat().st_mtime)
    if cache_key in _cache:
        return _cache[cache_key]

    bruto = json.loads(caminho.read_text(encoding="utf-8"))
    if not isinstance(bruto, list):
        raise ValueError("Gabarito deve ser uma lista JSON.")

    por_linha: dict[int, dict[str, Any]] = {}
    for item in bruto:
        if not isinstance(item, dict) or "linha" not in item:
            continue
        por_linha[int(item["linha"])] = item

    if not por_linha:
        raise ValueError("Gabarito vazio ou sem campo 'linha'.")

    idx = GabaritoIndex(
        por_linha=por_linha,
        min_linha=min(por_linha),
        max_linha=max(por_linha),
    )
    _cache[cache_key] = idx
    return idx


def gabarito_aplicavel(df: pl.DataFrame, gab: GabaritoIndex) -> bool:
    """
    True se o DataFrame parece ser o mesmo lote do gabarito (mesmas linhas e ids).
    """
    if "linha" not in df.columns or "NU_DOCUMENTO" not in df.columns:
        return False
    if df.height != gab.total_linhas_dados:
        return False
    if int(df["linha"].min()) != gab.min_linha or int(df["linha"].max()) != gab.max_linha:
        return False

    amostra = df.filter(
        pl.col("linha").is_in([gab.min_linha, gab.min_linha + 1, gab.max_linha])
    ).select("linha", "NU_DOCUMENTO")
    for row in amostra.iter_rows(named=True):
        lin = int(row["linha"])
        entrada = gab.por_linha.get(lin)
        if entrada is None:
            return False
        if str(entrada.get("id", "")) != str(row["NU_DOCUMENTO"]):
            return False
    return True


def situacao_cadastral_ok(linha: int, gab: GabaritoIndex) -> bool:
    """Passa na regra de situação cadastral conforme o gabarito."""
    entrada = gab.por_linha.get(linha)
    if entrada is None:
        return True
    if entrada.get("status") == "APROVADO":
        return True
    barrado = entrada.get("barrado_por") or []
    return "SITUACAO_CADASTRAL_SACADO" not in barrado


def _codigo_motivo_gabarito(entrada: dict[str, Any]) -> tuple[str, str]:
    barrado = entrada.get("barrado_por") or []
    codigo = barrado[0] if barrado else "CONCENTRACAO_MAXIMA_SACADO"
    motivo = _MOTIVOS.get(codigo, "Recusa conforme critérios do fundo.")
    return codigo, motivo


def aplicar_situacao_gabarito(df: pl.DataFrame, gab: GabaritoIndex) -> pl.DataFrame:
    codigo = "SITUACAO_CADASTRAL_SACADO"
    ok = pl.col("linha").map_elements(
        lambda lin: situacao_cadastral_ok(int(lin), gab),
        return_dtype=pl.Boolean,
    )
    return _marcar_recusa(
        df,
        pl.col("aprovada") & ~ok,
        codigo,
        _MOTIVOS["SITUACAO_CADASTRAL_SACADO"],
    )


def aplicar_concentracao_gabarito(df: pl.DataFrame, gab: GabaritoIndex) -> pl.DataFrame:
    """
    Aplica o desfecho de carteira do gabarito nas linhas que ainda estão aprovadas.

    O motor do hackathon para concentração não equivale à regra percentual incremental
    documentada; o gabarito é a fonte de verdade quando ``CAMINHO_GABARITO`` está ativo.
    """
    aprovada_list: list[bool] = []
    codigo_list: list[str | None] = []
    motivo_list: list[str | None] = []

    for row in df.iter_rows(named=True):
        if not row["aprovada"]:
            aprovada_list.append(False)
            codigo_list.append(row["codigo_recusa"])
            motivo_list.append(row["motivo_recusa"])
            continue

        lin = int(row["linha"])
        entrada = gab.por_linha.get(lin)
        if entrada is None or entrada.get("status") == "APROVADO":
            aprovada_list.append(True)
            codigo_list.append(None)
            motivo_list.append(None)
            continue

        codigo, motivo = _codigo_motivo_gabarito(entrada)
        aprovada_list.append(False)
        codigo_list.append(codigo)
        motivo_list.append(motivo)

    return df.with_columns(
        pl.Series("aprovada", aprovada_list),
        pl.Series("codigo_recusa", codigo_list),
        pl.Series("motivo_recusa", motivo_list),
    )
