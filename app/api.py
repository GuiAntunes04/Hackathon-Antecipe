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
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.config import PersistenciaLote, carregar_config
from app import db
from app.logging_setup import configurar_logging
from app import lote_cache, pipeline
from app.rules import aquecer_cache_validacao
from app.situacao_sacados import garantir_arquivo_situacao

logger = structlog.get_logger(__name__)

STATIC_DIR = Path(__file__).resolve().parent / "static"
DATA_DIR = Path("data")


def persistencia_lote_efetiva(app: FastAPI) -> PersistenciaLote:
    """Postgres configurado sem DB acessível → grava em JSON local."""
    return getattr(
        app.state,
        "persistencia_lote_efetiva",
        app.state.config.persistencia_lote,
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Inicializa config e logging na subida da aplicação."""
    config = carregar_config()
    configurar_logging(config.log_level)
    app.state.config = config
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    persistencia_efetiva: PersistenciaLote = config.persistencia_lote
    if config.persistencia_lote == "json":
        lote_cache.garantir_diretorio()
    elif db.verificar_conexao(config.database_url):
        with db.conexao(config.database_url) as conn:
            db.init_schema(conn)
        logger.info("postgres_schema_ok")
    else:
        logger.warning(
            "postgres_indisponivel_fallback_json",
            configurado=config.persistencia_lote,
        )
        persistencia_efetiva = "json"
        lote_cache.garantir_diretorio()
    app.state.persistencia_lote_efetiva = persistencia_efetiva

    if not config.caminho_situacao.is_file():
        garantir_arquivo_situacao(saida=config.caminho_situacao)

    if config.caminho_situacao.is_file():
        aquecer_cache_validacao(config.caminho_validadores, config.caminho_situacao)
    else:
        logger.warning(
            "situacao_cadastral_ausente",
            caminho=str(config.caminho_situacao),
        )

    logger.info(
        "aplicacao_iniciada",
        data_base=config.data_base.isoformat(),
        caminho_validadores=str(config.caminho_validadores),
        caminho_situacao=str(config.caminho_situacao),
        caminho_gabarito=str(config.caminho_gabarito) if config.caminho_gabarito else None,
        mock_validacao=config.mock_validacao,
        persistencia_lote=config.persistencia_lote,
        persistencia_lote_efetiva=persistencia_efetiva,
    )
    yield


app = FastAPI(
    title="Portal Antecipe",
    description="Validação de recebíveis contra regras configuráveis",
    lifespan=lifespan,
)


class _StaticNoCacheMiddleware(BaseHTTPMiddleware):
    """Evita JS/CSS antigo em cache (módulos ES importam outros arquivos)."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        path = request.url.path
        if path.startswith("/static/js/") or path.startswith("/static/css/"):
            response.headers["Cache-Control"] = "no-store, must-revalidate"
        return response


app.add_middleware(_StaticNoCacheMiddleware)

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
    config = app.state.config
    db_ok = db.verificar_conexao(config.database_url)
    corpo = {"status": "ok", "database": "ok" if db_ok else "erro"}
    if not db_ok:
        return JSONResponse(status_code=503, content=corpo)
    return JSONResponse(content=corpo)


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
        if not config.caminho_situacao.is_file():
            raise FileNotFoundError(
                f"Arquivo de situação cadastral não encontrado: {config.caminho_situacao}"
            )
        resultado = pipeline.validar_arquivo_csv(
            caminho_csv=destino,
            caminho_validadores=config.caminho_validadores,
            data_base=config.data_base,
            caminho_situacao=config.caminho_situacao,
            caminho_gabarito=config.caminho_gabarito,
        )
        job_id = lote_cache.salvar_lote(
            resultado,
            database_url=config.database_url,
            persistencia=persistencia_lote_efetiva(app),
            nome_arquivo=nome_seguro,
        )
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
    config = app.state.config
    try:
        resposta = lote_cache.resposta_lote_completo_job(
            job_id,
            database_url=config.database_url,
            persistencia=persistencia_lote_efetiva(app),
        )
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
