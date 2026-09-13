export interface ParsedCurl {
  method: string;
  url: string;
  headers: { key: string; value: string }[];
  body: string | null;
}

// Tokenizes a shell command line, handling single quotes (literal, no
// escapes inside), double quotes (allows \" and \\ escapes), unquoted
// backslash-escaping, and backslash-newline line continuations (common
// when a cURL command is copy-pasted across multiple lines).
export function tokenizeShellCommand(input: string): string[] {
  const normalized = input.replace(/\\\r?\n/g, " ");
  const tokens: string[] = [];
  let current = "";
  let hasCurrent = false;
  let i = 0;

  while (i < normalized.length) {
    const char = normalized[i];

    if (char === "'") {
      hasCurrent = true;
      i++;
      while (i < normalized.length && normalized[i] !== "'") {
        current += normalized[i];
        i++;
      }
      i++; // skip closing quote
      continue;
    }

    if (char === '"') {
      hasCurrent = true;
      i++;
      while (i < normalized.length && normalized[i] !== '"') {
        if (normalized[i] === "\\" && i + 1 < normalized.length) {
          current += normalized[i + 1];
          i += 2;
        } else {
          current += normalized[i];
          i++;
        }
      }
      i++; // skip closing quote
      continue;
    }

    if (char === "\\" && i + 1 < normalized.length) {
      hasCurrent = true;
      current += normalized[i + 1];
      i += 2;
      continue;
    }

    if (/\s/.test(char)) {
      if (hasCurrent) {
        tokens.push(current);
        current = "";
        hasCurrent = false;
      }
      i++;
      continue;
    }

    hasCurrent = true;
    current += char;
    i++;
  }

  if (hasCurrent) tokens.push(current);
  return tokens;
}

export function parseCurl(input: string): ParsedCurl {
  const tokens = tokenizeShellCommand(input.trim());

  let method: string | null = null;
  const headers: { key: string; value: string }[] = [];
  let body: string | null = null;
  let url = "";

  let i = 0;
  if (tokens[i] === "curl") i++;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token === "-X" || token === "--request") {
      method = tokens[++i]?.toUpperCase() ?? method;
    } else if (token === "-H" || token === "--header") {
      const raw = tokens[++i] ?? "";
      const sep = raw.indexOf(":");
      if (sep !== -1) {
        headers.push({
          key: raw.slice(0, sep).trim(),
          value: raw.slice(sep + 1).trim(),
        });
      }
    } else if (
      token === "-d" ||
      token === "--data" ||
      token === "--data-raw" ||
      token === "--data-binary"
    ) {
      body = tokens[++i] ?? "";
      if (!method) method = "POST";
    } else if (token === "-u" || token === "--user") {
      const raw = tokens[++i] ?? "";
      headers.push({
        key: "Authorization",
        value: `Basic ${btoa(raw)}`,
      });
    } else if (token === "-A" || token === "--user-agent") {
      headers.push({ key: "User-Agent", value: tokens[++i] ?? "" });
    } else if (token === "-b" || token === "--cookie") {
      headers.push({ key: "Cookie", value: tokens[++i] ?? "" });
    } else if (
      token === "-k" ||
      token === "--insecure" ||
      token === "-s" ||
      token === "--silent" ||
      token === "-L" ||
      token === "--location" ||
      token === "-v" ||
      token === "--verbose" ||
      token === "-i" ||
      token === "--include" ||
      token === "--compressed"
    ) {
      // Flags with no value that don't affect the request shape; skip.
    } else if (!token.startsWith("-")) {
      url = token;
    }

    i++;
  }

  return {
    method: method ?? "GET",
    url,
    headers,
    body,
  };
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

export function buildCurl(request: ParsedCurl): string {
  const parts = ["curl"];

  if (request.method && request.method !== "GET") {
    parts.push("-X", request.method);
  }

  for (const h of request.headers) {
    if (!h.key) continue;
    parts.push("-H", shellQuote(`${h.key}: ${h.value}`));
  }

  if (request.body) {
    parts.push("-d", shellQuote(request.body));
  }

  if (request.url) {
    parts.push(shellQuote(request.url));
  }

  return parts.join(" ");
}
