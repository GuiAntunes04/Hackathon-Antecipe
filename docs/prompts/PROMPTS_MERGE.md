# PROMPTS_MERGE — Portal Antecipe (Hackathon)

Registro de merges entre `main` (back) e `feat/front`, com o que cada conflito manteve.

## Índice

| # | Data | Tema | Principais arquivos |
|---|------|------|---------------------|
| 1 | 2026-10-24 | `origin/feat/front` → `main` (paginação + validação) | `.env.example`, `app/api.py`, `app/pipeline.py`, `tests/test_api_validar.py` |

---

## Entrada 1 — Merge `feat/front` em `main` (2026-10-24)

### Prompt

Resolve these 3 merge conflicts across 4 files.

Depois: implemente.

Contexto: `main` estava à frente de `origin/main` com validação (duplicidade no lote, concentração, pipeline vetorizado). O merge em andamento era `git merge origin/feat/front` (dashboard, lote paginado, rolagem normal). Quatro arquivos unmerged.

### Lados

- **HEAD (`main`):** `feat(validacao): duplicidade no lote, concentração e performance do pipeline` (`fb786c9`).
- **Incoming (`origin/feat/front`):** `feat(front): dashboard, lote paginado e rolagem normal` (`32e498d`).

### Resolução (manter os dois)

Não escolher um lado inteiro: paginação do front + regras/performance do `main`.

| Arquivo | Conflitos | O que ficou |
|---------|-----------|-------------|
| `.env.example` | 1 | Comentário do front em `MOCK_VALIDACAO` (demo só na home; `POST /validar` sempre pipeline) + `DUPLICIDADE_LOTE=true` do `main`. |
| `app/api.py` | 4 | Imports e `lifespan` dos dois: `lote_cache.garantir_diretorio()` + `aquecer_cache_validacao`. `POST /validar` do front (salva lote, devolve página, `job_id`/`paginacao`). `GET /validar/lote/{job_id}` do front. Sem o retorno do lote inteiro do `main`. |
| `app/pipeline.py` | 1 | `_montar_notas()` + `aprovadas` via Polars do `main`. Loop `iter_rows` do front descartado. Helper `_formatar_data_vencimento` removido (só o loop usava). |
| `tests/test_api_validar.py` | 1 | Asserts dos dois: campos `nome_sacado` / `data_vencimento` / `valor_nominal` + `job_id`, `len(notas)==6`, `paginacao.pagina==1`. |

### O que foi gerado

- Quatro arquivos sem marcadores `<<<<<<<` / `=======` / `>>>>>>>`.
- `app/api.py` unificado: cache de validadores no boot e API paginada.
- Testes do merge: `test_api_validar.py`, `test_lote_paginacao.py`, `test_validar_mock.py`, `test_duplicidade_lote.py` — 14 passed.
- Merge deixado resolvido no index (`All conflicts fixed but you are still merging`); commit em `main` a cargo do usuário.

### Por que essa combinação

O front já consumia `job_id`, `paginacao` e `GET /validar/lote/{job_id}` (`validacao.js`, `main.js`, `test_lote_paginacao.py`). Devolver o JSON completo do `main` quebraria a tela. O loop Python do front desfazia a otimização de `_montar_notas()`. `DUPLICIDADE_LOTE` e o aquecimento de cache não existiam no front.
