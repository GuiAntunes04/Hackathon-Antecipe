"""Rotas FastAPI: API de validação, saúde e tela web."""

from __future__ import annotations

import json
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator

import structlog
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles

from app.config import carregar_config
from app.logging_setup import configurar_logging
from app import mock_validacao, pipeline
from app.rules import aquecer_cache_validacao

logger = structlog.get_logger(__name__)

STATIC_DIR = Path(__file__).resolve().parent / "static"
DATA_DIR = Path("data")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Inicializa config e logging na subida da aplicação."""
    config = carregar_config()
    configurar_logging(config.log_level)
    app.state.config = config
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    situacao = DATA_DIR / "situacao_sacados.csv"
    if not situacao.is_file():
        situacao = Path("data/situacao_sacados.csv")
    aquecer_cache_validacao(config.caminho_validadores, situacao if situacao.is_file() else None)
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

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/saude")
def saude() -> JSONResponse:
    """Endpoint de saúde para monitoramento e Docker."""
    return JSONResponse(content={"status": "ok"})


@app.get("/", response_model=None)
def tela() -> Response:
    """Serve a tela de upload e resultados."""
    config = app.state.config
    index_path = STATIC_DIR / "index.html"
    if not config.mock_validacao:
        return FileResponse(index_path)

    html = index_path.read_text(encoding="utf-8")
    payload = json.dumps(mock_validacao.resultado_simulado(), ensure_ascii=False)
    payload = payload.replace("</", "<\\/")
    injecao = (
        f'<script id="antecipe-demo-data" type="application/json">{payload}</script>\n'
    )
    if "</body>" in html:
        html = html.replace("</body>", injecao + "</body>", 1)
    else:
        html = html + injecao

    return HTMLResponse(
        content=html,
        headers={"Cache-Control": "no-store"},
    )


@app.get("/validar/demo")
def validar_demo() -> JSONResponse:
    """Retorna lote mock para a tela iniciar preenchida (somente com MOCK_VALIDACAO)."""
    config = app.state.config
    if not config.mock_validacao:
        raise HTTPException(status_code=404, detail="Demo indisponível")
    logger.info("validar_demo")
    return JSONResponse(content=mock_validacao.resultado_simulado())


@app.post("/validar")
async def validar(arquivo: UploadFile = File(...)) -> JSONResponse:
    """Recebe CSV de notas e devolve resultado da validação (API)."""
    config = app.state.config
    conteudo = await arquivo.read()

    if config.mock_validacao:
        logger.info(
            "validar_mock",
            nome_arquivo=arquivo.filename,
            content_type=arquivo.content_type,
        )
        return JSONResponse(content=mock_validacao.resultado_simulado())

    logger.info(
        "validar_solicitado",
        nome_arquivo=arquivo.filename,
        content_type=arquivo.content_type,
    )
    caminho_temp = DATA_DIR / f"{uuid.uuid4().hex}.csv"
    try:
        caminho_temp.write_bytes(conteudo)
        resultado = pipeline.validar_arquivo_csv(
            caminho_csv=caminho_temp,
            caminho_validadores=config.caminho_validadores,
            data_base=config.data_base,
        )
        return JSONResponse(content=resultado)
    except FileNotFoundError as exc:
        return JSONResponse(status_code=400, content={"erro": str(exc)})
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"erro": str(exc)})
    finally:
        if caminho_temp.is_file():
            caminho_temp.unlink(missing_ok=True)
