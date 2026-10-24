import { t } from "../i18n.js";

const DOWNLOAD_ICON = `<svg class="portal-upload-dropzone__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
</svg>`;

/**
 * Formulário de upload (sem título duplicado — título fica na tela inicial).
 * @param {HTMLElement} container
 * @param {{ onSubmit: (file: File) => void | Promise<void> }} handlers
 */
export function mountUploadPanel(container, { onSubmit }) {
  container.innerHTML = `
    <div id="form-upload" class="portal-upload-form">
      <label class="portal-upload-dropzone" for="arquivo">
        <input
          type="file"
          class="portal-upload-dropzone__input"
          id="arquivo"
          name="arquivo"
          accept=".csv"
        />
        <span class="portal-upload-dropzone__icon">${DOWNLOAD_ICON}</span>
        <span class="portal-upload-dropzone__text">${t("upload.fileLabel")}</span>
        <span class="portal-upload-dropzone__filename" data-filename hidden></span>
      </label>
    </div>
  `;

  const input = container.querySelector("#arquivo");
  const filenameEl = container.querySelector("[data-filename]");

  if (container._uploadChangeHandler) {
    input.removeEventListener("change", container._uploadChangeHandler);
  }
  container._uploadChangeHandler = async () => {
    const file = input.files?.[0];
    if (!filenameEl) return;

    if (!file) {
      filenameEl.textContent = "";
      filenameEl.hidden = true;
      return;
    }

    filenameEl.textContent = file.name;
    filenameEl.hidden = false;

    if (container._uploadBusy) return;
    container._uploadBusy = true;
    input.disabled = true;

    try {
      await onSubmit(file);
    } finally {
      container._uploadBusy = false;
      input.disabled = false;
    }
  };
  input.addEventListener("change", container._uploadChangeHandler);
}
