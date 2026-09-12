export interface DotenvEntry {
  key: string;
  value: string;
  line: number;
}

export interface DotenvParseResult {
  entries: Map<string, DotenvEntry>;
  duplicateKeys: string[];
}

// Parses KEY=value lines, tolerating comments (#...), blank lines, and
// both quoted and unquoted values. Not a full dotenv spec implementation
// (no multiline values, no variable expansion) — enough for comparing
// and validating typical .env files.
export function parseDotenv(text: string): DotenvParseResult {
  const entries = new Map<string, DotenvEntry>();
  const seen = new Set<string>();
  const duplicateKeys: string[] = [];

  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    if (!key) continue;

    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (seen.has(key)) {
      duplicateKeys.push(key);
    }
    seen.add(key);
    entries.set(key, { key, value, line: i + 1 });
  }

  return { entries, duplicateKeys };
}

export interface DotenvComparison {
  onlyInA: DotenvEntry[];
  onlyInB: DotenvEntry[];
  differentValues: { key: string; valueA: string; valueB: string }[];
  emptyInA: DotenvEntry[];
  emptyInB: DotenvEntry[];
  duplicatesInA: string[];
  duplicatesInB: string[];
}

export function compareDotenv(textA: string, textB: string): DotenvComparison {
  const a = parseDotenv(textA);
  const b = parseDotenv(textB);

  const onlyInA: DotenvEntry[] = [];
  const onlyInB: DotenvEntry[] = [];
  const differentValues: DotenvComparison["differentValues"] = [];

  for (const [key, entryA] of a.entries) {
    const entryB = b.entries.get(key);
    if (!entryB) {
      onlyInA.push(entryA);
    } else if (entryA.value !== entryB.value) {
      differentValues.push({
        key,
        valueA: entryA.value,
        valueB: entryB.value,
      });
    }
  }

  for (const [key, entryB] of b.entries) {
    if (!a.entries.has(key)) onlyInB.push(entryB);
  }

  const emptyInA = Array.from(a.entries.values()).filter((e) => e.value === "");
  const emptyInB = Array.from(b.entries.values()).filter((e) => e.value === "");

  return {
    onlyInA,
    onlyInB,
    differentValues,
    emptyInA,
    emptyInB,
    duplicatesInA: a.duplicateKeys,
    duplicatesInB: b.duplicateKeys,
  };
}
