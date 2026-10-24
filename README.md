# Portal Antecipe

## Visão geral

API e tela web para validar um CSV de recebíveis (notas) contra regras definidas em `validadores_antecipe.json`. Para cada nota, o sistema deve informar aprovação ou recusa, motivo em linguagem simples e valor líquido, além do total a receber. A mesma validação fica disponível pela interface e pelo endpoint `POST /validar`.

Fluxo completo: `POST /validar` valida o CSV inteiro (`pipeline`: reader → regras → precificação), persiste o lote (PostgreSQL 16 por padrão) e devolve a **primeira página** de notas (`job_id`, `resumo`, `paginacao`, `notas`). Páginas seguintes e filtros: `GET /validar/lote/{job_id}`. Demo com 10 notas fixas só em `GET /` e `GET /validar/demo` quando `MOCK_VALIDACAO=true`; o upload sempre usa o pipeline real.

**Situação cadastral:** o CSV de notas não traz situação do sacado. Use **`data/situacao_sacados.csv`** (padrão `CAMINHO_SITUACAO`), gerado pela **mescla** do mock oficial com os sacados do estoque:

```bash
python scripts/mesclar_situacao_sacados.py \
  --mock cnpj_situacao_mock.csv \
  --csv estoque_antecipe.csv \
  --saida data/situacao_sacados.csv
```

Regra: status do **mock** (`INAPTA`, `SUSPENSA`, …) quando o CNPJ existe no mock; sacados do estoque **fora** do mock → **`ATIVA`** (evita recusa por “situação desconhecida”). O mock **sozinho** (~3k CNPJs) não cobre todo o estoque (~4,2k sacados). A imagem Docker roda essa mescla no build.

Legado: `scripts/gerar_situacao_sacados.py` (todos `ATIVA`, ignora o mock).

**NAO_VENCIDA:** vencimento não pode ser anterior à `DATA_AQUISICAO` (alinhado ao gabarito; não compara vencimento com `DATA_BASE`).

**Concentração:** raiz do CNPJ = 8 primeiros dígitos; ordem do CSV; isenta a **primeira** nota aprovada no lote e a **primeira aprovada de cada raiz** (quando já houver ≥2 aprovadas e a raiz ainda não tiver sido avaliada nesta etapa); se a raiz já foi **recusada** por concentração e ainda não entrou no acumulado aprovado da raiz, novas candidatas da mesma raiz são recusadas; demais casos: `(acumulado da raiz + candidata) / (total aprovado + candidata) > percentual_maximo` do JSON.

Script opcional `gerar_situacao_gabarito.py` (legado) tenta alinhar ao gabarito — conflita com situação por linha vs por CNPJ.

**Upload novo vs carteira:** opcional `CAMINHO_ESTOQUE=estoque_antecipe.csv` recusa notas já presentes no estoque (não use ao revalidar o próprio estoque).

**Duplicidade no lote:** após as regras do JSON, a 2ª+ linha com o mesmo `DOC_CEDENTE`, `NU_DOCUMENTO` e `VALOR_NOMINAL` (2 casas decimais) no mesmo CSV é recusada (`DUPLICIDADE_LOTE`), se ainda estiver aprovada. Mesmo cedente e documento com **valores diferentes** não conta como duplicata. Desligue com `DUPLICIDADE_LOTE=false` (útil ao comparar com o gabarito do estoque, que valida linha a linha).

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + Compose v2)
- Opcional, para testes locais sem container da app: Python 3.12
- Opcional, para rebuild do CSS: [Node.js](https://nodejs.org/) (Tailwind 3)

## Front-end (Tailwind)

O estilo usa **Tailwind CSS**. Em desenvolvimento, `index.html` carrega o CDN do Tailwind (com `safelist` para classes montadas via JS).

Para build local do CSS (recomendado na entrega, sem CDN):

```bash
npm install
npm run build:css
```

Troque no `index.html` o script CDN por: `<link href="/static/css/tailwind.css" rel="stylesheet" />`.

Arquivos: `tailwind.config.js`, `app/static/css/input.css` → saída `app/static/css/tailwind.css`.

## Assets e marca (Kanastra)

| Pasta | Uso |
|-------|-----|
| `docs/brand/kanastra/` | Pacote de marca **referência** (guidelines, logos fonte, PDF). Não é exposto pela API. |
| `app/static/img/brand/` | Logos e imagens **servidas** em `/static/img/brand/...` |
| `app/static/fonts/` | Fontes web (`@font-face` em `main.css`) |

Detalhes: [docs/brand/kanastra/README.md](docs/brand/kanastra/README.md).

Ícones legados: `app/static/img/logo.svg`, `hero-mountains.png`.

## Como rodar do zero

Na raiz do projeto:

```bash
docker compose up --build
```

Aguarde os serviços `db` e `app` ficarem saudáveis. Em seguida:

| Recurso | URL |
|---------|-----|
| Tela de upload | http://localhost:8000/ |
| Saúde da API | http://localhost:8000/saude |
| Documentação OpenAPI | http://localhost:8000/docs |

Para parar: `Ctrl+C` e, se quiser remover volumes: `docker compose down -v`.

## API de validação

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/validar` | Upload CSV (`multipart` campo `arquivo`). Query: `pagina`, `tamanho_pagina` (1–500, default 10), `status` (`todas` \| `aprovada` \| `recusada`). |
| `GET` | `/validar/lote/{job_id}` | Mesma paginação/filtro para um lote já validado. |
| `GET` | `/saude` | `{"status":"ok","database":"ok"}` ou HTTP 503 se o Postgres não responder. |

Resposta (trecho): `job_id`, `data_base`, `resumo` (`total_linhas`, `aprovadas`, `recusadas`), `total_a_receber`, `filtro_status`, `paginacao`, `notas[]` (campos da tabela: documento, sacado, vencimento, valores, status, motivo).

Persistência: tabelas `validacao_lote` e `validacao_nota` (schema em `app/db.py`). Inserção em massa via `COPY`; paginação no SQL (`LIMIT`/`OFFSET`). Fallback `PERSISTENCIA_LOTE=json` grava em `data/lotes/{job_id}.json` (útil em dev sem banco).

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste se necessário (o Compose usa `.env.example` por padrão na subida):

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL PostgreSQL 16 (psycopg 3) | `postgresql://antecipe:...@db:5432/antecipe` |
| `PERSISTENCIA_LOTE` | `postgres` (padrão) ou `json` | `postgres` |
| `DATA_BASE` | Data-base dos cálculos (`dd/mm/aaaa`) — **nunca** usar data do sistema | `22/10/2026` |
| `CAMINHO_VALIDADORES` | Caminho do JSON de regras | `config/validadores_antecipe.json` |
| `CAMINHO_SITUACAO` | CSV situação (mesclado mock + estoque) | `data/situacao_sacados.csv` |
| `LOG_LEVEL` | Nível de log (`DEBUG`, `INFO`, …) | `INFO` |
| `CAMINHO_ESTOQUE` | (Opcional) CSV da carteira já comprada | `estoque_antecipe.csv` |
| `MOCK_VALIDACAO` | `true`: resposta fixa de 10 notas (demo); `false`: pipeline real | `false` |
| `DUPLICIDADE_LOTE` | Recusa repetidas (cedente + doc + valor) no mesmo envio | `true` |

O arquivo `config/validadores_antecipe.json` contém as regras do ANTECIPE FIDC (sincronizado com o JSON do hackathon).

## Como rodar os testes

Com ambiente virtual e dependências instaladas:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pytest
```

Testes de integração com Postgres (`tests/test_db.py`) rodam só se o banco estiver acessível; localmente use `PERSISTENCIA_LOTE=json` (padrão nos testes via `conftest.py`) ou:

```bash
docker compose up -d db
docker compose run --rm app pytest
```

## Relatório

- **O que foi construído:** Portal web + API FastAPI para validar lotes de recebíveis do ANTECIPE FIDC; regras parametrizadas por JSON; precificação; concentração e duplicidade; paginação server-side; persistência de lotes no PostgreSQL 16; tela com dashboard, filtros e tabela paginada.
- **Tecnologias:** Python 3.12, FastAPI, Uvicorn, Polars, psycopg 3, structlog, PostgreSQL 16, Docker Compose, HTML/JS (ES modules) + Tailwind.
- **Decisões de arquitetura:** Validação vetorizada com Polars; resultado do lote no Postgres com `COPY` e leitura paginada no SQL; `job_id` estável para a UI; cache de validadores/situação no startup; demo mock isolada dos endpoints de upload.
- **O que ficou de fora / próximos passos:** Aderência total ao gabarito 100k (situação cadastral por linha); TTL/limpeza de lotes antigos; autenticação; build Tailwind sem CDN na entrega.

## Estrutura do projeto

```
app/
  api.py            # rotas e tela
  config.py         # variáveis de ambiente
  logging_setup.py  # structlog JSON
  reader.py         # CSV
  rules.py          # validadores JSON (linha)
  pricing.py        # valor líquido
  pipeline.py       # orquestração
  db.py             # Postgres: schema e conexão
  lote_repository.py # persistência de lotes (COPY + paginação SQL)
  lote_cache.py     # fachada postgres/json + helpers de paginação
  static/index.html
config/validadores_antecipe.json
data/               # CSVs locais (ignorados no git)
scripts/gerar_csv.py
tests/test_saude.py
```
