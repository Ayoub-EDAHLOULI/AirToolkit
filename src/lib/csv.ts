export interface CsvResult {
  rows: string[][];
  error: string | null;
}

// RFC 4180-style parser: handles quoted fields, escaped quotes ("") inside
// quoted fields, embedded newlines/delimiters inside quotes, and a
// configurable delimiter.
export function parseCsv(input: string, delimiter: string): CsvResult {
  if (!input.trim()) return { rows: [], error: null };
  if (!delimiter) delimiter = ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  try {
    while (i < input.length) {
      const char = input[i];

      if (inQuotes) {
        if (char === '"') {
          if (input[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        field += char;
        i++;
        continue;
      }

      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      }

      if (char === delimiter) {
        row.push(field);
        field = "";
        i++;
        continue;
      }

      if (char === "\r") {
        i++;
        continue;
      }

      if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        i++;
        continue;
      }

      field += char;
      i++;
    }

    if (inQuotes) {
      throw new Error("Unterminated quoted field.");
    }

    row.push(field);
    rows.push(row);

    return { rows, error: null };
  } catch (err) {
    return { rows: [], error: (err as Error).message };
  }
}
