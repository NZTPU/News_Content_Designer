import { fetchGoogleSheetCsv, loadCsvFile } from "./data/loadData";
import { renderValidationErrors } from "./ui/validationUI";

const fileInput = document.querySelector<HTMLInputElement>("#csv-file");
const sheetForm = document.querySelector<HTMLFormElement>("#sheet-form");
const sheetInput = document.querySelector<HTMLInputElement>("#sheet-url");
const errorContainer = document.querySelector<HTMLElement>("#validation-errors");

const setStatus = (message: string) => {
  if (!errorContainer) {
    return;
  }

  const status = document.createElement("p");
  status.textContent = message;
  status.dataset.status = "info";
  errorContainer.innerHTML = "";
  errorContainer.appendChild(status);
};

if (fileInput && errorContainer) {
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) {
      return;
    }

    setStatus("Parsing CSV file...");
    const result = await loadCsvFile(file);
    renderValidationErrors(errorContainer, result.errors);
  });
}

if (sheetForm && sheetInput && errorContainer) {
  sheetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const url = sheetInput.value.trim();
    if (!url) {
      return;
    }

    setStatus("Fetching Google Sheet...");
    try {
      const result = await fetchGoogleSheetCsv(url);
      renderValidationErrors(errorContainer, result.errors);
    } catch (error) {
      renderValidationErrors(errorContainer, [
        {
          rowIndex: 0,
          field: "sheet_url",
          message: error instanceof Error ? error.message : "Failed to load sheet",
        },
      ]);
    }
  });
}
