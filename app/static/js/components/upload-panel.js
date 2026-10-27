import { t } from "../i18n.js";

const DOWNLOAD_ICON = `<svg class="portal-upload-dropzone__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3" />
</svg>`;

/** @param {DragEvent} e */
function arrasteTemArquivo(e) {
  const types = e.dataTransfer?.types;
  if (!types) return false;
  return [...types].includes("Files");
}

/** @param {File} file */
function arquivoCsvAceito(file) {
  if (/\.csv$/i.test(file.name)) return true;
  const type = (file.type || "").toLowerCase();
  return type === "text/csv" || type === "application/vnd.ms-excel";
}

/**
 * Formulário de upload (sem título duplicado — título fica na tela inicial).
 * @param {HTMLElement} container
 * @param {{ onSubmit: (file: File) => void | Promise<void> }} handlers
 */
export function mountUploadPanel(container, { onSubmit }) {
  container._uploadDragCleanup?.();

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
  const dropzone = container.querySelector(".portal-upload-dropzone");
  const filenameEl = container.querySelector("[data-filename]");
  const dragSurface = container.closest("#portal-home") ?? container;

  if (!(input instanceof HTMLInputElement) || !(dropzone instanceof HTMLLabelElement)) return;

  /** @param {boolean} ativo */
  function definirArrasteSobre(ativo) {
    dropzone.classList.toggle("portal-upload-dropzone--dragover", ativo);
  }

  /** @param {File | null | undefined} file */
  async function aplicarArquivoSelecionado(file) {
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
  }

  /** @param {File} file */
  async function receberArquivoArrastado(file) {
    if (!arquivoCsvAceito(file)) return;

    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    await aplicarArquivoSelecionado(file);
  }

  if (container._uploadChangeHandler) {
    input.removeEventListener("change", container._uploadChangeHandler);
  }
  container._uploadChangeHandler = () => {
    void aplicarArquivoSelecionado(input.files?.[0]);
  };
  input.addEventListener("change", container._uploadChangeHandler);

  /** @param {DragEvent} e */
  const onDragEnter = (e) => {
    if (e.currentTarget !== dragSurface || !arrasteTemArquivo(e)) return;
    e.preventDefault();
    definirArrasteSobre(true);
  };

  /** @param {DragEvent} e */
  const onDragLeave = (e) => {
    if (e.currentTarget !== dragSurface || !arrasteTemArquivo(e)) return;
    const rt = e.relatedTarget;
    if (rt instanceof Node && dragSurface.contains(rt)) return;
    definirArrasteSobre(false);
  };

  /** @param {DragEvent} e */
  const onDragOver = (e) => {
    if (!arrasteTemArquivo(e)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  };

  /** @param {DragEvent} e */
  const onDrop = (e) => {
    if (!arrasteTemArquivo(e)) return;
    e.preventDefault();
    definirArrasteSobre(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) void receberArquivoArrastado(file);
  };

  const onDragEnd = () => {
    definirArrasteSobre(false);
  };

  dragSurface.addEventListener("dragenter", onDragEnter);
  dragSurface.addEventListener("dragleave", onDragLeave);
  dragSurface.addEventListener("dragover", onDragOver);
  dragSurface.addEventListener("drop", onDrop);
  window.addEventListener("dragend", onDragEnd);

  container._uploadDragCleanup = () => {
    dragSurface.removeEventListener("dragenter", onDragEnter);
    dragSurface.removeEventListener("dragleave", onDragLeave);
    dragSurface.removeEventListener("dragover", onDragOver);
    dragSurface.removeEventListener("drop", onDrop);
    window.removeEventListener("dragend", onDragEnd);
    definirArrasteSobre(false);
  };
}
