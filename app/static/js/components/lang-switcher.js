import { getLocale, onLocaleChange, setLocale, t, LOCALES } from "../i18n.js";

const GLOBE_SVG = `<svg class="portal-lang-switch__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
  <circle cx="12" cy="12" r="9" />
  <path stroke-linecap="round" d="M3 12h18" />
  <path stroke-linecap="round" d="M12 3c2.8 2.9 4.5 6.4 4.5 9s-1.7 6.1-4.5 9" />
  <path stroke-linecap="round" d="M12 3c-2.8 2.9-4.5 6.4-4.5 9s1.7 6.1 4.5 9" />
</svg>`;

/** @param {HTMLElement} root */
function paint(root, open) {
  const locale = getLocale();
  const items = LOCALES.map((id) => {
    const label = id === "pt-BR" ? t("lang.pt") : t("lang.en");
    const active = id === locale;
    return `<button type="button" class="portal-lang-switch__option${
      active ? " portal-lang-switch__option--active" : ""
    }" data-locale="${id}" ${active ? 'aria-current="true"' : ""}>${label}</button>`;
  }).join("");

  root.innerHTML = `
    <div class="portal-lang-switch">
      <button
        type="button"
        class="portal-lang-switch__trigger"
        aria-haspopup="listbox"
        aria-expanded="${open ? "true" : "false"}"
        aria-label="${t("lang.switch")}"
        title="${t("lang.switch")}"
      >
        ${GLOBE_SVG}
      </button>
      <div class="portal-lang-switch__menu" role="listbox" ${open ? "" : "hidden"}>
        ${items}
      </div>
    </div>
  `;
}

/**
 * Globo fixo no canto superior direito para trocar pt/en.
 * @param {HTMLElement} root
 */
export function mountLangSwitcher(root) {
  if (root.dataset.mounted === "1") return;
  root.dataset.mounted = "1";

  let open = false;

  function sync() {
    paint(root, open);
  }

  root.addEventListener("click", (e) => {
    const trigger = e.target.closest(".portal-lang-switch__trigger");
    const option = e.target.closest("[data-locale]");
    if (trigger) {
      e.stopPropagation();
      open = !open;
      sync();
      return;
    }
    if (option) {
      e.stopPropagation();
      const next = option.getAttribute("data-locale");
      if (next === "pt-BR" || next === "en-US") setLocale(next);
      open = false;
      sync();
    }
  });

  document.addEventListener("click", () => {
    if (!open) return;
    open = false;
    sync();
  });

  onLocaleChange(() => {
    sync();
  });

  sync();
}
