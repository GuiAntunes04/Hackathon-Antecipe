import { escapeHtml } from "../../lib/format.js";
import { t } from "../../i18n.js";

const SACADO_RECENTES_KEY = "antecipe-sacados-recentes";
const SACADO_RECENTES_MAX = 8;

function lerSacadosRecentes() {
  try {
    const raw = sessionStorage.getItem(SACADO_RECENTES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string" && x.trim()) : [];
  } catch {
    return [];
  }
}

function gravarSacadosRecentes(lista) {
  try {
    sessionStorage.setItem(SACADO_RECENTES_KEY, JSON.stringify(lista));
  } catch {
    /* ignore quota */
  }
}

/** @param {string} nome */
export function registrarSacadoRecente(nome) {
  const s = String(nome ?? "").trim();
  if (!s) return;
  const cur = lerSacadosRecentes().filter((x) => x !== s);
  cur.unshift(s);
  gravarSacadosRecentes(cur.slice(0, SACADO_RECENTES_MAX));
}

/** @param {string[]} sacadosOpcoes */
function htmlListaSacadoCombobox(sacadosOpcoes) {
  const opcoes = (sacadosOpcoes || [])
    .map(
      (nome) =>
        `<li class="sacado-combobox__option sacado-combobox__option--catalog" role="option" data-value="${escapeHtml(nome)}" tabindex="-1" hidden>${escapeHtml(nome)}</li>`
    )
    .join("");
  return `
    <ul
      id="dashboard-sacado-listbox"
      class="sacado-combobox__list"
      role="listbox"
      aria-label="${t("dashboard.searchDraweePlaceholder")}"
      hidden
    >
      <li
        class="sacado-combobox__section-label"
        data-section="recent"
        role="presentation"
        hidden
      >${t("dashboard.searchDraweeRecent")}</li>
      <li
        class="sacado-combobox__option sacado-combobox__option--all"
        role="option"
        data-value=""
        tabindex="-1"
        hidden
      >${t("dashboard.searchDraweeAll")}</li>
      ${opcoes}
      <li class="sacado-combobox__empty" role="presentation" hidden>${t("dashboard.searchDraweeEmpty")}</li>
    </ul>`;
}

/** @param {number} index @param {string} rotulo @param {string} rotuloCompacto @param {boolean} ativa */
function htmlAbaDashboard(index, rotulo, rotuloCompacto, ativa) {
  return `
    <button
      type="button"
      class="dashboard-tabs__btn${ativa ? " dashboard-tabs__btn--active" : ""}"
      role="tab"
      id="dashboard-tab-${index}"
      aria-selected="${ativa ? "true" : "false"}"
      aria-controls="dashboard-panel-${index}"
      tabindex="${ativa ? "0" : "-1"}"
      data-slide="${index}"
      aria-label="${escapeHtml(rotulo)}"
    >
      <span class="dashboard-tabs__label dashboard-tabs__label--full">${escapeHtml(rotulo)}</span>
      <span class="dashboard-tabs__label dashboard-tabs__label--compact" aria-hidden="true">${escapeHtml(rotuloCompacto)}</span>
    </button>`;
}

/** @param {string[]} sacadosFiltrados */
export function htmlSufixoSacadosHero(sacadosFiltrados) {
  const lista = (sacadosFiltrados || []).map((s) => String(s).trim()).filter(Boolean);
  if (lista.length === 0) return "";
  const texto =
    lista.length <= 3
      ? lista.map((n) => escapeHtml(n)).join(", ")
      : `${lista
          .slice(0, 2)
          .map((n) => escapeHtml(n))
          .join(", ")} +${lista.length - 2}`;
  return `<span class="dashboard-hero__sacados-filtro"> (${texto})</span>`;
}

/** @param {string} nome */
function htmlBadgeSacadoFiltro(nome) {
  const rotulo = t("dashboard.searchDraweeRemoveBadge", { name: nome });
  return `
    <span class="sacado-combobox__badge" data-value="${escapeHtml(nome)}">
      <span class="sacado-combobox__badge-label">${escapeHtml(nome)}</span>
      <button type="button" class="sacado-combobox__badge-remove" aria-label="${escapeHtml(rotulo)}">
        <span aria-hidden="true">×</span>
      </button>
    </span>`;
}

export function htmlBarraAbas(slideAtivo, sacadosFiltrados = [], sacadosOpcoes = []) {
  const tabs = [
    [t("dashboard.tabFinancial"), t("dashboard.tabFinancialShort")],
    [t("dashboard.tabRejected"), t("dashboard.tabRejectedShort")],
    [t("dashboard.tabNotes"), t("dashboard.tabNotesShort")],
  ];
  const botoes = tabs
    .map(([rotulo, compacto], i) => htmlAbaDashboard(i, rotulo, compacto, i === slideAtivo))
    .join("");
  const aplicados = (sacadosFiltrados || [])
    .map((s) => String(s).trim())
    .filter(Boolean);
  const badges = aplicados.map((nome) => htmlBadgeSacadoFiltro(nome)).join("");
  const placeholder = t("dashboard.searchDraweePlaceholder");
  return `
    <div class="dashboard-tabs-row">
      <div class="dashboard-tabs" role="tablist" aria-label="${t("dashboard.tabsRegion")}">
        <span class="dashboard-tabs__indicator" aria-hidden="true"></span>
        ${botoes}
      </div>
      <div class="sacado-combobox dashboard-tabs-row__search">
        <div class="sacado-combobox__control">
          <div class="sacado-combobox__field" id="dashboard-sacado-field">
            <div class="sacado-combobox__badges" id="dashboard-sacado-badges">${badges}</div>
            <input
              type="text"
              id="dashboard-busca-sacado"
              class="sacado-combobox__input"
              name="busca-sacado"
              value=""
              placeholder="${aplicados.length ? "" : placeholder}"
              autocomplete="off"
              spellcheck="false"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="false"
              aria-controls="dashboard-sacado-listbox"
              aria-label="${placeholder}"
            />
          </div>
          <button
            type="button"
            class="sacado-combobox__clear"
            aria-label="${t("dashboard.searchDraweeClear")}"
            ${aplicados.length ? "" : "hidden"}
          >
            <span aria-hidden="true">×</span>
          </button>
          <span class="sacado-combobox__chevron" aria-hidden="true"></span>
        </div>
        ${htmlListaSacadoCombobox(sacadosOpcoes)}
      </div>
    </div>`;
}

/** @param {HTMLElement} combobox */
function obterComboboxSacado(combobox) {
  const input = combobox.querySelector("#dashboard-busca-sacado");
  const list = combobox.querySelector("#dashboard-sacado-listbox");
  const clearBtn = combobox.querySelector(".sacado-combobox__clear");
  const empty = combobox.querySelector(".sacado-combobox__empty");
  const badges = combobox.querySelector("#dashboard-sacado-badges");
  const field = combobox.querySelector("#dashboard-sacado-field");
  if (!(input instanceof HTMLInputElement) || !list) return null;
  return { combobox, input, list, clearBtn, empty, badges, field };
}

/** @param {ReturnType<typeof obterComboboxSacado>} ctx */
function lerSacadosAplicados(ctx) {
  if (!ctx?.badges) return [];
  return [...ctx.badges.querySelectorAll(".sacado-combobox__badge")]
    .map((el) => el.getAttribute("data-value") ?? "")
    .filter(Boolean);
}

/** @param {ReturnType<typeof obterComboboxSacado>} ctx */
function sacadosAplicadosSet(ctx) {
  return new Set(lerSacadosAplicados(ctx).map((s) => s.toLowerCase()));
}

/** @param {HTMLElement} list */
function opcoesVisiveisSacado(list) {
  return [...list.querySelectorAll(".sacado-combobox__option")].filter((el) => !el.hidden);
}

/** @param {HTMLElement} list */
function limparOpcoesRecentesDinamicas(list) {
  list.querySelectorAll('[data-recent-dynamic="1"]').forEach((el) => el.remove());
}

/** @param {ReturnType<typeof obterComboboxSacado>} ctx */
function catalogoSacadoValido(ctx) {
  const set = new Set();
  if (!ctx) return set;
  ctx.list.querySelectorAll(".sacado-combobox__option--catalog").forEach((el) => {
    const v = el.getAttribute("data-value");
    if (v) set.add(v);
  });
  return set;
}

/** @param {HTMLInputElement} input */
function rascunhoBuscaSacado(input) {
  return input.value.trim();
}

/** @param {HTMLInputElement} input */
function emModoBuscaSacado(input) {
  return rascunhoBuscaSacado(input).length > 0;
}

/** @param {ReturnType<typeof obterComboboxSacado>} ctx */
function resetDestaqueOpcoesSacado(ctx) {
  if (!ctx) return;
  ctx.list.querySelectorAll(".sacado-combobox__option--active").forEach((el) => {
    el.classList.remove("sacado-combobox__option--active");
  });
}

/** @param {ReturnType<typeof obterComboboxSacado>} ctx @returns {number} */
function aplicarModoRecentesSacado(ctx) {
  if (!ctx) return 0;
  limparOpcoesRecentesDinamicas(ctx.list);
  resetDestaqueOpcoesSacado(ctx);

  const label = ctx.list.querySelector('[data-section="recent"]');
  const allOpt = ctx.list.querySelector(".sacado-combobox__option--all");
  if (allOpt instanceof HTMLElement) allOpt.hidden = true;

  ctx.list.querySelectorAll(".sacado-combobox__option--catalog").forEach((el) => {
    el.hidden = true;
  });
  if (ctx.empty instanceof HTMLElement) ctx.empty.hidden = true;

  const validos = catalogoSacadoValido(ctx);
  const jaAplicados = sacadosAplicadosSet(ctx);
  const recentes = lerSacadosRecentes().filter(
    (nome) => validos.has(nome) && !jaAplicados.has(nome.toLowerCase())
  );
  if (recentes.length === 0) {
    if (label instanceof HTMLElement) label.hidden = true;
    return 0;
  }

  if (label instanceof HTMLElement) label.hidden = false;
  let after = label instanceof HTMLElement ? label : ctx.list;
  for (const nome of recentes) {
    const li = document.createElement("li");
    li.className = "sacado-combobox__option sacado-combobox__option--recent";
    li.setAttribute("role", "option");
    li.setAttribute("data-value", nome);
    li.setAttribute("data-recent-dynamic", "1");
    li.tabIndex = -1;
    li.textContent = nome;
    if (after instanceof HTMLElement) {
      after.insertAdjacentElement("afterend", li);
      after = li;
    } else {
      ctx.list.appendChild(li);
      after = li;
    }
  }
  return recentes.length;
}

/** @param {ReturnType<typeof obterComboboxSacado>} ctx @param {string} termo */
function aplicarModoBuscaSacado(ctx, termo) {
  if (!ctx) return;
  const q = termo.trim().toLowerCase();
  limparOpcoesRecentesDinamicas(ctx.list);
  resetDestaqueOpcoesSacado(ctx);

  const label = ctx.list.querySelector('[data-section="recent"]');
  if (label instanceof HTMLElement) label.hidden = true;

  const allOpt = ctx.list.querySelector(".sacado-combobox__option--all");
  if (allOpt instanceof HTMLElement) allOpt.hidden = !q;

  const jaAplicados = sacadosAplicadosSet(ctx);
  let visiveis = 0;
  ctx.list.querySelectorAll(".sacado-combobox__option--catalog").forEach((el) => {
    const bruto = el.getAttribute("data-value") ?? el.textContent ?? "";
    const texto = bruto.toLowerCase();
    const match =
      Boolean(q) && texto.includes(q) && !jaAplicados.has(texto);
    el.hidden = !match;
    if (match) visiveis += 1;
  });

  if (ctx.empty instanceof HTMLElement) {
    ctx.empty.hidden = !q || visiveis > 0;
  }
}

/** @param {ReturnType<typeof obterComboboxSacado>} ctx @param {HTMLInputElement} input */
function abrirListaSacadoSeAplicavel(ctx, input) {
  if (!ctx) return;
  if (emModoBuscaSacado(input)) {
    aplicarModoBuscaSacado(ctx, rascunhoBuscaSacado(input));
    definirListaSacadoAberta(ctx, true);
    return;
  }
  const qtd = aplicarModoRecentesSacado(ctx);
  definirListaSacadoAberta(ctx, qtd > 0);
}

/** @param {ReturnType<typeof obterComboboxSacado>} ctx @param {boolean} aberto */
function definirListaSacadoAberta(ctx, aberto) {
  if (!ctx) return;
  ctx.list.hidden = !aberto;
  ctx.input.setAttribute("aria-expanded", aberto ? "true" : "false");
  ctx.combobox.classList.toggle("sacado-combobox--open", aberto);
}

/** @param {ReturnType<typeof obterComboboxSacado>} ctx */
function limparRascunhoSacado(ctx) {
  if (!ctx) return;
  ctx.input.value = "";
  const aplicados = lerSacadosAplicados(ctx);
  ctx.input.placeholder = aplicados.length ? "" : t("dashboard.searchDraweePlaceholder");
}

/** @param {HTMLElement} dashboardHost @param {string[]} sacados */
function emitirSacadosAlterados(dashboardHost, sacados) {
  dashboardHost.dispatchEvent(
    new CustomEvent("dashboard-sacados-changed", {
      bubbles: true,
      detail: { sacados },
    })
  );
}

/** @param {HTMLElement} dashboardHost */
export function vincularComboboxSacadoDashboard(dashboardHost) {
  if (!dashboardHost || dashboardHost.dataset.boundSacadoCombobox === "1") return;
  dashboardHost.dataset.boundSacadoCombobox = "1";

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let blurTimer;

  /** @param {HTMLElement} option */
  function escolherOpcaoSacado(option) {
    const combobox = option.closest(".sacado-combobox");
    if (!(combobox instanceof HTMLElement)) return;
    const ctx = obterComboboxSacado(combobox);
    if (!ctx) return;
    const valor = option.getAttribute("data-value") ?? "";
    let sacados = lerSacadosAplicados(ctx);
    if (!valor) {
      sacados = [];
    } else if (!sacados.includes(valor)) {
      sacados = [...sacados, valor];
      registrarSacadoRecente(valor);
    }
    limparRascunhoSacado(ctx);
    definirListaSacadoAberta(ctx, false);
    emitirSacadosAlterados(dashboardHost, sacados);
  }

  dashboardHost.addEventListener("focusin", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input.id !== "dashboard-busca-sacado") return;
    const combobox = input.closest(".sacado-combobox");
    if (!(combobox instanceof HTMLElement)) return;
    const ctx = obterComboboxSacado(combobox);
    if (!ctx) return;
    if (blurTimer) clearTimeout(blurTimer);
    abrirListaSacadoSeAplicavel(ctx, input);
  });

  dashboardHost.addEventListener("input", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input.id !== "dashboard-busca-sacado") return;
    const combobox = input.closest(".sacado-combobox");
    if (!(combobox instanceof HTMLElement)) return;
    const ctx = obterComboboxSacado(combobox);
    if (!ctx) return;
    abrirListaSacadoSeAplicavel(ctx, input);
  });

  dashboardHost.addEventListener("mousedown", (e) => {
    const alvo = e.target;
    if (!(alvo instanceof Element)) return;
    if (
      alvo.closest(".sacado-combobox__option") ||
      alvo.closest(".sacado-combobox__badge-remove")
    ) {
      e.preventDefault();
    }
  });

  dashboardHost.addEventListener("click", (e) => {
    const alvo = e.target;
    if (!(alvo instanceof Element)) return;

    const badgeRemove = alvo.closest(".sacado-combobox__badge-remove");
    if (badgeRemove instanceof HTMLButtonElement) {
      const chip = badgeRemove.closest(".sacado-combobox__badge");
      const combobox = badgeRemove.closest(".sacado-combobox");
      if (!(chip instanceof HTMLElement) || !(combobox instanceof HTMLElement)) return;
      const ctx = obterComboboxSacado(combobox);
      if (!ctx) return;
      const valor = chip.getAttribute("data-value") ?? "";
      const sacados = lerSacadosAplicados(ctx).filter((s) => s !== valor);
      emitirSacadosAlterados(dashboardHost, sacados);
      ctx.input.focus();
      return;
    }

    const option = alvo.closest(".sacado-combobox__option");
    if (option instanceof HTMLElement) {
      e.preventDefault();
      escolherOpcaoSacado(option);
      return;
    }

    const clearBtn = alvo.closest(".sacado-combobox__clear");
    if (clearBtn instanceof HTMLButtonElement) {
      const combobox = clearBtn.closest(".sacado-combobox");
      if (!(combobox instanceof HTMLElement)) return;
      const ctx = obterComboboxSacado(combobox);
      if (!ctx) return;
      limparRascunhoSacado(ctx);
      definirListaSacadoAberta(ctx, false);
      emitirSacadosAlterados(dashboardHost, []);
      ctx.input.focus();
      abrirListaSacadoSeAplicavel(ctx, ctx.input);
      return;
    }

    const field = alvo.closest("#dashboard-sacado-field");
    if (field instanceof HTMLElement && !(alvo instanceof HTMLInputElement)) {
      const combobox = field.closest(".sacado-combobox");
      if (!(combobox instanceof HTMLElement)) return;
      const ctx = obterComboboxSacado(combobox);
      ctx?.input.focus();
    }

    const chevron = alvo.closest(".sacado-combobox__chevron");
    const control = alvo.closest(".sacado-combobox__control");
    if (chevron || (control && !(alvo instanceof HTMLInputElement) && !field)) {
      const combobox = alvo.closest(".sacado-combobox");
      if (!(combobox instanceof HTMLElement)) return;
      const ctx = obterComboboxSacado(combobox);
      if (!ctx) return;
      const abrir = ctx.list.hidden;
      if (abrir) {
        ctx.input.focus();
        abrirListaSacadoSeAplicavel(ctx, ctx.input);
      } else {
        definirListaSacadoAberta(ctx, false);
        limparRascunhoSacado(ctx);
      }
    }
  });

  dashboardHost.addEventListener(
    "blur",
    (e) => {
      const alvo = e.target;
      if (!(alvo instanceof HTMLElement)) return;
      const combobox = alvo.closest(".sacado-combobox");
      if (!(combobox instanceof HTMLElement)) return;
      if (blurTimer) clearTimeout(blurTimer);
      blurTimer = setTimeout(() => {
        const dentro = combobox.contains(document.activeElement);
        if (dentro) return;
        const ctx = obterComboboxSacado(combobox);
        if (!ctx) return;
        definirListaSacadoAberta(ctx, false);
        limparRascunhoSacado(ctx);
      }, 140);
    },
    true
  );

  dashboardHost.addEventListener("keydown", (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement) || input.id !== "dashboard-busca-sacado") return;
    const combobox = input.closest(".sacado-combobox");
    if (!(combobox instanceof HTMLElement)) return;
    const ctx = obterComboboxSacado(combobox);
    if (!ctx) return;

    if (e.key === "Escape") {
      e.preventDefault();
      definirListaSacadoAberta(ctx, false);
      limparRascunhoSacado(ctx);
      return;
    }

    if (e.key === "Backspace" && !input.value.trim()) {
      const sacados = lerSacadosAplicados(ctx);
      if (sacados.length > 0) {
        e.preventDefault();
        emitirSacadosAlterados(dashboardHost, sacados.slice(0, -1));
      }
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (ctx.list.hidden) {
        abrirListaSacadoSeAplicavel(ctx, input);
      }
      const opcoes = opcoesVisiveisSacado(ctx.list);
      if (opcoes.length === 0) return;
      const atual = opcoes.findIndex((el) => el.classList.contains("sacado-combobox__option--active"));
      let next = atual;
      if (e.key === "ArrowDown") next = atual < 0 ? 0 : Math.min(opcoes.length - 1, atual + 1);
      else next = atual < 0 ? opcoes.length - 1 : Math.max(0, atual - 1);
      opcoes.forEach((el) => el.classList.remove("sacado-combobox__option--active"));
      const alvo = opcoes[next];
      alvo.classList.add("sacado-combobox__option--active");
      alvo.scrollIntoView({ block: "nearest" });
      return;
    }

    if (e.key === "Enter") {
      const ativa = ctx.list.querySelector(".sacado-combobox__option--active");
      if (ativa instanceof HTMLElement && !ctx.list.hidden) {
        e.preventDefault();
        escolherOpcaoSacado(ativa);
      }
    }
  });
}
