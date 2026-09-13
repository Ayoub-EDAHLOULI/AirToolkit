export type EscapeContext = "json" | "shell" | "sql" | "regex";

export function escapeString(input: string, context: EscapeContext): string {
  switch (context) {
    case "json":
      // JSON.stringify already produces a correctly-escaped JSON string
      // literal; strip the surrounding quotes since we want just the
      // escaped body, consistent with the other contexts.
      return JSON.stringify(input).slice(1, -1);

    case "shell":
      // POSIX single-quoting: wrap in '...' and escape any embedded
      // single quote as '\'' (close quote, escaped quote, reopen quote).
      return `'${input.replace(/'/g, "'\\''")}'`;

    case "sql":
      // Standard SQL string literal escaping: double any single quote.
      return input.replace(/'/g, "''");

    case "regex":
      // Escape characters with special meaning in JS regex syntax.
      return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

export function unescapeString(input: string, context: EscapeContext): string {
  switch (context) {
    case "json":
      return JSON.parse(`"${input}"`);

    case "shell": {
      // Reverse POSIX single-quoting: strip the wrapping quotes (if
      // present) and undo the '\'' escape sequence.
      const trimmed =
        input.startsWith("'") && input.endsWith("'")
          ? input.slice(1, -1)
          : input;
      return trimmed.replace(/'\\''/g, "'");
    }

    case "sql":
      return input.replace(/''/g, "'");

    case "regex":
      return input.replace(/\\([.*+?^${}()|[\]\\])/g, "$1");
  }
}
