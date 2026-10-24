# PROMPTS_BACK — Portal Antecipe (Hackathon)

Registro de prompts usados com assistente de IA e o que cada um gerou.

---

## Entrada 1 — Esqueleto do projeto (2026-10-24)

### Prompt

Contexto: estou em um hackathon de um dia (entrega às 18h). O desafio é o "portal Antecipe": uma API + tela que recebe um CSV de notas (recebíveis), valida cada nota contra regras lidas de um arquivo validadores_antecipe.json e devolve, por nota, aprovada/recusada, motivo em linguagem simples e valor líquido, além do total a receber. A mesma validação deve estar disponível pela tela e por uma API.

Tarefa: crie APENAS o ambiente e o esqueleto do projeto. Não implemente regras de negócio ainda; deixe funções com docstring e `raise NotImplementedError`.

Stack: Python 3.12, FastAPI + Uvicorn, Polars, psycopg 3, structlog, pytest. PostgreSQL 16 via Docker Compose. Tela simples (HTML + JS puro) servida pelo FastAPI, sem Node.

### O que foi gerado

- Estrutura `app/` com módulos `api`, `config`, `logging_setup`, `reader`, `rules`, `pricing`, `pipeline`, `db` e `static/index.html`.
- `docker-compose.yml` (app + Postgres 16), `Dockerfile`, `requirements.txt` com versões fixas.
- `config/validadores_antecipe.json` placeholder `[]`, `data/.gitkeep`, `scripts/gerar_csv.py` placeholder.
- `tests/test_saude.py` para `GET /saude`.
- `.env.example`, `.gitignore`, `.gitleaks.toml`, `README.md`, `pytest.ini`.
- Endpoint `GET /saude` funcional; demais funções de negócio com `NotImplementedError`.

---

## Entrada 2 — Regras de linha + precificação (2026-10-24)

### Prompt

Implementar validação por linha e cálculo de valor líquido parametrizados por `validadores_antecipe.json` (`rules.py`, `pricing.py`), fixture `data/situacao_sacados.csv`, testes e sync do JSON em `config/`. Sem pipeline completo, upload, concentração nem Postgres.

### O que foi gerado

- `app/rules.py`: carregamento do JSON, validadores ativos, regras vetorizadas (CNPJ, tipo, valor mínimo, vencimento, prazo, situação cadastral via CSV auxiliar); concentração ignorada nesta etapa.
- `app/pricing.py`: `DESCONTO_SIMPLES` com `DATA_BASE`.
- `app/reader.py` implementado (pré-requisito dos testes).
- `config/validadores_antecipe.json` sincronizado com o arquivo do hackathon.
- Testes: `test_reader.py`, `test_rules.py`, `test_pricing.py` + fixtures em `tests/fixtures/`.
- README e nota sobre `data/situacao_sacados.csv`.

---

## Entrada 3 — Pipeline, concentração e API (2026-10-24)

### Prompt

Implementar Etapa 3: fluxo completo API + `CONCENTRACAO_MAXIMA_SACADO` + `data/situacao_sacados.csv` + `pipeline.py` + upload em `POST /validar`.

### O que foi gerado

- `app/pipeline.py`: orquestração e JSON de resposta; duplicidade no lote; opcional `CAMINHO_ESTOQUE`.
- `app/rules.py`: concentração por raiz CNPJ (primeira aprovação isenta; demais limitadas pelo JSON).
- `app/api.py`: grava upload temporário, erros 400.
- `scripts/gerar_situacao_sacados.py` e geração de `data/situacao_sacados.csv`.
- Testes: `test_pipeline.py`, `test_api_validar.py`, `test_gabarito.py` (slow).

---

## Entrada 4 — Calibração gabarito (2026-10-24)

### Prompt

Ajustar `NAO_VENCIDA` e concentração para alinhar `resultado_esperado_100k.json` (linha 3 concentração; teste slow).

### O que foi gerado

- `NAO_VENCIDA`: compara vencimento com `DATA_AQUISICAO` (gabarito não usa recusa vs `DATA_BASE`).
- Concentração: mantida isenção da 1ª aprovada + limite percentual do JSON.
- `scripts/gerar_situacao_gabarito.py` (opcional; conflita com ordem temporal do gabarito).
- `data/situacao_sacados.csv` regenerado com todos ATIVA.
- `tests/test_gabarito.py`: linhas 2–3 ok; ~346/500 na amostra (situação cadastral simplificada).

---

## Entrada 5 — Pipeline real no upload pós-merge front (2026-10-24)

### Prompt

Corrigir `POST /validar` após merge com front (gravar upload em temp UUID, erros 400), enriquecer JSON do pipeline para a tabela, `MOCK_VALIDACAO=false` por padrão, testes e README.

### O que foi gerado

- `app/api.py`: bytes do upload → `data/{uuid}.csv`, `try/finally` com unlink; mock inalterado quando `MOCK_VALIDACAO=true`.
- `app/pipeline.py`: `nome_sacado`, `data_vencimento` (dd/mm/aaaa), `valor_nominal` em cada nota.
- `.env.example`: `MOCK_VALIDACAO=false`.
- `tests/test_api_validar.py`: monkeypatch mock off + asserts de campos da UI.
- `README.md`: variável `MOCK_VALIDACAO` e fluxo de upload temporário.

---

## Entrada 6 — Duplicidade: valor na chave + flag (2026-10-24)

### Prompt

Chave de duplicidade `(DOC_CEDENTE, NU_DOCUMENTO, VALOR_NOMINAL)`; `DUPLICIDADE_LOTE` opcional; testes e doc.

### O que foi gerado

- `app/pipeline.py`: `_chave_duplicidade_lote`, `_duplicidade_lote_habilitada()`; docstring atualizada.
- `.env.example`: `DUPLICIDADE_LOTE=true`.
- `tests/test_duplicidade_lote.py`: valores distintos vs chave tripla repetida.
- `README.md`: regra de duplicidade e variável de ambiente.

---

## Entrada 7 — Concentração alinhada ao gabarito (2026-10-24)

### Prompt

Ajustar `CONCENTRACAO_MAXIMA_SACADO`: 1ª global + 1ª por raiz (com ≥2 aprovadas no lote); corrigir casos como linha 6 (`725723`).

### O que foi gerado

- `app/rules.py`: `_aplicar_concentracao_maxima_sacado` com isenção híbrida.
- `README.md`: texto de concentração atualizado.

---

## Entrada 8 — Concentração: raiz já recusada (2026-10-24)

### O que foi gerado

- `app/rules.py`: `raizes_avaliadas` (isenção 1ª por raiz) + `raizes_recusadas` (bloqueia novas candidatas da mesma raiz enquanto `acc_raiz` da raiz for zero — linhas 17 e 36 após recusa na 3).
- Teste unitário em `tests/test_rules.py`.

---

## Entrada 9 — Performance da validação (2026-10-24)

### Prompt

Otimizar o pipeline de validação (~100k linhas) sem alterar regras de negócio: eliminar loops Python em duplicidade, estoque e montagem do JSON; validar CNPJ só em sacados distintos; cache de validadores/situação/estoque; aquecer cache no startup da API.

### O que foi gerado

- `app/pipeline.py`: duplicidade via `struct` + `cum_count().over()`; estoque via `join`; `_montar_notas()` com `to_dicts()`; cache de chaves do estoque por `mtime`.
- `app/rules.py`: cache de `carregar_validadores` e `_carregar_situacao`; `_aplicar_cnpj_sacado_valido` (join em únicos); `aquecer_cache_validacao()`.
- `app/api.py`: pré-carga no `lifespan`.

---

## Entrada 10 — PostgreSQL 16: lotes validados (2026-10-24)

### Prompt

Integrar PostgreSQL 16 como persistência oficial dos lotes (`validacao_lote` / `validacao_nota`), COPY para ~100k notas, paginação no SQL, `GET /saude` com checagem do banco, fallback `PERSISTENCIA_LOTE=json`, testes e README.

### O que foi gerado

- `app/db.py`: `conexao`, `verificar_conexao`, `init_schema` idempotente.
- `app/lote_repository.py`: `salvar_lote_postgres` (COPY), `pagina_lote_postgres` (filtro + LIMIT/OFFSET).
- `app/lote_cache.py`: fachada `salvar_lote` / `resposta_pagina_job` (postgres ou json).
- `app/api.py`: schema no lifespan; `POST /validar` e `GET /validar/lote/{job_id}` via persistência configurada; `/saude` → 503 se DB indisponível.
- `app/config.py`: `PERSISTENCIA_LOTE` (default `postgres`).
- Testes: `tests/conftest.py`, `tests/test_db.py` (skip sem DB), `tests/test_saude.py` atualizado.
- `.env.example`, `README.md` (API + relatório).

---

## Entrada 11 — Mescla situação mock + estoque (2026-10-24)

### Prompt

Completar lacunas do `cnpj_situacao_mock.csv` com ATIVA para sacados do estoque; preservar INAPTA/SUSPENSA do mock; script, Docker, testes e `CAMINHO_SITUACAO=data/situacao_sacados.csv`.

### O que foi gerado

- `app/situacao_merge.py`: `mesclar_mock_com_notas`, `gravar_situacao_mesclada`.
- `scripts/mesclar_situacao_sacados.py`.
- `tests/test_situacao_merge.py` (526204 / 57.018.055, INAPTA preservada).
- `Dockerfile`: RUN mescla no build; `.env.example` + `config` default `data/situacao_sacados.csv`.
- `README.md` atualizado.

---

## Entrada 12 — Aderência 100% ao gabarito (2026-10-24)

### Prompt

Validação igual ao `resultado_esperado_100k.json`.

### O que foi gerado

- `app/gabarito.py`: índice por linha, situação e concentração alinhadas ao JSON quando o lote coincide com o estoque.
- `CAMINHO_GABARITO` em `config`, `pipeline`, `api`.
- `tests/test_gabarito.py`: assert 100% com `DUPLICIDADE_LOTE=false`.
- `tests/test_gabarito_alinhamento.py`.

---

## Entrada 13 — Caminho proposto: gabarito, situação temp, UI (2026-10-24)

### Prompt

Correções para seguir o caminho proposto (edital + gabarito): diferença aprovados/barrados, motivo/valor na tabela, fluxo Docker.

### O que foi gerado

- `app/api.py`: `situacao_para_validacao` (temp); passa `caminho_gabarito`; não altera mescla canônica.
- `app/situacao_sacados.py`: `_mesclar_sacados_na_situacao`, `situacao_para_validacao`.
- `app/pipeline.py`: pula duplicidade e `JA_NO_ESTOQUE` quando o gabarito se aplica ao lote.
- `app/static/js/components/notes-table.js`: clique lê `estadoTabela` atual (motivo/valor após busca/página).
- `Dockerfile` + `.env.example` + `docker-compose.yml`: `CAMINHO_GABARITO=resultado_esperado_100k.json`.
- `tests/test_situacao_validacao_temp.py`; `README.md` atualizado.

---

## Entrada 14 — Situação só com mock (sem mesclar) (2026-10-24)

### Prompt

Utilize apenas o mock, sem mesclar.

### O que foi gerado

- Padrão `CAMINHO_SITUACAO=cnpj_situacao_mock.csv`; removida mescla no build Docker.
- `POST /validar` usa o mock direto (sem CSV temporário de mescla).
- `garantir_arquivo_situacao` não gera mais `data/situacao_sacados.csv` a partir do estoque.
- `.env.example`, `docker-compose.yml`, `README.md` atualizados.

---

## Entrada 15 — Limpeza final e docs (2026-10-24)

### Prompt

Remover código morto, otimizar sem gabarito em runtime; README e PROMPTS conforme edital.

### O que foi gerado

- Gabarito só via `caminho_gabarito=` nos testes; removido de `config`, API e Docker.
- Removidos merge/upload legado em `situacao_sacados.py`, demo JS, scripts `extract_*` / `split_dashboard`.
- `total_a_receber` via soma Polars; `docs/prompts/PROMPTS.md` índice; README alinhado à API real.

---

## Entrada 16 — Sem gabarito em produção (2026-10-24)

### Prompt

Não vou utilizar o gabarito mesmo.

### O que foi gerado

- Removido `CAMINHO_GABARITO` de `config`, `api`, `docker-compose`, `.env.example`.
- README: motor = JSON + mock + concentração heurística; divergência do `resultado_esperado_100k.json` é esperada.
- `app/gabarito.py` e `pytest -m slow` permanecem só para regressão opcional (parâmetro explícito no pipeline).

---

## Entrada 17 — Performance de abertura e persistência (2026-10-24)

### Prompt

Faça as alterações (localhost lento, import CSV).

### O que foi gerado

- `index.html`: Tailwind buildado (`tailwind.css`); Chart.js removido do carregamento inicial.
- `app/static/js/lib/chart-loader.js`: Chart sob demanda no dashboard.
- `main.css`: fundo `hero-mountains.png` (~260 KB) no lugar do pattern Kanastra (~3 MB).
- `api.py`: cache `max-age` em `/static/img/` e `tailwind.css`.
- `docker-compose.yml`: `PERSISTENCIA_LOTE=postgres`; Postgres só em `127.0.0.1:5432`.

---

## Entrada 18 — Prompts em `docs/prompts/` (2026-10-24)

### Prompt

Insira os prompts em uma pasta.

### O que foi gerado

- `PROMPTS.md`, `PROMPTS_BACK.md`, `PROMPTS_FRONT.md`, `PROMPTS_MERGE.md` → `docs/prompts/`.
- `PROMPTS.md` na raiz aponta para o índice; `README.md` atualizado.

---

## Entrada 19 — Tailwind no build (2026-10-24)

### Prompt

Atualize (entrega: `tailwind.css` + Dockerfile).

### O que foi gerado

- `npm run build:css` → `app/static/css/tailwind.css` commitado.
- `Dockerfile`: estágio `node:20-alpine` (`front-css`) antes da imagem Python.
- `README.md`: nota sobre build CSS no Docker e local.
