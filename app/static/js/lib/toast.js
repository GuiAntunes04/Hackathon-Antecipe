import { t } from "../i18n.js";

/** @type {HTMLElement | null} */
let stackEl = null;

function ensureStack() {
  if (stackEl?.isConnected) return stackEl;
  stackEl = document.createElement("div");
  stackEl.className = "portal-toast-stack";
  stackEl.setAttribute("aria-live", "assertive");
  document.body.appendChild(stackEl);
  return stackEl;
}

/**
 * @param {string} message
 * @param {{ variant?: "error" | "info"; durationMs?: number }} [opts]
 */
export function showToast(message, opts = {}) {
  const variant = opts.variant ?? "error";
  const durationMs = opts.durationMs ?? 7000;
  const text = String(message || "").trim();
  if (!text) return;

  const stack = ensureStack();
  const toast = document.createElement("div");
  toast.className = `portal-toast portal-toast--${variant}`;
  toast.setAttribute("role", "alert");

  const body = document.createElement("p");
  body.className = "portal-toast__message";
  body.textContent = text;

  const close = document.createElement("button");
  close.type = "button";
  close.className = "portal-toast__close";
  close.setAttribute("aria-label", t("toast.close"));
  close.textContent = "×";

  toast.append(body, close);
  stack.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("is-visible"));

  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 320);
  };

  const timer = window.setTimeout(remove, durationMs);
  close.addEventListener("click", () => {
    window.clearTimeout(timer);
    remove();
  });
}
