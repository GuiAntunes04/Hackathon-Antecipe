"""Orquestra leitura, validação e precificação."""

from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import Any


def validar_arquivo_csv(
    caminho_csv: Path,
    caminho_validadores: Path,
    data_base: date,
) -> dict[str, Any]:
    """
    Executa reader -> rules -> pricing e monta o resultado agregado.

    Returns:
        Dicionário com notas (status, motivo, valor líquido) e total a receber.

    Raises:
        NotImplementedError: Implementação pendente.
    """
    raise NotImplementedError("Pipeline de validação ainda não implementado.")
