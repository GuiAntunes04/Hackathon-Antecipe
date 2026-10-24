# Portal Antecipe

## Visão geral

API e tela web para validar um CSV de recebíveis (notas) contra regras definidas em `validadores_antecipe.json`. Para cada nota, o sistema deve informar aprovação ou recusa, motivo em linguagem simples e valor líquido, além do total a receber. A mesma validação fica disponível pela interface e pelo endpoint `POST /validar`.

Leitura de CSV, validação por linha (regras do JSON) e precificação `DESCONTO_SIMPLES` estão implementadas em `reader`, `rules` e `pricing`. Pipeline completo, upload na API, concentração de carteira e Postgres seguem pendentes.

**Situação cadastral:** o CSV de notas não traz situação do sacado; o validador `SITUACAO_CADASTRAL_SACADO` usa o arquivo `data/situacao_sacados.csv` (colunas `DOC_SACADO`, `SITUACAO`). CNPJ sem registro no arquivo é recusado.

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + Compose v2)
- Opcional, para testes locais sem container da app: Python 3.12

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
  pipeline.py       # orquestração (stub)
  db.py             # Postgres (stub)
  static/index.html
config/validadores_antecipe.json
data/               # CSVs locais (ignorados no git)
scripts/gerar_csv.py
tests/test_saude.py
```
