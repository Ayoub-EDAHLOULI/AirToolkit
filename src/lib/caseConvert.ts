// Splits any reasonably-cased input (camelCase, PascalCase, snake_case,
// kebab-case, CONSTANT_CASE, "Title Case", "Sentence case", mixed) into
// lowercase words, so any single style can be converted to any other.
export function splitWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[_\-.]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

export function toUpperCase(input: string): string {
  return input.toUpperCase();
}

export function toLowerCase(input: string): string {
  return input.toLowerCase();
}

export function toTitleCase(input: string): string {
  return splitWords(input)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function toSentenceCase(input: string): string {
  const words = splitWords(input);
  if (words.length === 0) return "";
  return (
    words[0].charAt(0).toUpperCase() + words[0].slice(1) + " " + words.slice(1).join(" ")
  ).trim();
}

export function toCamelCase(input: string): string {
  const words = splitWords(input);
  return words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

export function toPascalCase(input: string): string {
  return splitWords(input)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export function toSnakeCase(input: string): string {
  return splitWords(input).join("_");
}

export function toKebabCase(input: string): string {
  return splitWords(input).join("-");
}

export function toConstantCase(input: string): string {
  return splitWords(input).join("_").toUpperCase();
}

export interface CaseStyle {
  key: string;
  label: string;
  convert: (input: string) => string;
}

export const CASE_STYLES: CaseStyle[] = [
  { key: "upper", label: "UPPERCASE", convert: toUpperCase },
  { key: "lower", label: "lowercase", convert: toLowerCase },
  { key: "title", label: "Title Case", convert: toTitleCase },
  { key: "sentence", label: "Sentence case", convert: toSentenceCase },
  { key: "camel", label: "camelCase", convert: toCamelCase },
  { key: "pascal", label: "PascalCase", convert: toPascalCase },
  { key: "snake", label: "snake_case", convert: toSnakeCase },
  { key: "kebab", label: "kebab-case", convert: toKebabCase },
  { key: "constant", label: "CONSTANT_CASE", convert: toConstantCase },
];
