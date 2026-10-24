"""Rotas FastAPI: API de validação, saúde e tela web."""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator
from uuid import uuid4

import structlog
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles

from app.config import carregar_config
from app.logging_setup import configurar_logging
from app import lote_cache, pipeline
from app.rules import aquecer_cache_validacao
from app.situacao_sacados import garantir_arquivo_situacao, incorporar_sacados_do_csv

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
    lote_cache.garantir_diretorio()
    situacao = garantir_arquivo_situacao()
    aquecer_cache_validacao(config.caminho_validadores, situacao)
    logger.info(
        "aplicacao_iniciada",
        data_base=config.data_base.isoformat(),
        caminho_validadores=str(config.caminho_validadores),
        situacao_sacados=str(situacao) if situacao else None,
    )
    yield


app = FastAPI(
    title="Portal Antecipe",
    description="Validação de recebíveis contra regras configuráveis",
    lifespan=lifespan,
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

HERO_FUNDO_ARQUIVO = STATIC_DIR / "img" / "hero-mountains.png"
HERO_FUNDO_PATH = (
    "/image/attachment%3A747c3084-f408-402e-9244-6dcadc901e40%3Aimage.png"
)


@app.get(HERO_FUNDO_PATH)
def hero_fundo_portal() -> FileResponse:
    """Serve a arte de fundo na URL usada pelo layout (compatível com link Notion/Cursor)."""
    if not HERO_FUNDO_ARQUIVO.is_file():
        raise HTTPException(status_code=404, detail="Imagem de fundo não encontrada.")
    return FileResponse(HERO_FUNDO_ARQUIVO, media_type="image/png")


@app.get("/saude")
def saude() -> JSONResponse:
    """Endpoint de saúde para monitoramento e Docker."""
    return JSONResponse(content={"status": "ok"})


@app.get("/", response_model=None)
def tela() -> Response:
    """Serve a tela de upload e resultados (sempre pipeline real no upload)."""
    return FileResponse(STATIC_DIR / "index.html")


@app.post("/validar")
async def validar(arquivo: UploadFile = File(...)) -> JSONResponse:
    """Valida o CSV inteiro de uma vez, persiste o lote e devolve todas as notas."""
    config = app.state.config

    conteudo = await arquivo.read()
    if not conteudo:
        raise HTTPException(status_code=400, detail="Arquivo CSV vazio.")

    nome_seguro = Path(arquivo.filename or "upload.csv").name
    destino = DATA_DIR / f"{uuid4().hex}_{nome_seguro}"

    logger.info(
        "validar_solicitado",
        nome_arquivo=arquivo.filename,
        content_type=arquivo.content_type,
    )

    try:
        destino.write_bytes(conteudo)
        caminho_situacao = incorporar_sacados_do_csv(destino)
        resultado = pipeline.validar_arquivo_csv(
            caminho_csv=destino,
            caminho_validadores=config.caminho_validadores,
            data_base=config.data_base,
            caminho_situacao=caminho_situacao,
        )
        job_id = lote_cache.salvar_lote(resultado)
        resposta = lote_cache.resposta_lote_completo(resultado, job_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        destino.unlink(missing_ok=True)

    logger.info(
        "validar_concluido",
        job_id=job_id,
        total_notas=resposta["paginacao"]["total_linhas"],
    )
    return JSONResponse(content=resposta)


@app.get("/validar/lote/{job_id}")
def validar_lote(job_id: str) -> JSONResponse:
    """Devolve o lote completo já validado."""
    try:
        lote = lote_cache.carregar_lote(job_id)
        resposta = lote_cache.resposta_lote_completo(lote, job_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    logger.info(
        "validar_lote_lido",
        job_id=job_id,
        total_notas=resposta["paginacao"]["total_linhas"],
    )
    return JSONResponse(content=resposta)
