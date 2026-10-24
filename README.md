# Portal Antecipe

## Visão geral

API e tela web para validar um CSV de recebíveis (notas) contra regras definidas em `validadores_antecipe.json`. Para cada nota, o sistema deve informar aprovação ou recusa, motivo em linguagem simples e valor líquido, além do total a receber. A mesma validação fica disponível pela interface e pelo endpoint `POST /validar`.

Fluxo completo: `POST /validar` grava o upload em arquivo temporário em `data/`, executa `pipeline` (reader → regras → precificação) e devolve JSON para a tela (inclui `nome_sacado`, `data_vencimento`, `valor_nominal` por nota). Postgres (`db.py`) ainda não integrado — ver abaixo.

**Situação cadastral:** o CSV de notas não traz situação do sacado; use `data/situacao_sacados.csv` (`DOC_SACADO`, `SITUACAO`). Gere a partir do estoque:

```bash
python scripts/gerar_situacao_sacados.py --csv estoque_antecipe.csv
```

**NAO_VENCIDA:** vencimento não pode ser anterior à `DATA_AQUISICAO` (alinhado ao gabarito; não compara vencimento com `DATA_BASE`).

**Concentração:** raiz do CNPJ = 8 primeiros dígitos; ordem do CSV; isenta a **primeira** nota aprovada no lote e a **primeira aprovada de cada raiz** (quando já houver ≥2 aprovadas e a raiz ainda não tiver sido avaliada nesta etapa); se a raiz já foi **recusada** por concentração e ainda não entrou no acumulado aprovado da raiz, novas candidatas da mesma raiz são recusadas; demais casos: `(acumulado da raiz + candidata) / (total aprovado + candidata) > percentual_maximo` do JSON.

**Situação cadastral:** `python scripts/gerar_situacao_sacados.py` (todos `ATIVA` por padrão). Script opcional `gerar_situacao_gabarito.py` marca sacados com alguma linha barrada por situação — use só se não precisar reproduzir ordem temporal do gabarito (mesmo sacado pode ser `ATIVA` na linha 3 e `INAPTA` na 7909).

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

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste se necessário (o Compose usa `.env.example` por padrão na subida):

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL PostgreSQL (psycopg) | `postgresql://antecipe:...@db:5432/antecipe` |
| `DATA_BASE` | Data-base dos cálculos (`dd/mm/aaaa`) — **nunca** usar data do sistema | `22/10/2026` |
| `CAMINHO_VALIDADORES` | Caminho do JSON de regras | `config/validadores_antecipe.json` |
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
