export type JsonDiffOp = "added" | "removed" | "changed" | "unchanged";

export interface JsonDiffEntry {
  path: string;
  op: JsonDiffOp;
  oldValue?: unknown;
  newValue?: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}

function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return JSON.stringify(value);
  return JSON.stringify(value);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;

  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((k) => deepEqual(a[k], b[k]));
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }

  return false;
}

function diffValues(
  path: string,
  a: unknown,
  b: unknown,
  entries: JsonDiffEntry[],
): void {
  if (a === undefined && b !== undefined) {
    entries.push({ path, op: "added", newValue: b });
    return;
  }
  if (a !== undefined && b === undefined) {
    entries.push({ path, op: "removed", oldValue: a });
    return;
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of Array.from(keys).sort()) {
      diffValues(path ? `${path}.${key}` : key, a[key], b[key], entries);
    }
    return;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLength = Math.max(a.length, b.length);
    for (let i = 0; i < maxLength; i++) {
      diffValues(`${path}[${i}]`, a[i], b[i], entries);
    }
    return;
  }

  if (deepEqual(a, b)) {
    entries.push({ path, op: "unchanged", oldValue: a, newValue: b });
  } else {
    entries.push({ path, op: "changed", oldValue: a, newValue: b });
  }
}

export interface JsonDiffResult {
  entries: JsonDiffEntry[];
  error: string | null;
}

export function diffJson(textA: string, textB: string): JsonDiffResult {
  if (!textA.trim() && !textB.trim()) return { entries: [], error: null };

  let a: unknown;
  let b: unknown;

  try {
    a = textA.trim() ? JSON.parse(textA) : undefined;
  } catch (err) {
    return { entries: [], error: `Left side: ${(err as Error).message}` };
  }

  try {
    b = textB.trim() ? JSON.parse(textB) : undefined;
  } catch (err) {
    return { entries: [], error: `Right side: ${(err as Error).message}` };
  }

  const entries: JsonDiffEntry[] = [];
  diffValues("", a, b, entries);

  return { entries: entries.filter((e) => e.op !== "unchanged"), error: null };
}

export { formatValue };
