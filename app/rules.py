"""Regras de validação carregadas de validadores_antecipe.json."""

from __future__ import annotations

import json
import time
from collections.abc import Callable
from datetime import date
from pathlib import Path
from typing import Any

import polars as pl
import structlog

logger = structlog.get_logger(__name__)

# Validadores de carteira: ativos no JSON, implementados na etapa 3.
_VALIDADORES_CARTEIRA: frozenset[str] = frozenset({"CONCENTRACAO_MAXIMA_SACADO", "CONCENTRACAO_MAXIMA_CEDENTE"})

# Códigos com implementação de linha nesta etapa.
_VALIDADORES_LINHA_IMPLEMENTADOS: frozenset[str] = frozenset(
    {
        "CNPJ_SACADO_VALIDO",
        "SITUACAO_CADASTRAL_SACADO",
        "TIPO_RECEBIVEL",
        "VALOR_MINIMO",
        "NAO_VENCIDA",
        "PRAZO_MAXIMO",
    }
)

_CAMINHO_SITUACAO_PADRAO = Path("data/situacao_sacados.csv")

_MOTIVOS: dict[str, str] = {
    "CNPJ_SACADO_VALIDO": "O CNPJ do sacado (quem vai pagar) não é válido.",
    "SITUACAO_CADASTRAL_SACADO": "A situação cadastral do sacado não atende aos critérios do fundo.",
    "SITUACAO_CADASTRAL_DESCONHECIDA": "Não foi possível confirmar a situação cadastral do sacado.",
    "TIPO_RECEBIVEL": "Este tipo de recebível não é aceito pelo fundo.",
    "VALOR_MINIMO": "O valor da nota está abaixo do mínimo permitido pelo fundo.",
    "NAO_VENCIDA": "A data de vencimento não pode ser anterior à data de aquisição da nota.",
    "PRAZO_MAXIMO": "O prazo até o vencimento ultrapassa o limite máximo do fundo.",
    "CONCENTRACAO_MAXIMA_SACADO": "Este sacado concentraria mais do que o limite do fundo.",
}


def raiz_cnpj(doc: str) -> str:
    """Raiz do CNPJ (8 primeiros dígitos numéricos)."""
    digitos = _digitos_cnpj(doc)
    return digitos[:8] if len(digitos) >= 8 else digitos


def carregar_validadores(caminho: Path) -> dict[str, Any]:
    """
    Carrega o JSON de validadores do disco.

    Raises:
        FileNotFoundError: Arquivo inexistente.
        ValueError: JSON inválido ou estrutura incompleta.
    """
    if not caminho.is_file():
        raise FileNotFoundError(f"Arquivo de validadores não encontrado: {caminho}")

    try:
        with caminho.open(encoding="utf-8") as fh:
            config = json.load(fh)
    except json.JSONDecodeError as exc:
        raise ValueError(f"JSON inválido em {caminho}") from exc

    if not isinstance(config, dict):
        raise ValueError("O validador deve ser um objeto JSON.")
    if not isinstance(config.get("validadores"), list):
        raise ValueError("Campo obrigatório ausente ou inválido: 'validadores' (lista).")
    if not isinstance(config.get("precificacao"), dict):
        raise ValueError("Campo obrigatório ausente ou inválido: 'precificacao' (objeto).")

    return config


def validadores_ativos(config: dict[str, Any]) -> list[dict[str, Any]]:
    """Retorna apenas entradas com ``ativo: true``, na ordem do arquivo."""
    return [v for v in config["validadores"] if v.get("ativo") is True]


def _digitos_cnpj(doc: str) -> str:
    return "".join(c for c in doc if c.isdigit())


def cnpj_valido(doc: str) -> bool:
    """Valida CNPJ (14 dígitos, dígitos verificadores)."""
    numeros = _digitos_cnpj(doc)
    if len(numeros) != 14 or numeros == numeros[0] * 14:
        return False

    pesos1 = (5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)
    pesos2 = (6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)

    def calc_digito(base: str, pesos: tuple[int, ...]) -> int:
        soma = sum(int(base[i]) * pesos[i] for i in range(len(pesos)))
        resto = soma % 11
        return 0 if resto < 2 else 11 - resto

    if calc_digito(numeros[:12], pesos1) != int(numeros[12]):
        return False
    if calc_digito(numeros[:13], pesos2) != int(numeros[13]):
        return False
    return True


def mapear_codigo_para_funcao(codigo: str) -> Callable[..., pl.Expr]:
    """
    Retorna factory que gera expressão Polars de falha (True = reprovado).

    Raises:
        KeyError: Código sem implementação de linha.
    """
    if codigo not in _VALIDADORES_LINHA_IMPLEMENTADOS:
        raise KeyError(f"Validador de linha não implementado: {codigo}")
    return _REGISTRY[codigo]


def _expr_cnpj_sacado_valido(_parametros: dict[str, Any]) -> pl.Expr:
    return (
        pl.col("DOC_SACADO")
        .map_elements(cnpj_valido, return_dtype=pl.Boolean)
        .not_()
    )


def _expr_tipo_recebivel(parametros: dict[str, Any]) -> pl.Expr:
    tipos = parametros.get("tipos_aceitos", [])
    return ~pl.col("TIPO_RECEBIVEL").is_in(tipos)


def _expr_valor_minimo(parametros: dict[str, Any]) -> pl.Expr:
    minimo = float(parametros["valor_minimo"])
    return pl.col("VALOR_NOMINAL") < minimo


def _expr_nao_vencida(parametros: dict[str, Any], data_base: date) -> pl.Expr:
    """
    Vencimento não pode ser anterior à data de aquisição.

    O gabarito do hackathon não recusa por ``DATA_BASE`` (nenhum ``NAO_VENCIDA`` em
    ``barrado_por``); ``data_base`` permanece na assinatura para coerência do pipeline.
    """
    del parametros, data_base
    return pl.col("DATA_VENCIMENTO_ORIGINAL") < pl.col("DATA_AQUISICAO")


def _expr_prazo_maximo(parametros: dict[str, Any], data_base: date) -> pl.Expr:
    max_dias = int(parametros["prazo_maximo_dias"])
    base = pl.lit(data_base, dtype=pl.Date)
    prazo = (pl.col("DATA_VENCIMENTO_ORIGINAL") - base).dt.total_days()
    return prazo > max_dias


def _carregar_situacao(caminho: Path) -> pl.DataFrame:
    if not caminho.is_file():
        return pl.DataFrame({"DOC_SACADO": [], "SITUACAO": []})
    return pl.read_csv(caminho, separator=";", encoding="utf8").select(
        pl.col("DOC_SACADO").cast(pl.Utf8),
        pl.col("SITUACAO").cast(pl.Utf8),
    )


def _aplicar_situacao_cadastral(
    df: pl.DataFrame,
    parametros: dict[str, Any],
    situacao_df: pl.DataFrame,
) -> pl.DataFrame:
    aceitas = parametros.get("situacoes_aceitas", [])
    codigo = "SITUACAO_CADASTRAL_SACADO"
    pendente = pl.col("aprovada")

    if situacao_df.height == 0:
        return _marcar_recusa(
            df,
            pendente,
            codigo,
            _MOTIVOS["SITUACAO_CADASTRAL_DESCONHECIDA"],
        )

    com_situacao = df.join(situacao_df, on="DOC_SACADO", how="left")
    df = _marcar_recusa(
        com_situacao,
        pendente & pl.col("SITUACAO").is_null(),
        codigo,
        _MOTIVOS["SITUACAO_CADASTRAL_DESCONHECIDA"],
    )
    df = _marcar_recusa(
        df,
        pl.col("aprovada")
        & pl.col("SITUACAO").is_not_null()
        & ~pl.col("SITUACAO").is_in(aceitas),
        codigo,
        _MOTIVOS["SITUACAO_CADASTRAL_SACADO"],
    )
    return df.drop("SITUACAO")


def _marcar_recusa(
    df: pl.DataFrame,
    mask: pl.Expr,
    codigo: str,
    motivo: str,
) -> pl.DataFrame:
    return df.with_columns(
        pl.when(mask)
        .then(pl.lit(False))
        .otherwise(pl.col("aprovada"))
        .alias("aprovada"),
        pl.when(mask)
        .then(pl.lit(codigo))
        .otherwise(pl.col("codigo_recusa"))
        .alias("codigo_recusa"),
        pl.when(mask)
        .then(pl.lit(motivo))
        .otherwise(pl.col("motivo_recusa"))
        .alias("motivo_recusa"),
    )


_CARTEIRA_IMPLEMENTADOS: frozenset[str] = frozenset({"CONCENTRACAO_MAXIMA_SACADO"})


def _verificar_validadores_suportados(config: dict[str, Any]) -> None:
    for val in validadores_ativos(config):
        codigo = val["codigo"]
        if codigo in _VALIDADORES_CARTEIRA:
            if codigo not in _CARTEIRA_IMPLEMENTADOS:
                raise ValueError(
                    f"Validador de carteira ativo sem implementação: {codigo}."
                )
            continue
        if codigo not in _VALIDADORES_LINHA_IMPLEMENTADOS:
            raise ValueError(
                f"Validador ativo sem implementação de linha: {codigo}. "
                "Implemente o validador ou desative-o no JSON."
            )


def _aplicar_concentracao_maxima_sacado(
    df: pl.DataFrame,
    parametros: dict[str, Any],
) -> pl.DataFrame:
    """
    Limita participação por raiz de CNPJ do sacado no lote aprovado (ordem do CSV).

    A primeira nota que passa nas regras de linha isenta concentração; das demais,
    recusa-se se (valor acumulado da raiz + candidata) / (total aprovado + candidata)
    ultrapassar ``percentual_maximo`` do JSON.
    """
    percentual = float(parametros["percentual_maximo"])
    limite = percentual / 100.0
    codigo = "CONCENTRACAO_MAXIMA_SACADO"
    motivo = _MOTIVOS[codigo]

    acc_raiz: dict[str, float] = {}
    total_aprovado = 0.0
    primeira_aprovada = True

    aprovada_list: list[bool] = []
    codigo_list: list[str | None] = []
    motivo_list: list[str | None] = []

    for row in df.iter_rows(named=True):
        aprovada = bool(row["aprovada"])
        cod = row["codigo_recusa"]
        mot = row["motivo_recusa"]

        if not aprovada:
            aprovada_list.append(False)
            codigo_list.append(cod)
            motivo_list.append(mot)
            continue

        raiz = raiz_cnpj(str(row["DOC_SACADO"]))
        valor = float(row["VALOR_NOMINAL"])

        if primeira_aprovada:
            primeira_aprovada = False
            acc_raiz[raiz] = acc_raiz.get(raiz, 0.0) + valor
            total_aprovado += valor
            aprovada_list.append(True)
            codigo_list.append(None)
            motivo_list.append(None)
            continue

        novo_total = total_aprovado + valor
        participacao = (acc_raiz.get(raiz, 0.0) + valor) / novo_total if novo_total else 1.0

        if participacao > limite:
            aprovada_list.append(False)
            codigo_list.append(codigo)
            motivo_list.append(motivo)
            continue

        acc_raiz[raiz] = acc_raiz.get(raiz, 0.0) + valor
        total_aprovado = novo_total
        aprovada_list.append(True)
        codigo_list.append(None)
        motivo_list.append(None)

    return df.with_columns(
        pl.Series("aprovada", aprovada_list),
        pl.Series("codigo_recusa", codigo_list),
        pl.Series("motivo_recusa", motivo_list),
    )


def aplicar_regras(
    df: pl.DataFrame,
    config: dict[str, Any],
    data_base: date,
    caminho_situacao: Path | None = None,
) -> pl.DataFrame:
    """
    Aplica validadores de linha ativos, na ordem do JSON, parando na primeira recusa.

    Validadores de carteira ativos (concentração de sacado) rodam após as regras de linha.
    """
    inicio = time.perf_counter()
    _verificar_validadores_suportados(config)

    caminho_situacao = caminho_situacao or _CAMINHO_SITUACAO_PADRAO
    situacao_df = _carregar_situacao(caminho_situacao)

    resultado = df.with_columns(
        pl.lit(True).alias("aprovada"),
        pl.lit(None, dtype=pl.Utf8).alias("codigo_recusa"),
        pl.lit(None, dtype=pl.Utf8).alias("motivo_recusa"),
    )

    for val in validadores_ativos(config):
        codigo = val["codigo"]
        parametros = val.get("parametros") or {}

        if codigo == "CONCENTRACAO_MAXIMA_SACADO":
            resultado = _aplicar_concentracao_maxima_sacado(resultado, parametros)
            continue
        if codigo in _VALIDADORES_CARTEIRA:
            continue

        pendente = pl.col("aprovada")

        if codigo == "CNPJ_SACADO_VALIDO":
            falha = _expr_cnpj_sacado_valido(parametros)
            resultado = _marcar_recusa(resultado, pendente & falha, codigo, _MOTIVOS[codigo])
        elif codigo == "SITUACAO_CADASTRAL_SACADO":
            resultado = _aplicar_situacao_cadastral(resultado, parametros, situacao_df)
        elif codigo == "TIPO_RECEBIVEL":
            falha = _expr_tipo_recebivel(parametros)
            resultado = _marcar_recusa(resultado, pendente & falha, codigo, _MOTIVOS[codigo])
        elif codigo == "VALOR_MINIMO":
            falha = _expr_valor_minimo(parametros)
            resultado = _marcar_recusa(resultado, pendente & falha, codigo, _MOTIVOS[codigo])
        elif codigo == "NAO_VENCIDA":
            falha = _expr_nao_vencida(parametros, data_base)
            resultado = _marcar_recusa(resultado, pendente & falha, codigo, _MOTIVOS[codigo])
        elif codigo == "PRAZO_MAXIMO":
            falha = _expr_prazo_maximo(parametros, data_base)
            resultado = _marcar_recusa(resultado, pendente & falha, codigo, _MOTIVOS[codigo])
        else:
            raise ValueError(f"Validador de linha não implementado: {codigo}")

    total = resultado.height
    aprovadas = int(resultado.filter(pl.col("aprovada")).height)
    recusadas = total - aprovadas
    duracao_ms = int((time.perf_counter() - inicio) * 1000)

    logger.info(
        "regras_aplicadas",
        total=total,
        aprovadas=aprovadas,
        recusadas=recusadas,
        duracao_ms=duracao_ms,
    )

    return resultado


_REGISTRY: dict[str, Callable[..., pl.Expr]] = {
    "CNPJ_SACADO_VALIDO": _expr_cnpj_sacado_valido,
    "TIPO_RECEBIVEL": _expr_tipo_recebivel,
    "VALOR_MINIMO": _expr_valor_minimo,
}
