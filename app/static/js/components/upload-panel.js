/**
 * Monta o card de upload e dispara callbacks no submit.
 * @param {HTMLElement} container
 * @param {{ onSubmit: (file: File) => void | Promise<void> }} handlers
 */
export function mountUploadPanel(container, { onSubmit }) {
  container.innerHTML = `
    <section class="panel">
      <h2 class="text-lg font-semibold text-slate-900">Enviar lote</h2>
      <p class="mt-1 text-sm text-slate-500">Formato: separador ;, datas dd/mm/aaaa.</p>
      <form id="form-upload" class="mt-4 space-y-4">
        <div>
          <label for="arquivo" class="mb-1 block text-sm font-medium text-slate-700">Arquivo CSV</label>
          <input type="file" class="input-file" id="arquivo" name="arquivo" accept=".csv" required />
        </div>
        <button type="submit" class="btn-primary w-full sm:w-auto">Validar</button>
      </form>
    </section>
  `;

  const form = container.querySelector("#form-upload");
  const input = container.querySelector("#arquivo");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!input.files.length) return;
    await onSubmit(input.files[0]);
  });
}
