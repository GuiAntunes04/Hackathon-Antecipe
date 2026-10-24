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
