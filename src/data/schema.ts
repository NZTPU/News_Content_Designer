export const REQUIRED_FIELDS = [
  "image_url",
  "category",
  "headline",
  "story_url",
  "site_url",
  "logo_url",
] as const;

export type RequiredField = (typeof REQUIRED_FIELDS)[number];

export type DataRow = Record<string, string> &
  Record<RequiredField, string>;

export type ValidationError = {
  rowIndex: number;
  field: string;
  message: string;
};

const URL_FIELDS = new Set<RequiredField>([
  "image_url",
  "story_url",
  "site_url",
  "logo_url",
]);

export const isRequiredField = (field: string): field is RequiredField =>
  REQUIRED_FIELDS.includes(field as RequiredField);

export const validateRow = (row: Record<string, string>, rowIndex: number) => {
  const errors: ValidationError[] = [];

  REQUIRED_FIELDS.forEach((field) => {
    const value = row[field]?.trim();
    if (!value) {
      errors.push({
        rowIndex,
        field,
        message: `Missing required field: ${field}`,
      });
      return;
    }

    if (URL_FIELDS.has(field)) {
      try {
        new URL(value);
      } catch (error) {
        errors.push({
          rowIndex,
          field,
          message: `Invalid URL for ${field}: ${value}`,
        });
      }
    }
  });

  return errors;
};
