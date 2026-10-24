"""Rotas FastAPI: API de validação, saúde e tela web."""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator

import structlog
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse

from app.config import carregar_config
from app.logging_setup import configurar_logging
from app import pipeline

logger = structlog.get_logger(__name__)

STATIC_DIR = Path(__file__).resolve().parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Inicializa config e logging na subida da aplicação."""
    config = carregar_config()
    configurar_logging(config.log_level)
    app.state.config = config
    logger.info(
        "aplicacao_iniciada",
        data_base=config.data_base.isoformat(),
        caminho_validadores=str(config.caminho_validadores),
    )
    yield


app = FastAPI(
    title="Portal Antecipe",
    description="Validação de recebíveis contra regras configuráveis",
    lifespan=lifespan,
)


@app.get("/saude")
def saude() -> JSONResponse:
    """Endpoint de saúde para monitoramento e Docker."""
    return JSONResponse(content={"status": "ok"})


@app.get("/")
def tela() -> FileResponse:
    """Serve a tela de upload e resultados."""
    return FileResponse(STATIC_DIR / "index.html")


@app.post("/validar")
async def validar(arquivo: UploadFile = File(...)) -> JSONResponse:
    """
    Recebe CSV de notas e devolve resultado da validação (API).

    Implementação completa virá com o pipeline.
    """
    config = app.state.config
    logger.info(
        "validar_solicitado",
        nome_arquivo=arquivo.filename,
        content_type=arquivo.content_type,
    )
    # Persistência temporária em data/ será implementada com o pipeline
    resultado = pipeline.validar_arquivo_csv(
        caminho_csv=Path("data") / (arquivo.filename or "upload.csv"),
        caminho_validadores=config.caminho_validadores,
        data_base=config.data_base,
    )
    return JSONResponse(content=resultado)
