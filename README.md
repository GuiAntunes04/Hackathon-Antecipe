# Portal Antecipe

## Visão geral

API e tela web para validar um CSV de recebíveis (notas) contra regras definidas em `validadores_antecipe.json`. Para cada nota: aprovação ou recusa, motivo em linguagem simples, valor nominal e valor líquido (aprovadas), além do **total a receber**. A mesma validação está disponível pela interface e por `POST /validar`.

Fluxo: upload → `pipeline` (reader → regras do JSON → precificação) → persistência do lote → resposta JSON com **todas as notas** e `job_id`. A **paginação, busca e filtros** são feitos no navegador; `GET /validar/lote/{job_id}` recarrega o lote completo persistido.

**Situação cadastral:** consulta **`cnpj_situacao_mock.csv`** (`CAMINHO_SITUACAO`). CNPJ ausente no mock → recusa por situação desconhecida. Status `INAPTA`, `SUSPENSA`, `BAIXADA`, etc. recusam se não estiverem em `situacoes_aceitas` do JSON.

**NAO_VENCIDA:** vencimento não pode ser anterior à `DATA_AQUISICAO`.

**Concentração:** raiz do CNPJ (8 dígitos); ordem do CSV; isenções da 1ª aprovada global e da 1ª por raiz (com ≥2 aprovadas); bloqueio após recusa na raiz; demais casos: participação acima do `percentual_maximo` do JSON.

**Duplicidade no lote:** 2ª+ linha com mesmo `DOC_CEDENTE`, `NU_DOCUMENTO` e `VALOR_NOMINAL` (2 casas) recusada (`DUPLICIDADE_LOTE=true`).

**Resultado vs `resultado_esperado_100k.json`:** a API **não** usa o gabarito. Status vêm só de `validadores_antecipe.json`, mock cadastral, concentração heurística e duplicidade — podem divergir do JSON oficial (sobretudo concentração). O arquivo `resultado_esperado_100k.json` fica no repositório para comparação opcional (`pytest -m slow`).

Legado: `scripts/mesclar_situacao_sacados.py` gera CSV mock+estoque; não é o padrão de produção.

## Registro de prompts (IA)

Ver [docs/prompts/PROMPTS.md](docs/prompts/PROMPTS.md) (índice) → [BACK](docs/prompts/PROMPTS_BACK.md), [FRONT](docs/prompts/PROMPTS_FRONT.md), [MERGE](docs/prompts/PROMPTS_MERGE.md).

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + Compose v2)
- Opcional: Python 3.12 e Node.js (Tailwind)

## Front-end (Tailwind)

O portal usa **`/static/css/tailwind.css`** (build local). Após mudar classes Tailwind no HTML/JS:

```bash
npm install
npm run build:css
```

Chart.js carrega **só na tela de resultados**; fundo usa `hero-mountains.png` (~260 KB) em vez do PNG de marca (~3 MB).

## Como rodar do zero

```bash
docker compose up --build
```

O **Dockerfile** gera `tailwind.css` no build (estágio Node). Fora do Docker: `npm install && npm run build:css` na raiz antes de `uvicorn`.

| Recurso | URL |
|---------|-----|
| Portal | http://localhost:8000/ |
| Saúde | http://localhost:8000/saude |
| OpenAPI | http://localhost:8000/docs |

Parar: `Ctrl+C`; remover volumes: `docker compose down -v`.

## API de validação

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/validar` | Upload CSV (`multipart`, campo `arquivo`). Resposta: lote completo + `job_id`. |
| `GET` | `/validar/lote/{job_id}` | Lote completo já persistido. |
| `GET` | `/saude` | Saúde; HTTP 503 se Postgres configurado mas indisponível. |

Campos principais em `notas[]`: `nu_documento`, `nome_sacado`, `data_vencimento`, `valor_nominal`, `valor_bruto`, `status`, `motivo`, `valor_liquido`.

Persistência: PostgreSQL 16 (`COPY`) ou `PERSISTENCIA_LOTE=json` em `data/lotes/`. Sem DB no boot, a API faz fallback para JSON local.

## Variáveis de ambiente

Copie `.env.example` para `.env` (Compose usa `.env.example` por padrão):

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | PostgreSQL 16 | `postgresql://antecipe:...@db:5432/antecipe` |
| `PERSISTENCIA_LOTE` | `postgres` ou `json` | `json` (local) / `postgres` (Docker) |
| `DATA_BASE` | Data-base (`dd/mm/aaaa`) | `22/10/2026` |
| `CAMINHO_VALIDADORES` | JSON de regras | `config/validadores_antecipe.json` |
| `CAMINHO_SITUACAO` | Mock cadastral | `cnpj_situacao_mock.csv` |
| `LOG_LEVEL` | Log structlog | `INFO` |
| `CAMINHO_ESTOQUE` | (Opcional) carteira já comprada | `estoque_antecipe.csv` |
| `DUPLICIDADE_LOTE` | Duplicata no mesmo CSV | `true` |

## Testes

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pytest
pytest -m slow   # gabarito 100k (requer estoque + resultado_esperado_100k.json)
```

Com Postgres: `docker compose up -d db` e `docker compose run --rm app pytest`.

## Relatório

- **Construído:** Portal Antecipe — validação parametrizada por JSON, mock cadastral, concentração e duplicidade, precificação, dashboard e tabela com filtros no front, API FastAPI, persistência de lotes.
- **Stack:** Python 3.12, FastAPI, Polars, psycopg 3, structlog, PostgreSQL 16, Docker Compose, HTML/JS (ES modules), CSS Kanastra.
- **Arquitetura:** Pipeline vetorizado; regras plugáveis via JSON; cache de validadores/situação no startup; lotes em Postgres com fallback JSON.
- **Fora de escopo:** Autenticação, paginação server-side na API, TTL de lotes, motor de regras administrável sem restart.

## Estrutura

```
app/
  api.py              # rotas, static, lifespan
  pipeline.py         # orquestração
  rules.py / pricing.py / reader.py
  gabarito.py         # só testes de aderência
  db.py, lote_repository.py, lote_cache.py
  static/             # portal + dashboard (JS modular)
config/validadores_antecipe.json
cnpj_situacao_mock.csv
docs/prompts/         # registro de prompts IA (índice PROMPTS.md)
tests/
```
