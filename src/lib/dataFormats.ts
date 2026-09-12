import { load as yamlLoad, dump as yamlDump } from "js-yaml";
import * as toml from "@iarna/toml";

export type DataFormat = "json" | "yaml" | "toml";

export function parseFormat(text: string, format: DataFormat): unknown {
  switch (format) {
    case "json":
      return JSON.parse(text);
    case "yaml":
      return yamlLoad(text);
    case "toml":
      return toml.parse(text);
  }
}

export function stringifyFormat(value: unknown, format: DataFormat): string {
  switch (format) {
    case "json":
      return JSON.stringify(value, null, 2);
    case "yaml":
      return yamlDump(value);
    case "toml":
      if (
        value === null ||
        typeof value !== "object" ||
        Array.isArray(value)
      ) {
        throw new Error(
          "TOML only supports objects at the top level (not arrays or plain values).",
        );
      }
      return toml.stringify(value as toml.JsonMap);
  }
}

export function convert(
  text: string,
  from: DataFormat,
  to: DataFormat,
): { output: string; error: string | null } {
  if (!text.trim()) return { output: "", error: null };

  try {
    const parsed = parseFormat(text, from);
    const output = stringifyFormat(parsed, to);
    return { output, error: null };
  } catch (err) {
    return { output: "", error: (err as Error).message };
  }
}
