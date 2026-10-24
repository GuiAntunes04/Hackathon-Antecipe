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
| 11 | 2026-10-24 | Banner simulação/recusa (NF, valor lima; recusada = motivo) | `notes-table.js`, `main.css` |
| 12 | 2026-10-24 | Layout 8 colunas + mobile full bleed + tabela `colgroup` | `index.html`, `main.css`, `notes-table.js` |
| 13 | 2026-10-24 | Demo automática (`MOCK_VALIDACAO`) + `.env` no boot | `api.py`, `config.py`, `main.js` |
| 14 | 2026-10-24 | Status sem popover; badges preenchidos; coluna **Status** | `notes-table.js`, `main.css` |
| 15 | 2026-10-24 | Cinematic scroll (Lenis + reveals + barra de progresso) | `cinematic-scroll.js`, `index.html`, `main.css`, `main.js` |
| 16 | 2026-10-24 | Validação real no upload (pipeline + CSV salvo) | `api.py`, `pipeline.py`, `.env.example`, `validacao.js` |
| 17 | 2026-10-24 | Header fixo verde — só **Portal Antecipe** | `index.html`, `main.css` |
| 18 | 2026-10-24 | Log renomeado para `PROMPTS_FRONT.md` | `PROMPTS_FRONT.md` |
| 19 | 2026-10-24 | Paginação server-side (lote JSON + GET página) | `lote_cache.py`, `api.py`, `validacao.js`, `main.js` |
| 20 | 2026-10-24 | Viewport fixa: scroll só na tabela | `main.css`, `main.js`, `cinematic-scroll.js`, `notes-table.js` |
| 21 | 2026-10-24 | Botões de página (… + última) e dropdown 10/20/50 | `notes-table.js`, `config.js`, `main.css`, `main.js` |
| 22 | 2026-10-24 | Paginação: sem texto “Página X de Y”; **Mostrar** no fim | `notes-table.js`, `main.css` |
| 23 | 2026-10-24 | Cabeçalho das colunas fixo acima da área rolável | `notes-table.js`, `main.css` |
| 24 | 2026-10-24 | Alinhamento thead/tbody (scrollbar + colunas) | `notes-table.js`, `main.css` |
| 25 | 2026-10-24 | Filtro Todas / Aceitas / Recusadas | `lote_cache.py`, `api.py`, `notes-table.js`, `main.js` |
| 26 | 2026-10-24 | Fundo montanhas fixo no topo | `hero-mountains.png`, `index.html`, `main.css` |
| 27 | 2026-10-24 | URL Notion do hero + header transparente | `index.html`, `api.py`, `main.css` |
| 28 | 2026-10-24 | Hero via `img.notionusercontent.com` + fallback local | `index.html` |
| 29 | 2026-10-24 | Logo: proporção 48×56 e cor do título | `index.html`, `logo.svg`, `main.css` |
| 30 | 2026-10-24 | Header maior; sem text-shadow branco | `main.css` |
| 31 | 2026-10-24 | Pastas de assets / marca Kanastra | `docs/brand/`, `app/static/img/brand/`, `README.md` |
| 32 | 2026-10-24 | Logo Kanastra reduzida (símbolo) no header | `logo-reduzida.svg`, `index.html`, `main.css` |
| 33 | 2026-10-24 | Dashboard resumido acima da tabela | `dashboard-resumo.js`, `index.html`, `main.js`, `main.css` |
| 34 | 2026-10-24 | Dashboard com gráficos (Chart.js) | `dashboard-resumo.js`, `index.html`, `main.css` |
| 35 | 2026-10-24 | Resultados: sem barra fixa; scroll da página + tabela interna | `main.js`, `main.css`, `index.html` |
| 36 | 2026-10-24 | Header grande (centro) ↔ compacto à esquerda (fade) | `cinematic-scroll.js`, `main.css` |
| 37 | 2026-10-24 | Rolagem por etapas (scroll-snap) + conteúdo e header centrados | `index.html`, `main.css`, `cinematic-scroll.js`, `main.js` |
| 38 | 2026-10-24 | Upload sem scroll; 3 etapas pós-validação (título → dashboard → tabela) | `index.html`, `main.js`, `cinematic-scroll.js`, `main.css` |
| 39 | 2026-10-24 | Revert etapas/snap — rolagem normal (dashboard + tabela) | `index.html`, `main.js`, `cinematic-scroll.js`, `main.css` |
| 40 | 2026-10-24 | Pipeline real + `situacao_sacados` (fim do mock na API) | `api.py`, `situacao_sacados.py`, `scripts/gerar_situacao_sacados.py`, testes |
| 41 | 2026-10-24 | Validação/lote completo; paginação só no cliente | `api.py`, `lote_cache.py`, `validacao.js`, `main.js`, testes |
| 42 | 2026-10-24 | i18n pt/en + globo no canto | `i18n.js`, `lang-switcher.js`, componentes, `index.html`, `main.css` |
| 43 | 2026-10-24 | Ajustes mobile (header, paginação, dashboard) | `main.css`, `index.html`, `notes-table.js` |
| 44 | 2026-10-24 | Header lateral: mais margem superior | `main.css` (`--portal-header-aside-top`) |
| 45 | 2026-10-24 | Paginação: janela de 6 números de página | `config.js`, `notes-table.js` |
| 46 | 2026-10-24 | Containers sem borda + carrossel dashboard mensal | `main.css`, `dashboard-resumo.js`, `main.js`, `i18n.js` |
| 47 | 2026-10-24 | Hero montanhas rola com a página (não fixo) | `index.html`, `main.css` |
| 48 | 2026-10-24 | Pesquisa por nota + período de vencimento | `notes-table.js`, `main.js`, `format.js`, `i18n.js`, `main.css` |
| 49 | 2026-10-24 | Aba **Enviar lote** no início + alternância com resultados | `index.html`, `main.js`, `main.css`, `i18n.js` |
| 50 | 2026-10-24 | Refatoração: tela inicial (título + upload) → resultados | `index.html`, `main.js`, `upload-panel.js`, `main.css`, `i18n.js` |
| 51 | 2026-10-24 | Home Kanastra + toast + fundo pattern; resultados coluna branca | `index.html`, `main.css`, `main.js`, `upload-panel.js`, `toast.js`, assets brand |
| 52 | 2026-10-24 | Dashboard carrossel: 3 painéis (resumo, mensal, erros) | `dashboard-resumo.js`, `main.css`, `i18n.js` |
| 53 | 2026-10-24 | Carrossel: setas em grid (sem sobrepor); margem superior; nav transparente | `main.css` |
| 54 | 2026-10-24 | Filtro status → dropdown; fade entre telas | `notes-table.js`, `main.css`, `main.js` |
| 55 | 2026-10-24 | Merge `feat/back` em `main` (Postgres + situação mock/estoque) | `api.py`, `lote_cache.py`, `lote_repository.py`, `db.py`, testes |
| 56 | 2026-10-24 | API: lote completo no front + persistência postgres/json unificada | `api.py`, `lote_cache.py` |
| 57 | 2026-10-24 | Fix upload 500: fallback JSON se Postgres indisponível | `api.py`, `.env.example` |
| 58 | 2026-10-24 | Tabela: valor bruto; banner simulação/recusa; scroll interno ≈10 linhas | `notes-table.js`, `i18n.js`, `main.css`, `config.js` |
| 59 | 2026-10-24 | Dashboard: melhor uso da largura (layout + painel mensal lado a lado) | `dashboard-resumo.js`, `main.css` |
| 60 | 2026-10-24 | Dashboard: abas numeradas (sem setas) + linha separadora da tabela | `dashboard-resumo.js`, `main.css`, `i18n.js` |
| 61 | 2026-10-24 | Aba financeira: KPIs + gráfico mensal (sem lista por mês) | `dashboard-resumo.js`, `main.css`, `i18n.js` |
| 62 | 2026-10-24 | Resultados: 3 abas (financeiro / recusados / notas) + carrossel | `dashboard-resumo.js`, `main.css`, `index.html`, `main.js` |
| 63 | 2026-10-24 | Filtro global por sacado (combobox, badges, recentes) | `dashboard-resumo.js`, `main.js`, `main.css`, `i18n.js` |
| 64 | 2026-10-24 | Tabela modular (`notes-table-controller` + `notas-filtro`) | `notes-table-controller.js`, `lib/notas-filtro.js`, `main.js` |
| 65 | 2026-10-24 | Aba Notas: scroll interno, sem fade cinematic na tabela | `main.css`, `index.html`, `cinematic-scroll.js`, `main.js` |
| 66 | 2026-10-24 | Fix alinhamento de colunas após filtro vazio → linhas | `notes-table.js`, `main.css` |
| 67 | 2026-10-24 | Coluna **Valor nominal** + banner simulação (−2%) | `nota-valores.js`, `notes-table.js`, `pipeline.py`, `i18n.js`, `mock_validacao.py` |
| 68 | 2026-10-24 | Dashboard modular (3 abas em `dashboard/`) | `dashboard-resumo.js`, `dashboard/*`, `scripts/extract_*.py` |
| 69 | 2026-10-24 | Carrossel horizontal no desktop; empilhado no mobile | `dashboard-shell.js`, `main.css` |
| 70 | 2026-10-24 | Fix tela inicial (imports ES modules do dashboard) | `dashboard/*.js`, `index.html`, `main.js` |
| 71 | 2026-10-24 | Tabela: viewport mínimo 10 linhas | `main.css`, `notes-table.js`, `config.js` |
| 72 | 2026-10-24 | Aba Notas: mesma altura útil dos dashboards | `main.css`, `notes-table.js`, `main.js` |
| 73 | 2026-10-24 | Aba Notas: scroll da página (Lenis), não trap interno | `main.css`, `cinematic-scroll.js`, `notes-table.js` |
| 74 | 2026-10-24 | API: `valor_bruto`, pricing `clip`, no-cache JS estático | `api.py`, `pricing.py`, testes |

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

---

## Entrada 11 — Banner simulação e recusa (2026-10-24)

### Prompts (resumo)

- Título **Simulação NF XXXX** e valor à direita; depois só título + valor.
- Ajustes visuais: centralização vertical, verde lima no valor, fundo do banner um tom mais claro (`rgb(6 95 70)`).
- Nota **recusada:** ao clicar, mostrar **motivo** no banner (vermelho), não simulação.

### O que mudou

- `mostrarBannerNota()`: aprovada → simulação + valor líquido; recusada → **Recusa NF …** + texto do `motivo`.
- Classes `.nota-recebivel-banner--recusada` e `.nota-recebivel-banner__motivo`.
- Texto de ajuda da tabela atualizado.

---

## Entrada 12 — Layout e tabela (2026-10-24)

### Prompts (resumo)

- Container da página em **8 colunas** (grade 12, `lg:col-span-8 lg:col-start-3`).
- Mobile: largura total; painéis `panel--full-bleed-mobile`.
- Colunas da tabela ocupando 100% do painel (`notes-table`, `colgroup`, Sacado flexível).

### O que mudou

- `index.html`: grid e padding `px-0` / `px-4` no bloco de upload.
- `main.css`: media query full bleed em painéis.
- `notes-table.js` + `.notes-table` em CSS: sem `min-w-[640px]` fixo; larguras em `<col>`.

---

## Entrada 13 — Ambiente de teste e config (2026-10-24)

### Prompt

Carregar tabela ao abrir com mock; corrigir Chrome (demo embutida + leitura de `.env`).

### O que mudou

- `GET /validar/demo` e injeção de `#antecipe-demo-data` em `/` quando `MOCK_VALIDACAO=true`.
- `main.js`: `lerDemoEmbutida()` + `getValidacaoDemo()` na inicialização.
- `config.py`: `_carregar_env_do_projeto()` lê `.env` e `.env.example`.
- Arquivo de log renomeado de `PROMPTS.md` para **`PROMPTS_FRONT.md`**.

---

## Entrada 14 — Coluna Status simplificada (2026-10-24)

### Prompts (resumo)

- Remover badge responsiva e popover; badges **preenchidos** (sem outline).
- Cabeçalho **Status** (sem `uppercase`).

### O que mudou

- `celulaStatus()` só com spans Aprovada/Recusada.
- CSS `.badge-status` com fundo emerald/red claro.
- Removidos estilos `.motivo-popover` e botão popover.

---

## Entrada 15 — Cinematic scroll (2026-10-24)

### Prompt

Cinematic scroll (pedido de stack: Lenis + Intersection Observer + CSS).

### O que mudou

- **`app/static/js/cinematic-scroll.js`:** Lenis 1.1.18 (CDN ESM), `IntersectionObserver` em `.cinematic-reveal`, barra `.cinematic-progress`, fallback `prefers-reduced-motion`.
- **`index.html`:** `<main>`, hero com “Role para continuar”, seções com classes cinematic.
- **`main.js`:** `initCinematicScroll()`, `cinematicRefresh()` após validação.
- Desfeito temporariamente e **reativado** junto com integração do pipeline (Entrada 16).

---

## Entrada 16 — Pipeline real na tela (2026-10-24)

### Prompt

Refazer cinematic scroll e **usar lógica de validação** (não só mock).

### O que mudou

- **`POST /validar`:** grava bytes do CSV em `data/{uuid}_{nome}`, chama `pipeline.validar_arquivo_csv`, apaga temp; erros → HTTP 400.
- **`pipeline.py`:** notas com `nome_sacado`, `data_vencimento`, `valor_nominal` para a UI.
- **`.env.example`:** `MOCK_VALIDACAO=false` por padrão.
- **`validacao.js`:** mensagens de erro parseadas de `detail` da API.
- **`tests/test_api_validar.py`:** `monkeypatch` `MOCK_VALIDACAO=false`.

---

## Entrada 17 — Header fixo (2026-10-24)

### Prompts (resumo)

- Header fixo no topo, bordas arredondadas, margem, verde igual ao banner de simulação.
- Depois: **só** o texto **Portal Antecipe**.

### O que mudou

- `<header class="portal-header">` fora do hero, `position: fixed`, `rgb(6 95 70)`, `border-radius: 0.75rem`, margem 0.75rem.
- Largura alinhada às 8 colunas em `lg+`.
- `.cinematic-main--with-fixed-header` com `padding-top` para não sobrepor conteúdo.
- Removidos eyebrow “Hackathon Antecipe” e subtítulo de upload.

---

## Entrada 19 — Paginação e validação completa (2026-10-24)

### Prompt

Validar o CSV inteiro, mas exibir só uma página na tabela; paginar até o fim da lista.

### O que mudou

- **`app/lote_cache.py`:** persiste resultado em `data/lotes/{job_id}.json`; `resposta_pagina_lote` fatia `notas`.
- **`POST /validar`:** pipeline completo → salva lote → resposta com `job_id`, `paginacao`, fatia de `notas`.
- **`GET /validar/lote/{job_id}`:** página sob demanda (mesmo lote já validado).
- **`POST /validar`:** mock removido do upload (só demo em GET).
- **Front:** `getValidarPagina`, estado `loteAtual`, resumo global na barra inferior.
- **Testes:** `tests/test_lote_paginacao.py`.

---

## Entrada 20 — Layout sem scroll da página (2026-10-24)

### Prompt

9 notas por página; header + tabela + rodapé na mesma tela; scroll apenas na tabela.

### O que mudou

- **`portal-no-scroll`:** `100dvh`, Lenis pausado com resultados.
- **`main` fixo** entre header e `resultado-bar`; `#table-root` em coluna flex.
- **`.notes-table-scroll`:** `overflow: auto`, `thead` sticky.
- Paginação compacta abaixo da área rolável.

*(Depois o default de linhas por página passou a **10** na Entrada 21.)*

---

## Entrada 21 — Botões de página e tamanho da página (2026-10-24)

### Prompt

Botões `1, 2, 3, 4, 5, …, última` (ex.: 100552); dropdown **10 / 20 / 50** notas por página.

### O que mudou

- **`notes-table.js`:** `gerarNumerosPagina` (janela + reticências); botões numerados; `<select>` com `TAMANHOS_PAGINA`; callback `onTamanhoPaginaChange`.
- **`config.js`:** `TAMANHO_PAGINA = 10`, `TAMANHOS_PAGINA = [10, 20, 50]`.
- **`main.js`:** `loteAtual.tamanhoPagina`, `alterarTamanhoPagina` → página 1 + `GET` com novo `tamanho_pagina`.
- **`main.css`:** `.notes-pagination__pages`, botão ativo, select, ellipsis.
- **`lote_cache` / API:** default `tamanho_pagina = 10`; `POST /validar` fatia em memória (sem reler JSON após salvar).
- **Testes:** `test_lote_paginacao.py` atualizado para 10 por página.

### Teste manual

1. Upload de CSV grande → barra com totais + tabela com 10 linhas.
2. Clicar **3**, **Próxima**, ou último número → carrega fatia via API.
3. Dropdown **20** ou **50** → volta à página 1 com mais linhas (scroll interno da tabela).

---

## Entrada 22 — Ajuste visual da paginação (2026-10-24)

### Prompt

Remover o rótulo “Página 1 de … (N notas)” no início; trocar **Por página** por **Mostrar** e colocar o select no final da barra.

### O que mudou

- **`notes-table.js`:** uma única linha `notes-pagination__actions` (Anterior · números · Próxima · **Mostrar** + select).
- **`main.css`:** `margin-left: auto` no label do select; removidos estilos de `__toolbar` / `__info`.

---

## Entrada 23 — Cabeçalho da tabela (2026-10-24)

### Prompt

Colocar o header das colunas em cima da tabela.

### O que mudou

- **`notes-table.js`:** estrutura `notes-table-frame` → `notes-table-head` (só `<thead>`) + `notes-table-scroll` (só `<tbody>`); mesmo `colgroup` nos dois para alinhar colunas.
- **`main.css`:** borda no frame; cabeçalho fora do scroll; corpo rola abaixo do thead.

---

## Entrada 24 — Alinhamento cabeçalho × corpo (2026-10-24)

### Prompt

Cabeçalho das colunas não estava alinhado com a tabela.

### O que mudou

- **`alinharColunasTabela`:** mesma largura útil do scroll (desconta scrollbar), `colgroup` em px nas duas tabelas.
- **Scroll horizontal:** `notes-table-head-inner` acompanha `.notes-table-scroll`.
- **CSS:** `.notes-table__cell` (padding igual th/td), largura explícita da coluna Sacado (46%), `scrollbar-gutter: stable`.

---

## Entrada 25 — Filtro por status (2026-10-24)

### Prompt

Opção de filtrar por aceitas ou recusadas.

### O que mudou

- **`lote_cache.py`:** `filtrar_notas_por_status`, query `status` → paginação sobre o subconjunto; campo `filtro_status` na resposta.
- **`POST /validar` e `GET /validar/lote/{id}`:** parâmetro `status` (`todas` | `aprovada` | `recusada`).
- **UI:** botões **Todas**, **Aceitas**, **Recusadas** acima da tabela; volta à página 1 ao trocar filtro.
- **Rodapé:** mantém totais globais do lote; paginação reflete só notas filtradas.
- **Teste:** `test_filtro_aprovadas_reduz_paginacao`.

---

## Entrada 26 — Fundo decorativo (2026-10-24)

### Prompt

Inserir imagem de montanhas de fundo no início, persistente.

### O que mudou

- **`app/static/img/hero-mountains.png`:** arte em faixa horizontal com fade claro na base.
- **`index.html`:** bloco `.portal-hero-bg` antes do header (decorativo, `aria-hidden`).
- **`main.css`:** `position: fixed` no topo, `z-index` abaixo do header/rodapé; `object-fit: cover`; visível em upload e resultados.

---

## Entrada 27 — Hero URL e header transparente (2026-10-24)

### Prompt

Usar link `/image/attachment%3A747c3084-…` no lugar da imagem; header sem preenchimento.

### O que mudou

- **`index.html`:** `src` do hero com a URL informada (query string preservada).
- **`api.py`:** `GET /image/attachment%3A747c3084-…` → `static/img/hero-mountains.png` (funciona no Uvicorn local).
- **`main.css`:** `.portal-header` com `background: transparent`, sem sombra; título verde escuro legível sobre a paisagem.

---

## Entrada 28 — URL S3 Notion no hero (2026-10-24)

### Prompt

Usar URL `https://img.notionusercontent.com/s3/prod-files-secure/...` na imagem de fundo.

### O que mudou

- **`index.html`:** `src` apontando para o link Notion (token na query); `referrerpolicy="no-referrer"`; `onerror` → `/static/img/hero-mountains.png` se o token expirar.

---

## Entrada 29 — Logo do header (2026-10-24)

### Prompt

Corrigir distorção da logo; mesma cor do texto do header.

### O que mudou

- **SVG inline** no header com `viewBox="0 0 48 56"` e `aspect-ratio: 48/56` (sem height fixo errado).
- **`currentColor`** nos retângulos; `.portal-header__logo { color: rgb(6 78 59) }` igual ao título.
- **`logo.svg`** atualizado para `currentColor` (uso externo futuro).

### Ajuste (distorção vertical)

- **`main.css`:** logo com `width` + `height: calc(1.75rem * 56/48)` fixos; wrapper `block` (sem `inline-flex` esticando o SVG).
- **`index.html`:** atributos `width="48" height="56"` e `preserveAspectRatio="xMidYMid meet"`.

---

## Entrada 30 — Header maior e sem halo branco (2026-10-24)

### Prompt

Aumentar o header; remover borda/sombra branca atrás.

### O que mudou

- **`main.css`:** título e logo maiores; `--portal-header-h: 5.75rem`; `text-shadow: none` no título; padding do header aumentado.

---

## Entrada 31 — Estrutura de assets (marca Kanastra) (2026-10-24)

### Prompt

Criar pasta para assets; implementar e documentar.

### O que mudou

- **`docs/brand/kanastra/README.md`:** onde colocar o pacote de marca (referência) e o que copiar para produção.
- **`app/static/img/brand/`:** logos/imagens servidas pelo FastAPI (`StaticFiles`).
- **`app/static/fonts/`:** fontes web opcionais.
- **`README.md`:** seção **Assets e marca (Kanastra)** com tabela de pastas.

---

## Entrada 32 — Logo reduzida Kanastra (2026-10-24)

### Prompt

Usar o SVG **Logo Reduzida (Símbolo)** da pasta `docs/brand/kanastra/` no header.

### O que mudou

- **`app/static/img/brand/logo-reduzida.svg`:** símbolo oficial (viewBox `0 0 26 36`, verde `#064e3b`).
- **`index.html`:** `<img src="/static/img/brand/logo-reduzida.svg">` no lugar do SVG placeholder.
- **`main.css`:** proporção `36/26` para logo no header.
- **`app/static/img/logo.svg`:** alinhado ao mesmo símbolo (`currentColor` para uso inline).
- **`docs/brand/kanastra/logo-reduzida-simbolo.svg`:** cópia legível (o arquivo `Logo Reduzida (Símbolo) (4).svg` no disco estava corrompido — metadados macOS `Bud1`, não XML).

---

## Entrada 33 — Dashboard resumido (2026-10-24)

### Prompt

Montar container de dashboard resumido em cima da tabela.

### O que mudou

- **`dashboard-resumo.js`:** cards Notas validadas, Aprovadas (% do lote), Recusadas, Total a receber.
- **`index.html`:** `#dashboard-root` entre upload e `#table-root`.
- **`main.js`:** render junto com o resumo do lote; show/hide com resultados.
- **`main.css`:** grid 2×2 (mobile) / 4 colunas (sm+); layout flex com gap antes da tabela.

---

## Entrada 34 — Gráficos no dashboard (2026-10-24)

### Prompt

Dashboard com gráficos.

### O que mudou

- **Chart.js 4** via CDN em `index.html`.
- **`dashboard-resumo.js`:** rosca (aprovadas × recusadas), barras horizontais, KPIs numéricos; destroy/recria charts a cada atualização do lote.
- **`main.css`:** layout 3 colunas (desktop), gráficos lado a lado no tablet; tabela de apoio para leitor de tela.

---

## Entrada 35 — Layout de resultados com scroll da página (2026-10-24)

### Prompt

Dashboard resumido acima da tabela; remover barra fixa “Total a receber”; página volta a rolar; scroll só na área da tabela; **10** notas por página visíveis.

### O que mudou

- **Removidos** `#summary-root` / `summary.js` e a barra inferior fixa (`resultado-bar`). O **Total a receber** permanece no card do `#dashboard-root` (`dashboard-resumo.js`).
- **`body.has-resultado-bar`:** substitui o modo **`portal-no-scroll`** da Entrada 20 para resultados — a **página** rola de novo; Lenis permanece ligado até a Entrada 37 (etapas).
- **`main.css`:** coluna flex upload oculto → dashboard + tabela com `gap`; `.notes-table-scroll` com `max-height` (~26.5rem) e `overscroll-behavior: contain`; cabeçalho de colunas + paginação fora da área rolável.
- **`main.js`:** `showResults()` / `hideResults()` alternam `has-resultado-bar` e ocultam `#upload-section`.

### Teste manual

1. Validar CSV → dashboard e tabela visíveis; **sem** barra fixa no rodapé.
2. Rolar a janela → dashboard/tabela sobem; rolar **dentro** da tabela → só as linhas movem.
3. Conferir total no card **Total a receber** do dashboard.

---

## Entrada 36 — Header: topo grande ↔ lateral compacta (2026-10-24)

### Prompt

Header grande e centralizado no topo; ao rolar, compactar à **esquerda** com transição suave (fade), interrompível se o usuário voltar ao topo.

### O que mudou

- **`cinematic-scroll.js`:** `syncPortalHeaderAside` — `scrollY > 1` → classe `portal-header--aside`; transição **fade** (`portal-header--leaving`, **380 ms**) antes de trocar layout; `cancelHeaderFade` se a direção mudar no meio; `getScrollY()` lê Lenis ou `window`; header **fora** do `IntersectionObserver` de `.cinematic-reveal`.
- **`main.css`:** estado expandido — desktop `left: 50%`, `translateX(-50%)`, largura ~8/12 do grid; compacto — `left: var(--portal-header-anchor-left)` (**2.75rem**), logo/título menores; `opacity` animada em `.portal-header--leaving`.
- **`prefers-reduced-motion`:** troca instantânea, sem fade.

### Teste manual

1. Topo da página → header grande (logo + título).
2. Rolar levemente → header esmaece, reaparece compacto à esquerda.
3. Voltar ao topo (`scroll ≤ 1`) → inverte para o layout grande.

---

## Entrada 37 — Rolagem por etapas entre seções (2026-10-24)

### Prompt

Rolamento por **etapas** dividido entre seções; tabelas (e dashboard) **no meio da tela**; header **no centro vertical** da viewport (não só no topo) com resultados.

### O que mudou

- **`index.html`:** classes `portal-scroll-stage` em `#upload-section`, `#dashboard-root` e `#table-root`.
- **`main.css`:**
  - `html.portal-scroll-stages` → `scroll-snap-type: y mandatory`.
  - `.portal-scroll-stage` → `min-height: 100dvh`, `scroll-snap-align: center`, `scroll-snap-stop: always`, conteúdo centrado com flex (`justify-content: center`).
  - Com resultados: `gap: 0` na coluna; `--notes-table-scroll-max: min(26.5rem, 52dvh)`.
  - `body.has-resultado-bar .portal-header` → `top: 50%`; expandido `translate(-50%, -50%)` (lg+) ou `translateY(-50%)` (mobile); compacto `translateY(-50%)` à esquerda.
  - `padding-top` do `main` zerado enquanto etapas ativas (`html.portal-scroll-stages .cinematic-main--with-fixed-header`).
- **`cinematic-scroll.js`:** `setScrollStagesActive(active)` — toggle `portal-scroll-stages` no `<html>` e **desliga Lenis** (`setSmoothScrollActive(false)`) para o snap nativo.
- **`main.js`:** `setScrollStagesActive(true)` no boot, em `showResults()` / `hideResults()`; após validar, `dashboardRoot.scrollIntoView({ behavior: "smooth", block: "center" })`; ao limpar resultados, snap de volta ao upload.

### Teste manual

1. Abrir portal → uma “tela” de upload; rolar encaixa no centro (snap).
2. Validar CSV → scroll suave para o **dashboard** centralizado na viewport.
3. Rolar mais uma etapa → **tabela** centralizada; header permanece no **meio vertical** (compacto à esquerda se `scrollY > 1`).
4. Scroll interno da tabela continua independente da etapa.

### Notas

- A Entrada 20 (`portal-no-scroll`) ficou **obsoleta** para o fluxo atual de resultados; ver Entradas 35 e 37.
- Entrada 2 ainda cita `#summary-root` no esqueleto histórico; o container foi removido na Entrada 35.

---

## Entrada 38 — Upload fixo e três etapas após validar (2026-10-24)

### Prompt

Página inicial (upload) **sem rolamento**; após inserir o arquivo, **1ª seção** = título Portal Antecipe no centro; **2ª** dashboard; **3ª** tabela; cinematic nas três; título fixo passa para a **esquerda** ao sair do snap da 1ª etapa.

### O que mudou

- **Upload:** `portal-no-scroll` no boot + `setScrollStagesActive(false)`; `#upload-section` como `.portal-upload-stage` (sem snap), conteúdo centrado na viewport.
- **`#portal-title-stage`:** nova seção snap com logo + título (cinematic); header fixo **oculto** enquanto `body.portal-on-title-stage`.
- **Pós-validação:** `showResults()` exibe título + dashboard + tabela, remove `portal-no-scroll`, ativa snap; scroll inicial para a etapa do título.
- **`cinematic-scroll.js`:** `refreshTitleStageHeader()` + `IntersectionObserver` na etapa do título; fora dela → `portal-header--aside` (compacto à esquerda); no fluxo de resultados o header **não** usa mais `scrollY > 1`.
- **`main.css`:** estilos `.portal-title-stage__*`; removido header sempre no meio vertical em todas as etapas de resultados (Entrada 37).

### Teste manual

1. Abrir portal → upload ocupa a tela; **não** rola.
2. Validar CSV → aparece etapa 1 com título centralizado (cinematic); header fixo invisível.
3. Rolar para dashboard → header reaparece compacto à esquerda; dashboard encaixa no centro.
4. Rolar para tabela → mesma lógica; voltar ao snap do título → header some de novo e título in-page volta ao centro.

### Ajuste — troca só com fade (2026-10-24)

- Na transição da **1ª etapa** ↔ **dashboard/tabela**, título in-page e header fixo **não mudam de posição**; apenas **esmaecem** (crossfade 380 ms).
- Com `has-resultado-bar`, o header fixo fica **sempre** compacto à esquerda (invisível na etapa do título via `opacity: 0`).

### Ajuste — scroll liberado (2026-10-24)

- Removido `portal-no-scroll` no upload; **`setScrollStagesActive(true)`** desde o boot (snap nativo, Lenis pausado).
- `#upload-section` volta a ser `portal-scroll-stage` (etapa centrada na viewport).

### Ajuste — sem bloqueio pós-validação (2026-10-24)

- **`showResults()`:** `unlockResultsScroll()` — reativa **Lenis** e remove `scroll-snap` obrigatório após validar.
- Removido `scrollIntoView` forçado na etapa do título; seções mantêm altura de viewport, rolagem livre entre título, dashboard e tabela.

### Ajuste — upload sem scroll (2026-10-24)

- **`lockUploadScroll()`** no boot e ao `hideResults()`: `portal-no-scroll` + Lenis pausado; upload sem `portal-scroll-stage`.
- **`unlockResultsScroll()`** só após validar.

### Ajuste — seções centralizadas + fade no snap (2026-10-24)

- Pós-validação: seções `100dvh` centralizadas.
- **`.portal-stage-focus`** em cada etapa; **`updateStageSnapFade()`** na rolagem — etapa ativa opaca no centro; inativas esmaecem **para cima ou para baixo** conforme posição (fade oposto ao sentido do snap).
- `refreshStageSnapFade()` após render e ao validar.

### Ajuste — sem barra lateral + scroll do mouse (2026-10-24)

- Com resultados: **header fixo oculto** (`display: none`); marca só na seção `#portal-title-stage`.
- **`unlockResultsScroll()`:** `portal-scroll-stages` + **`destroyLenis()`**; barra de rolagem visível de novo.
- **Snap apenas visual:** sem `scroll-snap-type` no CSS; **`updateStageSnapFade()`** escolhe a seção mais centrada e aplica fade direcional.
- **Distância entre snaps:** `--portal-stage-extra` (altura mínima `100dvh + extra`) e `--portal-stage-gap` entre seções; conteúdo continua centrado com flex.
- **Fade puro no snap:** título, dashboard e tabela centrados na etapa; troca só **`opacity`** (sem `translate`) via `.portal-stage-active`.
- **Fixos na vertical:** `.portal-stage-focus` com **`position: fixed`**, `inset: 0` + flex centro; seções só dão altura de scroll.

---

## Entrada 39 — Revert: rolagem normal (2026-10-24)

### Prompt

Desfazer toda a ideia de seção/snap; voltar ao rolamento normal.

### O que mudou

- **Removidos** `#portal-title-stage`, `portal-scroll-stage`, `portal-stage-focus`, snap visual (`updateStageSnapFade`), `destroyLenis` / `setScrollStagesActive`, observer de título.
- **Resultados:** fluxo da **Entrada 35** — dashboard → tabela em sequência, **`has-resultado-bar`**, scroll da página + scroll interno na tabela; **header fixo** visível (compacto ao rolar).
- **Upload:** continua **`lockUploadScroll()`** (sem rolagem); após validar **`unlockResultsScroll()`** reativa Lenis.
- **`cinematic-scroll.js`:** só Lenis, reveals e header aside no scroll.

---

## Entrada 40 — Validação real e situação cadastral (2026-10-24)

### Prompt

Desative a validação de teste e use a validação do script (`gerar_situacao_sacados`).

### O que mudou

- **`app/situacao_sacados.py`:** gera/atualiza `data/situacao_sacados.csv` (sacados ATIVA); `garantir_arquivo_situacao()` no boot; `incorporar_sacados_do_csv()` após upload.
- **`app/api.py`:** `GET /` só `FileResponse` (sem JSON demo); removido `GET /validar/demo`; `POST /validar` usa pipeline + `caminho_situacao`.
- **`scripts/gerar_situacao_sacados.py`:** delega a `app.situacao_sacados.gerar_de_notas`.
- **`.env.example`:** mock na API descontinuado; `MOCK_VALIDACAO=false`.
- **Testes:** `test_validar_mock.py` atualizado.

### Teste manual

1. Subir API → conferir `data/situacao_sacados.csv` se ausente.
2. Upload CSV → notas não recusadas em massa por `SITUACAO_CADASTRAL_DESCONHECIDA` quando sacados entram no CSV de situação.

---

## Entrada 41 — Lote inteiro na validação (2026-10-24)

### Prompt

Desative validação por página e faça tudo de uma vez.

### O que mudou

- **Backend:** `POST /validar` e `GET /validar/lote/{job_id}` devolvem **todas** as notas (`resposta_lote_completo`); removidos query params `pagina` / `tamanho_pagina` / `status` na API.
- **Front:** `postValidar(file)` sem query; `loteAtual.notasCompletas` guarda o lote; filtro e fatias da tabela são **locais** (`main.js`).
- **`validacao.js`:** `getValidarPagina` removido; opcional `getValidarLote(jobId)`.
- **Testes:** `test_lote_paginacao.py`, `test_api_validar.py`.

### Teste manual

1. Upload → uma requisição; trocar página/filtro na tabela **não** chama a API de novo.

---

## Entrada 42 — Troca de idioma (2026-10-24)

### Prompt

Coloque um símbolo do globo no canto da página para trocar de idioma.

### O que mudou

- **`app/static/js/i18n.js`:** pt-BR / en-US, `t()`, `localStorage`, `onLocaleChange`.
- **`lang-switcher.js`:** botão globo fixo canto superior direito; menu Português / English.
- **Componentes** (`upload-panel`, `dashboard-resumo`, `notes-table`, `main.js`, `format.js`) usam `t()`.
- **`index.html`:** `#lang-switcher-root`, `#portal-header-title`; **`main.css`:** estilos `.portal-lang-switch*`.

### Teste manual

1. Clicar globo → trocar idioma → textos da upload, dashboard, tabela e status atualizam.

---

## Entrada 43 — Mobile friendly (2026-10-24)

### Prompt

Não está mobile friendly.

### O que mudou

- **`index.html`:** `viewport-fit=cover`.
- **`main.css` (@media max-width 639px):** header com reserva para globo; KPI/dashboard empilhados; stats em 1 coluna; paginação em grid (‹ › + números roláveis); banner NF empilhado; botão validar full width; safe areas.
- **`notes-table.js`:** botões Anterior/Próxima com variantes curtas ‹ › no mobile.
- **`overflow-x: clip`** em `.portal-app`.

### Teste manual

1. DevTools iPhone / Android → upload, resultados, paginação e header sem sobrepor o globo.

---

## Entrada 44 — Margem do header lateral (2026-10-24)

### Prompt

Aumente a margem superior do header quando ele fica ancorado na lateral.

### O que mudou

- **`main.css`:** `--portal-header-aside-top: 1.35rem` (antes `top: 0.5rem` em `.portal-header--aside`).

---

## Entrada 45 — Seis páginas na paginação (2026-10-24)

### Prompt

Aumente a quantidade de páginas de 3 para 6 exibidas.

### O que mudou

- **`config.js`:** `PAGINACAO_JANELA_NUMEROS = 6`.
- **`notes-table.js`:** `gerarNumerosPagina` com janela deslizante de 6 números (+ 1 e última com reticências quando couber).

---

## Entrada 46 — Visual limpo e dashboard mensal (2026-10-24)

### Prompt

Tire todas as bordas dos containers, deixe o fundo branco; container de dashboard com botão lateral seta `>`; próximo dashboard mostra mudança ao longo dos meses.

### O que mudou

- **`main.css`:** `.panel`, dashboard, tabela e gráficos **sem borda/sombra**; fundo branco; carrossel `.dashboard-carousel*` (seta `›` / `‹`).
- **`dashboard-resumo.js`:** slide 1 = resumo atual (Chart.js); slide 2 = **evolução por mês de vencimento** (soma `valor_liquido` das aprovadas) — gráfico de linha + lista; agregação no cliente a partir de `data.notas`.
- **`main.js`:** passa `notas: loteAtual.notasCompletas` ao dashboard.
- **`i18n.js`:** chaves `dashboard.monthly*`, `dashboard.nextSlide`, `dashboard.prevSlide`.

### Teste manual

1. Validar lote → dashboard branco sem molduras.
2. Clicar **`›`** → gráfico mensal e totais por mês; **`‹`** volta ao resumo.
3. Se não houver vencimento nas aprovadas → mensagem na 2ª tela.

---

## Entrada 47 — Hero não fixo (2026-10-24)

### Prompt

Não deixe a imagem inicial fixa mais.

### O que mudou

- **`index.html`:** `.portal-hero-bg` movido para dentro de `<main>` (primeiro filho); conteúdo em `.portal-main-wrap--below-header`.
- **`main.css`:** hero `position: relative` (deixa de ser `fixed`); padding do header só no wrap (`portal-main-wrap--below-header`).

### Teste manual

1. Abrir portal → rolar após validar (ou liberar scroll) → paisagem **sobe** com o conteúdo em vez de ficar colada no viewport.

---

## Entrada 48 — Pesquisa e filtro por datas (2026-10-24)

### Prompt

Adicione um input de pesquisa por nota, e um campo para inserir data de início e data de fim justificado ao final.

### O que mudou

- **`notes-table.js`:** barra com `type="search"` (número da nota) e `type="date"` início/fim alinhados à **direita**; debounce na busca.
- **`main.js`:** `filtrarNotasComConsulta` (status + texto + vencimento); estado `buscaNota`, `dataInicio`, `dataFim`.
- **`format.js`:** `parseDataVencimentoBR`, `parseIsoDate`.
- **`i18n.js`:** rótulos pt/en.
- **`main.css`:** `.notes-toolbar`, `.notes-date-range { margin-left: auto }`.

### Teste manual

1. Validar lote → pesquisar parte do `nu_documento` → tabela e paginação atualizam.
2. Informar início/fim → filtra por `data_vencimento` (dd/mm/aaaa); combina com filtro Aceitas/Recusadas.

---

## Entrada 49 — Aba Enviar lote no início (2026-10-24)

### Prompt

Devolva a aba de adicionar lote ao início.

### O que mudou

- **`index.html`:** `#portal-top-tabs` com **Enviar lote** (1ª) e **Resultados**.
- **`main.js`:** após validar, abas visíveis; troca entre upload e dashboard/tabela; nova validação abre na aba de upload; ao concluir, foco em **Resultados**.
- Upload **não** é removido do fluxo — acessível pela 1ª aba.
- **`i18n.js`:** `upload.tab`, `results.tab`.

### Teste manual

1. Validar → abas aparecem; **Resultados** ativo.
2. Clicar **Enviar lote** → formulário de CSV de novo.
3. Enviar outro arquivo → valida e volta a **Resultados**.

### Ajuste — upload no fim da página (2026-10-24)

- **`main.css`:** `#dashboard-root` / `#table-root` só `display: flex` quando **não** `.hidden` (antes `.hidden` perdia para a especificidade do ID).
- Aba **Enviar lote:** `portal-tab-upload` centraliza o painel; `scrollIntoView` nas abas ao trocar.

### Ajuste — upload colado no fim (2026-10-24)

- **`#results-panel`:** dashboard + tabela num wrapper; oculto inteiro na aba upload (evita “vão” no layout).
- Removido `min-height` ~viewport na aba upload; reveal forçado + `scrollToPortalAnchor()` (Lenis).

---

## Entrada 50 — Duas telas: início e resultados (2026-10-24)

### Prompt

Refaça toda a tela inicial: título com opção de inserir arquivo logo abaixo; depois ir para tela de tabela e dashboards.

### O que mudou

- **`#portal-home`:** logo + título + formulário CSV (sem hero, sem header fixo, sem abas).
- **`#portal-results`:** dashboard + tabela após validar; barra com **← Novo lote**.
- Removidos header fixo antigo, hero, abas e fluxo `definirAba`.
- **`upload-panel.js`:** só hint, arquivo e botão Validar.

### Teste manual

1. Abrir `/` → título centralizado e upload em seguida.
2. Validar → troca para tela de resultados (dashboard + tabela).
3. **Novo lote** → volta à tela inicial.
4. Transição **fade** (~520ms) entre início e resultados (`portal-screen-home` / `portal-screen-results` + opacidade).

---

## Entrada 51 — Identidade Kanastra na home e UX de upload (2026-10-24)

### Prompt (resumo)

Tela inicial alinhada à marca Kanastra; upload transparente; validação automática; toast em erro; resultados com coluna branca e fundo pattern com opacidade.

### O que mudou

- **`index.html`:** `.portal-app-bg` (pattern Kanastra); estrutura home vs `#portal-results-column`.
- **`main.css`:** opacidade do pattern (home vs resultados), animação de fundo, tipografia branca na home, painéis de resultados em branco.
- **`main.js`:** transição entre telas, toast via `lib/toast.js`, fluxo pós-validação.
- **`upload-panel.js`:** área de arquivo e ícone de download; submit integrado ao fluxo de duas telas.
- **Assets:** `docs/brand/kanastra/` e `app/static/img/brand/kanastra-pattern-reference_reference1-digital.png`.

### Teste manual

1. `/` → fundo pattern, texto claro, upload visível.
2. CSV inválido → toast (sem alert nativo).
3. Após validar → fundo mais suave; dashboard/tabela em coluna branca.

---

## Entrada 52 — Dashboard em carrossel (3 slides) (2026-10-24)

### Prompt (resumo)

Segundo dashboard mais compacto; botões do carrossel sem cobrir conteúdo; terceiro painel de erros por motivo de recusa.

### O que mudou

- **`dashboard-resumo.js`:** `DASHBOARD_SLIDE_COUNT = 3`; slides resumo (donut/bar/stats), mensal (linha + lista), erros (`agregarMotivosRecusa`, gráfico horizontal); navegação prev/next; ordem DOM `[prev][viewport][next]`.
- **`main.css`:** track `300%`, slides `33,333%`, grid do carrossel.
- **`i18n.js`:** chaves `dashboard.errors*`, rótulos genéricos de painel anterior/próximo.

### Teste manual

1. Validar lote → setas laterais alternam resumo → mensal → erros.
2. Lote com recusas → gráfico de motivos; sem recusas → mensagem vazia.

---

## Entrada 53 — Ajustes visuais do carrossel (2026-10-24)

### Prompt (resumo)

Mais margem superior no carrossel; botões laterais com preenchimento transparente (área de clique maior, sem “caixa”).

### O que mudou

- **`main.css`:** `margin-top` no `.dashboard-carousel`; colunas `auto | 1fr | auto`; nav com `background: transparent`, padding nos botões; hover só reduz opacidade do ícone.

### Notas

- Tentativas de compactar horizontalmente o painel mensal e limitar largura do carrossel foram **revertidas** a pedido (escala vertical original do gráfico mensal).

---

## Entrada 54 — Dropdown de status e polish da tabela (2026-10-24)

### Prompt (resumo)

Filtro de status como dropdown entre pesquisa e datas; margens da tabela; scroll da tabela com roda do mouse (Lenis `prevent`).

### O que mudou

- **`notes-table.js`:** `<select>` de status na toolbar; `data-lenis-prevent` na área rolável.
- **`cinematic-scroll.js`:** não captura wheel dentro da tabela.

---

## Entrada 55 — Merge back + front na `main` (2026-10-24)

### Contexto

`origin/main` (portal Kanastra) e `origin/feat/back` (Postgres, paginação server-side, `situacao_merge`) divergiram após `412793a`.

### O que entrou do back (além do front já na main)

- **`lote_repository.py`**, **`lote_paginacao.py`**, **`db.py`**, **`situacao_merge.py`**, **`cnpj_situacao_mock.csv`**, scripts de mescla, testes de DB/situação.
- **`.env.example`:** `PERSISTENCIA_LOTE`, `CAMINHO_SITUACAO`, `DATABASE_URL`.

### Conflitos resolvidos

- **`app/api.py`**, **`app/lote_cache.py`:** ver Entradas 56–57.

---

## Entrada 56 — Contrato da API alinhado ao front (lote completo) (2026-10-24)

### Decisão

O front (`validacao.js`, `main.js`) continua esperando **todas as notas** no `POST /validar` e no `GET /validar/lote/{id}`; paginação permanece **no cliente**.

### O que mudou

- **`api.py`:** `salvar_lote(..., persistencia, database_url)`; resposta via `resposta_lote_completo` no POST; GET via `resposta_lote_completo_job`.
- **`lote_cache.py`:** persistência postgres/json; mantém `resposta_pagina_*` para testes e uso interno; `resposta_lote_completo` + `resposta_lote_completo_job`.
- **Boot:** schema Postgres quando disponível; `incorporar_sacados_do_csv` + `config.caminho_situacao`.

---

## Entrada 57 — Internal Server Error no upload local (2026-10-24)

### Sintoma

Com `PERSISTENCIA_LOTE=postgres` e sem Docker/Postgres, validação concluía e falhava ao **salvar lote** → HTTP 500.

### Correção

- **`api.py`:** `persistencia_lote_efetiva` — se Postgres configurado mas indisponível na subida, usa **JSON** em `data/lotes/`; rotas de validação usam a persistência efetiva.
- **`.env.example`:** padrão `PERSISTENCIA_LOTE=json` para uvicorn local; comentário para usar `postgres` no Compose.

### Teste manual

1. Subir uvicorn sem DB → upload CSV → 200 e `job_id`.
2. Log: `postgres_indisponivel_fallback_json`.

---

## Entrada 58 — Coluna valor bruto e banner por linha (2026-10-24)

### Prompt (resumo)

Coluna com valor **bruto** (nominal); ao clicar na linha, banner de **simulação de valor líquido** (aprovada) ou **motivo de recusa**; paginação 10/20/50; área rolável da tabela cabendo **~10 linhas** sem scroll (20/50 rolam dentro da tabela).

### O que mudou

- **`notes-table.js`:** `valorColuna` → sempre `valor_nominal`; banner com bloco `__lead` (título + hint) + valor ou motivo; estados aprovada/recusada/outros.
- **`i18n.js`:** `table.value` = “Valor bruto”; `banner.simHint`, `banner.rejectHint`, etc.
- **`main.css`:** estilos do banner (`__lead`, `__hint`); `--notes-table-scroll-max: calc(row-height × 10)`.
- **`config.js`:** `TAMANHO_PAGINA = 10`, `TAMANHOS_PAGINA = [10, 20, 50]` (revertido teste com 9 itens por página).

### Teste manual

1. Página com 10 notas → sem barra de scroll no corpo da tabela.
2. “Mostrar 20” → scroll interno aparece.
3. Clicar nota aprovada → banner verde com valor líquido simulado; recusada → motivo.
4. Coluna “Valor bruto” exibe nominal, não líquido.

---

## Entrada 59 — Dashboard ocupa melhor a área útil (2026-10-24)

### Prompt (resumo)

Continuar registro das mudanças; **usar melhor o espaço do dashboard** (largura da coluna de resultados, menos vazio).

### O que mudou

- **`main.css` — painel resumo (slide 1):** gráficos donut e barra em **duas colunas**; cards de totais (validadas/aprovadas/recusadas) em **faixa horizontal** abaixo (`grid-column: 1 / -1`), em vez de terceira coluna estreita vertical.
- **`main.css` — alturas:** gráficos com `clamp(..., vh, ...)` para aproveitar viewport sem exagerar padding do `#dashboard-root` (padding reduzido).
- **`dashboard-resumo.js` + `main.css` — slide mensal:** `dashboard-resumo__monthly-row` — gráfico de linha e lista de meses **lado a lado** a partir de 640px.
- **Carrossel:** `margin-top` menor; viewport em largura total do painel; setas continuam centradas na vertical.

### Teste manual

1. Resultados em desktop → slide resumo: dois gráficos alinhados e KPIs em linha abaixo.
2. Slide mensal → gráfico à esquerda, totais por mês à direita (scroll na lista se muitos meses).
3. Slide erros → gráfico horizontal um pouco mais alto (`clamp`).

---

## Entrada 60 — Abas do dashboard e separador da tabela (2026-10-24)

### Prompt (resumo)

Linha horizontal discreta entre dashboard e tabela; trocar setas do carrossel por **abas com índice** no topo: (1) Resumo financeiro, (2) Resumo do lote, (3) Resumo de recusados.

### O que mudou

- **`dashboard-resumo.js`:** barra `role="tablist"` com botões numerados; painéis `tabpanel` (financeiro = mensal, lote = donut/bar/KPIs, recusados = erros); navegação por clique e setas ←/→ no foco; removidos botões ‹ ›.
- **`main.css`:** estilos `.dashboard-tabs*`; track em modo abas (um painel visível); `#dashboard-root` com `border-bottom` slate-200; `#results-panel` sem gap extra entre blocos.
- **`i18n.js`:** `dashboard.tabFinancial`, `tabBatch`, `tabRejected`, `tabsRegion`.

### Teste manual

1. Resultados → três abas no topo do dashboard; aba 1 abre gráfico mensal.
2. Aba 2 → resumo do lote; aba 3 → motivos de recusa.
3. Linha fina cinza entre dashboard e filtros/tabela.

### Ajuste — carrossel com deslize por aba (2026-10-24)

- **`dashboard-resumo.js` / `main.css`:** ao trocar aba, o track desliza com `translate3d` conforme o índice (0 → financeiro, 1 → lote, 2 → recusados); viewport com `overflow: hidden`.

---

## Entrada 61 — Resumo financeiro reorganizado (2026-10-24)

### Prompt (resumo)

Na aba **Resumo financeiro**: total a receber, variação mensal (só gráfico), sacado com maior volume, nota de maior líquido, totais bruto e líquido; remover lista de totais por mês.

### O que mudou

- **`calcularResumoFinanceiro`:** agrega aprovadas — bruto/líquido, top sacado (soma nominal), top nota (maior `valor_liquido`), total a receber (API ou soma líquida).
- **`htmlSlideFinanceiro`:** grid de KPIs + destaques + gráfico de linha em largura total; lista `month-list` removida.
- **`main.css`:** bloco `.dashboard-financeiro*`.
- **`i18n.js`:** rótulos `dashboard.financial*`.

### Teste manual

1. Aba 1 → KPI verde “Total a receber”, bruto/líquido, cards sacado/nota, gráfico abaixo.
2. Sem aprovadas → mensagem única de vazio.
3. Aprovadas sem vencimento parseável → KPIs ok, gráfico com texto de vazio.

---

## Entrada 62 — Três abas no dashboard e tabela no carrossel (2026-10-24)

### Prompt (resumo)

Unificar navegação do resumo em abas (financeiro, recusados, notas); mover a tabela para o terceiro slide; manter `#table-root` remontado no mount do slide.

### O que mudou

- **`dashboard-resumo.js`:** `DASHBOARD_SLIDE_COUNT = 3`; slides financeiro, recusados e tabela (`#dashboard-table-mount`); `montarTabelaNoDashboard` + `guardarTableRootForaDoDashboard` antes de re-render (evita destruir `#table-root`).
- **`main.js`:** `body.portal-results-tab-notes` ao slide 2; `renderizarDashboard` vs atualização só da tabela (ver Entrada 64).
- **`main.css`:** layout flex do slide da tabela; abas com indicador deslizante.

### Teste manual

1. Validar lote → abas **Resumo financeiro**, **Resumo de recusados**, **Notas**.
2. Aba Notas → tabela com filtros locais; trocar aba e voltar → tabela ainda montada.

### Ajuste — manter aba ativa ao re-render (2026-10-24)

- **`dashboardSlidePersistido`** + `capturarSlideAtualDashboard()` antes de limpar o DOM; `resetDashboardSlide()` só em novo lote / voltar ao início.
- Filtro de sacado, idioma ou refresh do dashboard **não** voltam mais à aba 1.

---

## Entrada 63 — Filtro por sacado na barra de abas (2026-10-24)

### Prompt (resumo)

Campo à direita das abas; múltiplos sacados como badges; filtro aplicado **só ao escolher** opção (recentes ao focar, busca ao digitar); rótulos nos heróis **Total a receber** / **Total perdido** com nomes entre parênteses.

### O que mudou

- **`dashboard-resumo.js`:** combobox customizado (`sacado-combobox`), `sessionStorage` de recentes, evento `dashboard-sacados-changed`.
- **`main.js`:** `loteAtual.sacadosFiltrados[]`; dashboard e tabela recebem subset filtrado.
- **`lib/notas-filtro.js`:** `filtrarNotasPorSacado` (match exato, OR entre badges).
- **`i18n.js`:** placeholders, recentes, limpar badge.

### Teste manual

1. Escolher sacado na lista → badges; gráficos e tabela restritos.
2. Digitar sem selecionar → não aplica; Escolher da lista → aplica.
3. Heróis mostram `(Sacado A, Sacado B)` quando filtrado.

---

## Entrada 64 — Controller da tabela (filtros locais) (2026-10-24)

### Prompt (resumo)

Filtros da toolbar (status, nota, datas, paginação) não devem re-renderizar o dashboard; modularizar estado da tabela.

### O que mudou

- **`notes-table-controller.js`:** estado próprio (`filtroStatus`, `buscaNota`, datas, paginação); callbacks internos; `applyLote`, `applySacadosGlobais`, `refresh`.
- **`main.js`:** `renderizarDashboard()` + `sincronizarResultadosLote({ novoLote })`; evento sacado chama dashboard + `applySacadosGlobais`; removido flag `somenteTabela`.
- **`lib/notas-filtro.js`:** `filtrarNotasConsultaTabela`, paginação local.

### Teste manual

1. Aba Notas → alterar status / busca / datas → dashboard (gráficos) **não** pisca.
2. Alterar sacado na barra → dashboard **e** tabela atualizam.
3. Novo lote → filtros da tabela resetam.

---

## Entrada 65 — Scroll vertical só na área de linhas (aba Notas) (2026-10-24)

### Prompt (resumo)

Tabela não expandir a página; `overflow: auto` no corpo; remover fade cinematic do `#table-root`.

### O que mudou

- **`main.css`:** cadeia flex `portal-results-tab-notes` com altura limitada a `100dvh`; `.notes-table-scroll` com `flex: 1`, `overflow: auto`.
- **`index.html`:** removido `cinematic-reveal` de `#table-root`.
- **`cinematic-scroll.js`:** observer ignora `#table-root` e slide da tabela.

### Teste manual

1. Aba Notas, muitas linhas → scroll **dentro** da tabela; paginação/filtros fixos acima/abaixo.
2. Troca de aba → sem fade da tabela.

---

## Entrada 66 — Colunas após “nenhuma nota” (filtro vazio) (2026-10-24)

### Prompt (resumo)

Cenário: sacado sem recusadas → filtro **Recusadas** na tabela → voltar **Todas** → coluna Nota estourava horizontalmente.

### Causa

Linha vazia usa `<td colspan="5">`. O alinhamento media essa célula e gravava largura em px só na primeira coluna; ao voltar linhas normais, o `colgroup` ficava inconsistente.

### O que mudou

- **`notes-table.js`:** `limparLargurasColunasTabela`; com linha `.notes-table__empty` **não** fixa px (só CSS `%`); px só com 5 células no corpo; `agendarRealinhamentoColunas` com retry se `clientWidth === 0`; segundo passo quando modo `body`.
- **`main.css`:** `.notes-table__cell--nota` com `ellipsis` + `max-width` de segurança.

### Teste manual

1. Sacado só aprovadas → filtro Recusadas (vazio) → Todas → colunas proporcionais (10% / 46% / …).
2. Repetir após trocar sacado global e paginar.

---

## Entrada 67 — Valor nominal na tabela e simulação no banner (2026-10-24)

### Prompt (resumo)

Coluna deve mostrar valor **nominal/bruto**; ao clicar na linha, banner de simulação usa **nominal − 2%**; renomear rótulo para “Valor nominal”; corrigir cache de JS antigo.

### O que mudou

- **`lib/nota-valores.js`:** `formatValorNominalNota`, `formatValorLiquidoSimulado` (×0,98).
- **`notes-table.js`:** coluna e banner usam helpers; cache-bust nos imports.
- **`pipeline.py`:** campo `valor_bruto` (= `VALOR_NOMINAL`) na resposta.
- **`i18n.js`:** `table.value`, `banner.simHint`.
- **`mock_validacao.py`:** nota de exemplo alinhada.
- **`api.py`:** middleware `_StaticNoCacheMiddleware` em `/static/js/` e `/static/css/`.
- **`tests/test_api_validar.py`:** assert `valor_bruto == valor_nominal`.

### Teste manual

1. Upload CSV → coluna **Valor nominal** = nominal da nota aprovada.
2. Clique em aprovada → banner ≈ 98% do nominal.
3. Ctrl+F5 → comportamento mantido (sem JS velho).

---

## Entrada 68 — Dashboard modular em três abas (2026-10-24)

### Prompt (resumo)

Modularizar as 3 abas (financeiro, recusados, notas) para escalar; tabela com mais altura vertical; manter persistência da aba ativa.

### O que mudou

- **`app/static/js/components/dashboard/`:** `dashboard-data.js`, `dashboard-charts.js`, `dashboard-sacado-combobox.js`, `dashboard-shell.js`, `tab-financial.js`, `tab-rejected.js`, `tab-notes.js`.
- **`dashboard-resumo.js`:** orquestrador fino (`renderDashboardResumo`, reexporta combobox/slide reset).
- **`dashboard-shell.js`:** troca de abas, `dashboard-slide-changed`, classe `portal-results-tab-notes` na aba 2.
- Backup local: `dashboard-resumo.js.bak` (não versionado).

### Teste manual

1. Validar lote → três abas renderizam KPIs/gráficos/tabela.
2. Filtrar sacado → dashboard re-renderiza na **mesma aba**.
3. **Novo lote** → volta à aba financeiro.

---

## Entrada 69 — Carrossel horizontal no desktop (2026-10-24)

### Prompt (resumo)

Continuar modelo visual de **carrossel horizontal** no desktop; mobile pode empilhar painéis.

### O que mudou

- **`dashboard-shell.js`:** `matchMedia (min-width: 768px)` — desktop usa `translate3d` no track; mobile oculta painéis inativos.
- **`dashboard-resumo.js`:** DOM `dashboard-carousel__track.dashboard-views`.
- **`main.css`:** media queries `.dashboard-views` (row vs column).

### Teste manual

1. Desktop → clicar abas desliza track horizontalmente.
2. Reduzir janela &lt;768px → uma aba por vez, sem translate.

---

## Entrada 70 — Tela inicial / upload CSV (2026-10-24)

### Prompt (resumo)

“A página inicial sumiu com a opção de inserir csv”.

### Causa

Módulos em `dashboard/` importavam `../i18n.js` (pasta `components/`) em vez de `../../i18n.js` — falha ao carregar `main.js` → `mountUpload()` não executava.

### O que mudou

- Corrigidos imports em todos os arquivos de `dashboard/`.
- Cache-bust em `main.js` no `index.html`.

### Teste manual

1. Abrir `/` → título + dropzone CSV visíveis.
2. DevTools → sem 404 em `components/i18n.js`.

---

## Entrada 71 — Mínimo de 10 notas visíveis (2026-10-24)

### Prompt (resumo)

Expandir tabela para exibir **no mínimo 10 notas** sem rolagem interna (paginação padrão 10).

### O que mudou

- **`main.css`:** `--notes-table-row-height`, `--notes-table-scroll-max` (10 linhas); linhas com altura fixa; sacado em uma linha (ellipsis).
- **`notes-table.js`:** `ajustarViewportScrollTabela` define `--notes-table-viewport-min`.

### Teste manual

1. Aba Notas, **Mostrar 10** → dez linhas cabem no viewport mínimo.
2. **Mostrar 20** → scroll interno só se &gt;10 linhas na página (comportamento posterior ajustado na Entrada 73).

---

## Entrada 72 — Aba Notas com mesma área dos dashboards (2026-10-24)

### Prompt (resumo)

“A aba de tabela não está expandindo” — alinhar à altura útil de Financeiro/Recusados.

### O que mudou

- **`main.css`:** cadeia flex em `#results-panel`, `#dashboard-root`, slide `--table` / `.dashboard-view--notes`; `min-height: calc(100dvh - 13rem)` como nas outras abas.
- **`main.js`:** ao entrar na aba Notas, `refresh()` da tabela + `resize`.

### Teste manual

1. Comparar altura do painel Notas vs Financeiro no mesmo viewport.
2. Filtros + paginação permanecem visíveis abaixo do bloco da tabela.

---

## Entrada 73 — Scroll da página na aba Notas (2026-10-24)

### Prompt (resumo)

“O scroll é travado na tabela, ao contrário do resto”.

### Causa

Entrada 65 (`portal-results-tab-notes` + `100dvh` + `overflow: hidden`), Lenis `prevent` em `.notes-table-scroll`, e `overflow: auto` no corpo da tabela.

### O que mudou

- Removido trap `100dvh` da aba Notas; `#dashboard-root` e frame da tabela com `overflow: visible`.
- **`cinematic-scroll.js`:** removido `prevent` do Lenis na tabela.
- **`notes-table.js`:** removidos `data-lenis-prevent` e interceptação de `wheel`; corpo com `overflow-y: visible` (scroll da página).
- **Nota:** substitui o comportamento da Entrada 65 para rolagem vertical global.

### Teste manual

1. Aba Notas → roda do mouse move a **página** (como Financeiro).
2. Sem barra de scroll fina presa só no miolo da tabela (salvo overflow horizontal em telas estreitas).

---

## Entrada 74 — Backend: valor bruto e pricing (2026-10-24)

### Prompt (resumo)

Suporte à coluna nominal e testes de precificação quando vencimento &lt; data-base.

### O que mudou

- **`pricing.py`:** `prazo` com `clip(lower_bound=0)` para não inflar líquido acima do nominal.
- **`pipeline.py`:** expõe `valor_bruto`.
- **`tests/test_pricing.py`:** caso vencimento anterior à data-base.
- **`.env.example`:** nota sobre `PERSISTENCIA_LOTE=json` sem Postgres.

### Teste manual

1. `pytest tests/test_pricing.py tests/test_api_validar.py -q`.
