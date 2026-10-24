# PROMPTS_FRONT — Portal Antecipe (Hackathon)

Registro de prompts usados com assistente de IA e o que cada um gerou.

## Índice de alterações aprovadas

| # | Data | Tema | Principais arquivos |
|---|------|------|---------------------|
| 1 | 2026-10-24 | Esqueleto FastAPI + Docker | `app/*`, `docker-compose.yml` |
| 2 | 2026-10-24 | Front modular (ES modules) | `app/static/js/**`, `api.py` (`StaticFiles`) |
| 3 | 2026-10-24 | Mock 10 notas (`MOCK_VALIDACAO`) | `mock_validacao.py`, `config.py`, `api.py` |
| 4 | 2026-10-24 | Bootstrap 5 (CDN) | `index.html`, componentes JS *(depois substituído)* |
| 5 | 2026-10-24 | Tailwind CSS (CDN + pipeline npm) | `package.json`, `tailwind.config.js`, `index.html` |
| 6 | 2026-10-24 | Colunas Nota/Sacado/Vencimento/Valor + popover motivo | `notes-table.js`, `mock_validacao.py`, `main.css` |
| 7 | 2026-10-24 | Coluna **Status** por último (popover na recusa) | `notes-table.js`, `PROMPTS_FRONT.md` |
| 8 | 2026-10-24 | Layout largo (tipo container-fluid / xl) + colunas da tabela expandidas | `index.html`, `notes-table.js` |
| 9 | 2026-10-24 | Badges Status outline + hover; rótulos Aprovada/Recusada | `notes-table.js`, `main.css` |
| 10 | 2026-10-24 | Clique na linha → banner verde escuro com valor a receber | `notes-table.js`, `main.css` |

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

## Entrada 2 — Front-end modular (2026-10-24)

### Contexto e decisões

- Escopo **apenas front-end**: modularizar a tela sem implementar pipeline, validadores, paginação ou Postgres.
- Stack: **HTML + CSS + ES modules nativos** (sem Node, Vite ou framework).
- Contrato da API mantido: `POST /validar` → `{ total_a_receber, notas: [...] }`; listagem de **todas** as notas retornadas (sem paginação client ou server por enquanto).
- Padrão: **`fetch` somente em `js/api/validacao.js`**; `main.js` orquestra componentes.
- Ajuste mínimo no back: servir assets em `/static` via FastAPI `StaticFiles`.

### Prompts / pedidos relacionados

1. Como visualizar o `index.html` (servir via Uvicorn em `http://127.0.0.1:8000/`, não abrir `file://`).
2. Modularizar o front-end (discussão de ES modules vs Vite; escolha ES modules).
3. Plano de entrega completo do hackathon → depois **restrito a modularizar só o front-end**, sem paginação na primeira versão modular.
4. Implementar o plano de modularização do front-end.
5. Registrar este log em `PROMPTS_FRONT.md`.

### O que foi alterado / criado

**Backend (mínimo)**

- `app/api.py`: import de `StaticFiles` e `app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")`. Rotas `/`, `/saude` e `POST /validar` inalteradas em contrato.

**Front-end**

- `app/static/index.html`: shell sem CSS/JS inline; containers `#upload-root`, `#status`, `#summary-root`, `#table-root`; `<script type="module" src="/static/js/main.js">`.
- `app/static/css/main.css`: estilos migrados do inline (`.card`, `.notes-table`, `.summary`, `.ok`, `.erro`, `.upload__submit`).
- `app/static/js/config.js`: constante `URL_VALIDAR = "/validar"`.
- `app/static/js/api/validacao.js`: `postValidar(file)` com `FormData` e tratamento de erro HTTP.
- `app/static/js/lib/format.js`: `escapeHtml`, `formatMoney` (BRL).
- `app/static/js/components/upload-panel.js`: monta formulário de upload no card.
- `app/static/js/components/summary.js`: exibe total a receber.
- `app/static/js/components/notes-table.js`: tabela Linha / Status / Motivo / Valor líquido.
- `app/static/js/main.js`: fluxo upload → API → resumo + tabela; mensagens em `#status`.

### Comportamento da UI

- Envio: status "Enviando…"; em sucesso "Validação concluída." e exibição de resumo + tabela; em erro mensagem em `#status` e painéis de resultado ocultos.
- Status **aprovada** / **recusada** com classes visuais `.ok` / `.erro`; motivos renderizados com escape HTML.

### Verificação feita

- `TestClient`: `GET /static/css/main.css`, `GET /static/js/main.js` e `GET /` retornam 200.
- `pytest tests/test_saude.py`: passou após a mudança em `api.py`.

### Fora do escopo (próximos passos)

- Paginação (`js/components/pagination.js` + eventual `GET /validacoes/{id}/notas`).
- Implementação de `reader`, `rules`, `pricing`, `pipeline` e gravação do upload em `data/`.
- Sincronizar `config/validadores_antecipe.json` com o JSON real do hackathon (continua placeholder `[]` na config usada pelo app, se não atualizado separadamente).

---

## Entrada 3 — Mock temporário de validação (2026-10-24)

### Motivação

Com o front modular pronto, o upload chamava `POST /validar`, que invocava `pipeline.validar_arquivo_csv` ainda stub (`NotImplementedError`) → **HTTP 500** na tela. Foi pedida uma **simulação temporária** com **10 notas** para validar jornada de upload, resumo e tabela sem depender do back de regras.

### Prompt

Implementar plano de simulação: resposta JSON fixa, flag de ambiente, testes; front inalterado.

### Decisões

- Mock no **backend** (não no `validacao.js`), para tela e `/docs` usarem o mesmo endpoint.
- Conteúdo do CSV **ignorado** no mock; o arquivo multipart ainda é lido (`await arquivo.read()`) para simular upload real.
- **`MOCK_VALIDACAO`**: default `false` em código; `.env.example` com `MOCK_VALIDACAO=true` (Docker Compose carrega `env_file`).
- Uvicorn local: definir variável manualmente (`$env:MOCK_VALIDACAO = "true"`) ou copiar `.env`.
- Desligar quando existir pipeline: `MOCK_VALIDACAO=false`.

### Arquivos

| Arquivo | Papel |
|---------|--------|
| `app/mock_validacao.py` | `resultado_simulado()` — 10 notas + `total_a_receber` |
| `app/config.py` | Campo `mock_validacao` via `_parse_bool(MOCK_VALIDACAO)` |
| `app/api.py` | Ramificação mock → 200; senão pipeline |
| `.env.example` | `MOCK_VALIDACAO=true` com comentário |
| `tests/test_validar_mock.py` | Unitário do payload + `POST /validar` com monkeypatch |

### Contrato JSON (igual ao front modular)

Raiz:

```json
{
  "total_a_receber": 9631.45,
  "notas": [ ... 10 itens ... ]
}
```

Cada nota: `linha`, `nu_documento`, `status` (`aprovada`|`recusada`), `motivo`, `valor_liquido` (número ou `null` se recusada). *(Campos extras para a tabela — Entrada 6: `nome_sacado`, `data_vencimento`, `valor_nominal`.)*

### Conteúdo simulado (resumo)

| Linha | Documento | Status | Motivo (recusa) |
|-------|-----------|--------|-----------------|
| 1 | 725714 | aprovada | — |
| 2 | 1-759172 | aprovada | — |
| 3 | 000351153 | recusada | Valor abaixo do mínimo (R$ 100) |
| 4 | 286288 | aprovada | — |
| 5 | CHQ-9912 | recusada | Tipo de recebível não aceito |
| 6 | 440012 | aprovada | — |
| 7 | 778899 | recusada | Nota vencida na data-base |
| 8 | 725714 | recusada | Duplicata no lote |
| 9 | 551200 | aprovada | — |
| 10 | 990001 | recusada | Concentração no sacado > 10% |

- **5 aprovadas**, **5 recusadas**.
- **`total_a_receber`:** R$ 9.631,45 (soma dos valores líquidos das aprovadas: 2100,50 + 1850 + 3200,75 + 980,20 + 1500,00).

### Log structlog no servidor

Evento `validar_mock` com `nome_arquivo` e `content_type` quando o mock responde.

### Como testar

1. Ativar mock (PowerShell): `$env:MOCK_VALIDACAO = "true"` → reiniciar Uvicorn.
2. http://127.0.0.1:8000/ → upload de qualquer `.csv` → 10 linhas na tabela + total.
3. `pytest tests/test_validar_mock.py tests/test_saude.py`

### Integração com front (Entrada 2)

Sem mudanças em `app/static/js/**`. `main.js` continua chamando `postValidar` → renderiza `summary` e `notes-table` com o JSON acima.

### Remoção / evolução

- Parceiro implementa `reader` + `rules` + `pricing` + `pipeline` → `MOCK_VALIDACAO=false`.
- Opcional: manter `mock_validacao.py` apenas para testes automatizados.

---

## Entrada 4 — Bootstrap 5 no front (2026-10-24)

### Prompt

Instalar Bootstrap no HTML e estilizar upload, resumo, tabela e status com componentes Bootstrap (CDN, sem npm).

### O que foi gerado

- `app/static/index.html`: CDN Bootstrap 5.3.3 (CSS + bundle JS), layout `container`, cards com `d-none` nos painéis de resultado.
- `app/static/js/main.js`: mensagens de status como `alert` (`secondary` / `success` / `danger`); show/hide com `d-none`.
- `app/static/js/components/upload-panel.js`: `card`, `form-control`, `btn btn-primary`.
- `app/static/js/components/summary.js`: `card-body`, `alert alert-success` com total a receber.
- `app/static/js/components/notes-table.js`: `table-responsive`, `table-striped table-hover`, badges para status.
- `app/static/css/main.css`: reduzido a override leve (`body` background).

### Como testar manualmente

1. `$env:MOCK_VALIDACAO = "true"` e Uvicorn na pasta do projeto.
2. http://127.0.0.1:8000/ — conferir CDN Bootstrap no Network (requer internet).
3. Upload CSV → alerts e tabela estilo Bootstrap; Ctrl+F5 após editar JS.

---

## Entrada 5 — Tailwind CSS (2026-10-24)

### Prompt

Instalar Tailwind e fazer alterações de exemplo no front (substituindo Bootstrap).

### O que foi gerado

- `package.json`, `tailwind.config.js`, `app/static/css/input.css` (pipeline `npm run build:css`).
- Bootstrap removido; layout exemplo: gradiente slate, tipografia indigo, cards `.panel`, botão `.btn-primary`, tabela com pills de status.
- Componentes JS atualizados com utilitários Tailwind; `main.js` com alerts coloridos (slate/emerald/red).
- Dev: CDN Tailwind + `safelist` em `index.html` (classes injetadas via JS); componentes em `main.css`.
- README: seção de build do CSS.

---

## Entrada 6 — Tabela UX: colunas + popover de recusa (2026-10-24)

### Prompt

Motivo de recusa em **popover**; colunas da tabela: **Nota**, **Sacado**, **Vencimento**, **Valor**, **Status** (aprovada/recusada na última coluna).

### Decisões

- **Popover:** [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) nativa (`popovertarget`, `popover="auto"`) — sem biblioteca extra; estilos em `.motivo-popover` no CSS.
- **Coluna Status (última):** badge “Aprovada”; recusada com botão *“recusada — ver motivo”* que abre popover com o `motivo`.
- **Coluna Nota:** apenas `nu_documento` (sem status embutido).
- **Valor:** coluna mostra **valor líquido** se aprovada, **valor nominal** se recusada.
- **Mock** ampliado para alimentar sacado/vencimento/nominal até o pipeline real existir.

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `app/static/js/components/notes-table.js` | Novos cabeçalhos; células sacado/vencimento/valor; popover por linha recusada |
| `app/mock_validacao.py` | Campos `nome_sacado`, `data_vencimento`, `valor_nominal` em cada nota |
| `app/static/css/main.css` | Estilos `.motivo-popover` e `::backdrop` |
| `app/static/index.html` | Classes adicionais na `safelist` do Tailwind CDN |

### Contrato JSON (campos usados pela tabela)

Por nota (além de `status`, `motivo`, `valor_liquido`):

- `nu_documento` — coluna Nota  
- `nome_sacado` — coluna Sacado  
- `data_vencimento` — string `dd/mm/aaaa`  
- `valor_nominal` — face value (coluna Valor quando recusada)

### Comportamento na tela

- Texto de ajuda: *“Notas recusadas: clique em ver motivo…”*
- Sacado com `truncate` + `title` para nome completo no hover (mobile).
- Popover fecha ao clicar fora (comportamento padrão `popover=auto`).

### Verificação

- `pytest tests/test_validar_mock.py` — continua passando (total e 10 notas).
- Manual: mock ativo → upload → clicar *ver motivo* em linhas recusadas.

### Para o back-end (parceiro)

Ao implementar o pipeline, manter/enviar os mesmos campos no array `notas` para a UI não regredir.

---

## Entrada 7 — Status na última coluna (2026-10-24)

### Prompt

A última coluna deve ser **Status** (aprovada / recusada), separada das demais.

### O que mudou

- `notes-table.js`: ordem **Nota → Sacado → Vencimento → Valor → Status**; popover de motivo ligado ao botão na coluna Status (recusadas).
- Texto de ajuda atualizado abaixo do título da tabela.
- Entrada 6 do índice/PROMPTS_FRONT ajustada para refletir a coluna Status.

---

## Entrada 8 — Layout e colunas expandidas (2026-10-24)

### Prompt

Expandir as colunas da raiz do Bootstrap (layout mais largo e tabela usando a largura).

### O que mudou

- **`index.html`:** raiz de `max-w-3xl` (~768px) para `w-full max-w-screen-2xl` com padding `lg:px-8 xl:px-10` (equivalente Tailwind a **container-fluid** com teto amplo).
- **`notes-table.js`:** `table-fixed` com larguras **10% / 34% / 14% / 14% / 28%**; Sacado com `break-words` (sem truncate estreito); `min-w-[640px]` só para scroll em telas muito pequenas.
- Nota: o projeto usa **Tailwind CDN**, não Bootstrap; o pedido foi interpretado como largura do container raiz.

---

## Entrada 9 — Badges de status outline (2026-10-24)

### Prompt

Coluna Status com rótulos **Aprovada** / **Recusada**; badge em modelo **outline** que preenche a cor ao passar o mouse (e `:active` no toque).

### O que mudou

- `app/static/css/main.css`: classes `.badge-status`, `.badge-status--aprovada`, `.badge-status--recusada` (borda colorida, fundo transparente → fill no `:hover`/`:active`).
- `app/static/js/components/notes-table.js`: função `rotuloStatus()`; badges e botão do popover usam as novas classes; cabeçalho **STATUS** com `uppercase tracking-wide`.

---

## Entrada 10 — Simulação ao clicar na nota (2026-10-24)

### Prompt

Ao clicar em uma nota, mensagem com preenchimento verde escuro simulando quanto o usuário irá receber.

### O que mudou

- Clique na **linha** da tabela (exceto botão “ver motivo”) exibe banner `.nota-recebivel-banner` (fundo verde escuro).
- **Aprovada:** valor líquido formatado; **Recusada:** R$ 0,00 e texto explicativo.
- Linha selecionada com destaque; suporte a Enter/Espaço com foco na linha.
