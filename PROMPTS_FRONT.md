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
