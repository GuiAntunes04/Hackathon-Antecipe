"""Resposta simulada de validação (temporária, até o pipeline real)."""

from __future__ import annotations

from typing import Any


def _notas_fixas() -> list[dict[str, Any]]:
    return [
        {
            "linha": 1,
            "nu_documento": "725714",
            "nome_sacado": "TECIDOS SANTARÉM LTDA ME",
            "data_vencimento": "07/10/2026",
            "valor_nominal": 2278.08,
            "status": "aprovada",
            "motivo": "",
            "valor_liquido": 2100.50,
        },
        {
            "linha": 2,
            "nu_documento": "1-759172",
            "nome_sacado": "SERRALHERIA VIOLETA S.A.",
            "data_vencimento": "23/10/2026",
            "valor_nominal": 3807.37,
            "status": "aprovada",
            "motivo": "",
            "valor_liquido": 1850.00,
        },
        {
            "linha": 3,
            "nu_documento": "000351153",
            "nome_sacado": "MARÍLIA CAMA, MESA E BANHO LTDA",
            "data_vencimento": "07/10/2026",
            "valor_nominal": 165.17,
            "status": "recusada",
            "motivo": "Valor abaixo do mínimo aceito pelo fundo (R$ 100,00).",
            "valor_liquido": None,
        },
        {
            "linha": 4,
            "nu_documento": "286288",
            "nome_sacado": "ESCOLA SANTA MARIA LTDA",
            "data_vencimento": "11/10/2026",
            "valor_nominal": 192.14,
            "status": "aprovada",
            "motivo": "",
            "valor_liquido": 3200.75,
        },
        {
            "linha": 5,
            "nu_documento": "CHQ-9912",
            "nome_sacado": "COMERCIAL EXEMPLO LTDA",
            "data_vencimento": "15/11/2026",
            "valor_nominal": 5000.00,
            "status": "recusada",
            "motivo": "Tipo de recebível não aceito pelo fundo (só Duplicata e Duplicata de Serviço).",
            "valor_liquido": None,
        },
        {
            "linha": 6,
            "nu_documento": "440012",
            "nome_sacado": "DISTRIBUIDORA NORTE SA",
            "data_vencimento": "01/12/2026",
            "valor_nominal": 1100.00,
            "status": "aprovada",
            "motivo": "",
            "valor_liquido": 980.20,
        },
        {
            "linha": 7,
            "nu_documento": "778899",
            "nome_sacado": "LOJA CENTRAL ME",
            "data_vencimento": "10/09/2026",
            "valor_nominal": 890.00,
            "status": "recusada",
            "motivo": "Nota já vencida na data-base da operação.",
            "valor_liquido": None,
        },
        {
            "linha": 8,
            "nu_documento": "725714",
            "nome_sacado": "TECIDOS SANTARÉM LTDA ME",
            "data_vencimento": "07/10/2026",
            "valor_nominal": 2278.08,
            "status": "recusada",
            "motivo": "Esta nota aparece duplicada no lote (mesmo número e cedente).",
            "valor_liquido": None,
        },
        {
            "linha": 9,
            "nu_documento": "551200",
            "nome_sacado": "INDÚSTRIA VALE VERDE LTDA",
            "data_vencimento": "20/01/2027",
            "valor_nominal": 1600.00,
            "status": "aprovada",
            "motivo": "",
            "valor_liquido": 1500.00,
        },
        {
            "linha": 10,
            "nu_documento": "990001",
            "nome_sacado": "MEGA ATACADO S.A.",
            "data_vencimento": "05/03/2027",
            "valor_nominal": 25000.00,
            "status": "recusada",
            "motivo": "Concentração no sacado acima do limite permitido (10% do lote).",
            "valor_liquido": None,
        },
    ]


def resultado_simulado() -> dict[str, Any]:
    """Retorna JSON no formato esperado pela tela e pela API."""
    notas = _notas_fixas()
    total = sum(
        n["valor_liquido"]
        for n in notas
        if n.get("status") == "aprovada" and n.get("valor_liquido") is not None
    )
    return {
        "total_a_receber": round(total, 2),
        "notas": notas,
    }
