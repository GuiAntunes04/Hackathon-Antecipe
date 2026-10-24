# Portal Antecipe

## Visão geral

API e tela web para validar um CSV de recebíveis (notas) contra regras definidas em `validadores_antecipe.json`. Para cada nota, o sistema deve informar aprovação ou recusa, motivo em linguagem simples e valor líquido, além do total a receber. A mesma validação fica disponível pela interface e pelo endpoint `POST /validar`.

Fluxo completo: `POST /validar` → `pipeline` (reader → regras → precificação) → JSON para a tela. Concentração por sacado (`CONCENTRACAO_MAXIMA_SACADO`) e Postgres (`db.py`) seguem parcial/fora — ver abaixo.

**Situação cadastral:** o CSV de notas não traz situação do sacado; use `data/situacao_sacados.csv` (`DOC_SACADO`, `SITUACAO`). Gere a partir do estoque:

```bash
python scripts/gerar_situacao_sacados.py --csv estoque_antecipe.csv
```

**NAO_VENCIDA:** vencimento não pode ser anterior à `DATA_AQUISICAO` (alinhado ao gabarito; não compara vencimento com `DATA_BASE`).

**Concentração:** raiz do CNPJ = 8 primeiros dígitos; ordem do CSV; a primeira nota aprovada no lote isenta o limite; depois, recusa se `(acumulado da raiz + candidata) / (total aprovado + candidata) > percentual_maximo` do JSON.

**Situação cadastral:** `python scripts/gerar_situacao_sacados.py` (todos `ATIVA` por padrão). Script opcional `gerar_situacao_gabarito.py` marca sacados com alguma linha barrada por situação — use só se não precisar reproduzir ordem temporal do gabarito (mesmo sacado pode ser `ATIVA` na linha 3 e `INAPTA` na 7909).

**Upload novo vs carteira:** opcional `CAMINHO_ESTOQUE=estoque_antecipe.csv` recusa notas já presentes no estoque (não use ao revalidar o próprio estoque).

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

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste se necessário (o Compose usa `.env.example` por padrão na subida):

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL PostgreSQL (psycopg) | `postgresql://antecipe:...@db:5432/antecipe` |
| `DATA_BASE` | Data-base dos cálculos (`dd/mm/aaaa`) — **nunca** usar data do sistema | `22/10/2026` |
| `CAMINHO_VALIDADORES` | Caminho do JSON de regras | `config/validadores_antecipe.json` |
| `LOG_LEVEL` | Nível de log (`DEBUG`, `INFO`, …) | `INFO` |
| `CAMINHO_ESTOQUE` | (Opcional) CSV da carteira já comprada | `estoque_antecipe.csv` |

O arquivo `config/validadores_antecipe.json` contém as regras do ANTECIPE FIDC (sincronizado com o JSON do hackathon).

## Como rodar os testes

Com ambiente virtual e dependências instaladas:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pytest
```

Ou em um único comando no container (após build):

```bash
docker compose run --rm --no-deps app pytest
```

(Requer incluir `tests/` na imagem se usar esse caminho; localmente `pytest` na raiz é o fluxo recomendado.)

## Relatório

<!-- TODO: preencher antes da entrega (18h) -->

- **O que foi construído:** _TODO_
- **Tecnologias:** Python 3.12, FastAPI, Uvicorn, Polars, psycopg 3, structlog, PostgreSQL 16, Docker Compose, HTML/JS na tela.
- **Decisões de arquitetura:** _TODO_
- **O que ficou de fora / próximos passos:** _TODO_

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
  db.py             # Postgres (stub)
  static/index.html
config/validadores_antecipe.json
data/               # CSVs locais (ignorados no git)
scripts/gerar_csv.py
tests/test_saude.py
```
