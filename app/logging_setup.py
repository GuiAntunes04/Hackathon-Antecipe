"""Configuração de logs estruturados em JSON."""

from __future__ import annotations

import logging
import sys

import structlog


def configurar_logging(nivel: str = "INFO") -> None:
    """Inicializa structlog com saída JSON e nível informado."""
    nivel_log = getattr(logging, nivel.upper(), logging.INFO)
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=nivel_log,
    )
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(nivel_log),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )
