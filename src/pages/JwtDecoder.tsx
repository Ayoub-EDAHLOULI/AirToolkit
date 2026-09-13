import { useMemo, useState } from "react";
import { KeyRound, Copy, Check, Trash2 } from "lucide-react";

interface DecodedJwt {
  header: unknown;
  payload: unknown;
  signature: string;
  error: string | null;
}

const TIME_CLAIMS = new Set(["exp", "iat", "nbf"]);

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const withPadding = padded.padEnd(
    padded.length + ((4 - (padded.length % 4)) % 4),
    "=",
  );
  const binary = atob(withPadding);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function decodeJwt(token: string): DecodedJwt {
  const empty: DecodedJwt = {
    header: null,
    payload: null,
    signature: "",
    error: null,
  };
  if (!token.trim()) return empty;

  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return {
      ...empty,
      error:
        "A JWT must have three parts separated by dots (header.payload.signature).",
    };
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return { header, payload, signature: parts[2], error: null };
  } catch (err) {
    return {
      ...empty,
      error: `Failed to decode: ${(err as Error).message}`,
    };
  }
}

function formatTimestamp(value: unknown): string | null {
  if (typeof value !== "number") return null;
  const date = new Date(value * 1000);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

function JsonPanel({ title, data }: { title: string; data: unknown }) {
  const [copied, setCopied] = useState(false);
  const text = data === null ? "" : JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const entries =
    data && typeof data === "object"
      ? Object.entries(data as Record<string, unknown>)
      : [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
        <span>{title}</span>
        {text && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-subText hover:text-text transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar p-4">
        {text ? (
          <pre className="font-mono text-sm text-text whitespace-pre-wrap break-words">
            {text}
          </pre>
        ) : (
          <p className="text-sm text-subText">—</p>
        )}
        {entries.some(([key]) => TIME_CLAIMS.has(key)) && (
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-1.5">
            {entries
              .filter(([key]) => TIME_CLAIMS.has(key))
              .map(([key, value]) => {
                const formatted = formatTimestamp(value);
                return (
                  <div key={key} className="flex items-baseline gap-2 text-xs">
                    <span className="text-subText shrink-0 font-mono">
                      {key}:
                    </span>
                    <span className="text-text">
                      {formatted ?? String(value)}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JwtDecoder() {
  const [token, setToken] = useState("");

  const { header, payload, signature, error } = useMemo(
    () => decodeJwt(token),
    [token],
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-col gap-2 px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="text-primary" size={20} />
            <h2 className="font-semibold text-text">JWT Decoder</h2>
          </div>
          {token && (
            <button
              onClick={() => setToken("")}
              className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
              title="Clear"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste a JWT (header.payload.signature)..."
          spellCheck={false}
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-card p-3 font-mono text-sm text-text outline-none placeholder:text-subText"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <JsonPanel title="Header" data={header} />
        </div>
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden bg-card">
          <JsonPanel title="Payload" data={payload} />
        </div>
        <div className="w-72 flex flex-col overflow-hidden shrink-0">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Signature
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar p-4">
            {signature ? (
              <code className="font-mono text-xs text-text break-all">
                {signature}
              </code>
            ) : (
              <p className="text-sm text-subText">—</p>
            )}
            <p className="mt-4 text-xs text-subText">
              Signature is shown as-is. This tool does not verify it against a
              secret or public key.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
