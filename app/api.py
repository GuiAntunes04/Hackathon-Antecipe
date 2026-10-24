"""Rotas FastAPI: API de validação, saúde e tela web."""

from __future__ import annotations

import json
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator
from uuid import uuid4

import structlog
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles

from app.config import carregar_config
from app.logging_setup import configurar_logging
from app import lote_cache, mock_validacao, pipeline

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
    logger.info(
        "aplicacao_iniciada",
        data_base=config.data_base.isoformat(),
        caminho_validadores=str(config.caminho_validadores),
        mock_validacao=config.mock_validacao,
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
async def validar(
    arquivo: UploadFile = File(...),
    pagina: int = Query(1, ge=1),
    tamanho_pagina: int = Query(
        lote_cache.TAMANHO_PAGINA_PADRAO, ge=1, le=500
    ),
    status: str | None = Query(None, description="todas | aprovada | recusada"),
) -> JSONResponse:
    """Valida o CSV inteiro, persiste o lote e devolve a página solicitada."""
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
        pagina=pagina,
        tamanho_pagina=tamanho_pagina,
        status=status,
    )

    try:
        destino.write_bytes(conteudo)
        resultado = pipeline.validar_arquivo_csv(
            caminho_csv=destino,
            caminho_validadores=config.caminho_validadores,
            data_base=config.data_base,
        )
        job_id = lote_cache.salvar_lote(resultado)
        resposta = lote_cache.resposta_pagina_lote(
            resultado,
            job_id,
            pagina=pagina,
            tamanho_pagina=tamanho_pagina,
            filtro_status=status,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        destino.unlink(missing_ok=True)

    logger.info(
        "validar_pagina",
        job_id=job_id,
        pagina=resposta["paginacao"]["pagina"],
        total_paginas=resposta["paginacao"]["total_paginas"],
    )
    return JSONResponse(content=resposta)


@app.get("/validar/lote/{job_id}")
def validar_lote_pagina(
    job_id: str,
    pagina: int = Query(1, ge=1),
    tamanho_pagina: int = Query(
        lote_cache.TAMANHO_PAGINA_PADRAO, ge=1, le=500
    ),
    status: str | None = Query(None, description="todas | aprovada | recusada"),
) -> JSONResponse:
    """Devolve uma página de notas já validadas do lote."""
    try:
        lote = lote_cache.carregar_lote(job_id)
        resposta = lote_cache.resposta_pagina_lote(
            lote,
            job_id,
            pagina=pagina,
            tamanho_pagina=tamanho_pagina,
            filtro_status=status,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    logger.info(
        "validar_lote_pagina",
        job_id=job_id,
        pagina=resposta["paginacao"]["pagina"],
        total_paginas=resposta["paginacao"]["total_paginas"],
        filtro_status=resposta.get("filtro_status"),
    )
    return JSONResponse(content=resposta)
