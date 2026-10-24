# PROMPTS — Portal Antecipe (Hackathon)

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
