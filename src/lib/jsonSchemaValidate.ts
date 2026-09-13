import Ajv, { type ErrorObject } from "ajv";

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface JsonSchemaValidationResult {
  valid: boolean | null;
  issues: ValidationIssue[];
  error: string | null;
}

function formatErrors(errors: ErrorObject[] | null | undefined): ValidationIssue[] {
  if (!errors) return [];
  return errors.map((e) => ({
    path: e.instancePath || "(root)",
    message: e.message ?? "is invalid",
  }));
}

export function validateAgainstSchema(
  schemaText: string,
  dataText: string,
): JsonSchemaValidationResult {
  if (!schemaText.trim() || !dataText.trim()) {
    return { valid: null, issues: [], error: null };
  }

  let schema: unknown;
  let data: unknown;

  try {
    schema = JSON.parse(schemaText);
  } catch (err) {
    return {
      valid: null,
      issues: [],
      error: `Schema: ${(err as Error).message}`,
    };
  }

  try {
    data = JSON.parse(dataText);
  } catch (err) {
    return {
      valid: null,
      issues: [],
      error: `Data: ${(err as Error).message}`,
    };
  }

  try {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(schema as object);
    const valid = validate(data);
    return { valid, issues: formatErrors(validate.errors), error: null };
  } catch (err) {
    return {
      valid: null,
      issues: [],
      error: `Invalid schema: ${(err as Error).message}`,
    };
  }
}
