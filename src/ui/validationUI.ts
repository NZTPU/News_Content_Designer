import { ValidationError } from "../data/schema";

export const renderValidationErrors = (
  container: HTMLElement,
  errors: ValidationError[],
) => {
  container.innerHTML = "";

  if (errors.length === 0) {
    const success = document.createElement("p");
    success.textContent = "No validation errors found.";
    success.dataset.status = "success";
    container.appendChild(success);
    return;
  }

  const heading = document.createElement("h3");
  heading.textContent = "Validation Errors";
  container.appendChild(heading);

  const list = document.createElement("ul");
  errors.forEach((error) => {
    const item = document.createElement("li");
    const rowLabel = error.rowIndex === 0 ? "Header" : `Row ${error.rowIndex}`;
    item.textContent = `${rowLabel}: ${error.message}`;
    list.appendChild(item);
  });
  container.appendChild(list);
};
