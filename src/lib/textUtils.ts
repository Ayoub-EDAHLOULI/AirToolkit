export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
}

export function computeStats(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split("\n").length : 0;

  return { characters, charactersNoSpaces, words, lines };
}

export function sortLines(text: string, descending = false): string {
  const lines = text.split("\n");
  lines.sort((a, b) => (descending ? b.localeCompare(a) : a.localeCompare(b)));
  return lines.join("\n");
}

export function deduplicateLines(text: string): string {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of text.split("\n")) {
    if (!seen.has(line)) {
      seen.add(line);
      result.push(line);
    }
  }
  return result.join("\n");
}

export function removeEmptyLines(text: string): string {
  return text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");
}

export function trimLines(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
}

export function normalizeLineEndings(
  text: string,
  style: "lf" | "crlf",
): string {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return style === "crlf" ? normalized.replace(/\n/g, "\r\n") : normalized;
}

export function collapseWhitespace(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n");
}
