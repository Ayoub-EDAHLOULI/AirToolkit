import { useMemo, useState } from "react";
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Globe,
  ListTree,
  X,
} from "lucide-react";
import { fetch } from "@tauri-apps/plugin-http";
import { HTTP_STATUS_CODES } from "../lib/httpStatusCodes";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"] as const;
type Method = (typeof METHODS)[number];

interface HeaderRow {
  id: number;
  key: string;
  value: string;
}

interface ResponseInfo {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
  durationMs: number;
  isJson: boolean;
}

let nextHeaderId = 1;

function tryPrettyJson(text: string): { pretty: string; isJson: boolean } {
  try {
    const parsed = JSON.parse(text);
    return { pretty: JSON.stringify(parsed, null, 2), isJson: true };
  } catch {
    return { pretty: text, isJson: false };
  }
}

export default function ApiTester() {
  const [method, setMethod] = useState<Method>("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<HeaderRow[]>([
    { id: nextHeaderId++, key: "", value: "" },
  ]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ResponseInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showStatusCodes, setShowStatusCodes] = useState(false);
  const [statusQuery, setStatusQuery] = useState("");

  const filteredStatusCodes = useMemo(() => {
    const q = statusQuery.trim().toLowerCase();
    if (!q) return HTTP_STATUS_CODES;
    return HTTP_STATUS_CODES.filter(
      (s) =>
        String(s.code).includes(q) ||
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [statusQuery]);

  const hasBody = method === "POST" || method === "PUT" || method === "PATCH";

  const addHeader = () => {
    setHeaders((h) => [...h, { id: nextHeaderId++, key: "", value: "" }]);
  };

  const updateHeader = (id: number, field: "key" | "value", value: string) => {
    setHeaders((h) =>
      h.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removeHeader = (id: number) => {
    setHeaders((h) => h.filter((row) => row.id !== id));
  };

  const send = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResponse(null);

    const headerEntries = headers.filter((h) => h.key.trim());
    const headerInit: Record<string, string> = {};
    for (const h of headerEntries) headerInit[h.key] = h.value;

    const started = performance.now();

    try {
      const res = await fetch(url, {
        method,
        headers: headerInit,
        body: hasBody && body ? body : undefined,
      });
      const durationMs = performance.now() - started;

      const text = await res.text();
      const { pretty, isJson } = tryPrettyJson(text);

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Array.from(res.headers.entries()),
        body: pretty,
        durationMs,
        isJson,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : JSON.stringify(err);
      setError(message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBody = async () => {
    if (!response) return;
    await navigator.clipboard.writeText(response.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const statusColor = useMemo(() => {
    if (!response) return "";
    if (response.status >= 200 && response.status < 300)
      return "text-[color:var(--diff-add-text)]";
    if (response.status >= 400) return "text-danger";
    return "text-subText";
  }, [response]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="text-primary" size={20} />
          <h2 className="font-semibold text-text">API Request Tester</h2>
        </div>
        <button
          onClick={() => setShowStatusCodes((s) => !s)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border transition-colors ${
            showStatusCodes
              ? "bg-primary text-white border-primary"
              : "text-subText hover:bg-inputBg"
          }`}
        >
          <ListTree size={14} />
          Status Codes
        </button>
      </div>

      <div className="px-6 py-3 border-b border-border shrink-0">
        <p className="text-xs text-subText">
          This tool sends the request you compose, on demand, to a host you
          specify — it does not call anything on its own. AirToolkit itself
          still makes zero unsolicited network calls.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-border overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as Method)}
              className="rounded-lg border border-border bg-card px-2 py-2 text-sm font-medium text-text outline-none"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8080/api/health"
              spellCheck={false}
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-text outline-none placeholder:text-subText"
            />
            <button
              onClick={send}
              disabled={loading || !url.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Send size={14} />
              {loading ? "Sending..." : "Send"}
            </button>
          </div>

          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-subText">Headers</span>
              <button
                onClick={addHeader}
                className="flex items-center gap-1 text-xs text-subText hover:text-text transition-colors"
              >
                <Plus size={12} />
                Add
              </button>
            </div>
            {headers.map((h) => (
              <div key={h.id} className="flex items-center gap-2">
                <input
                  value={h.key}
                  onChange={(e) => updateHeader(h.id, "key", e.target.value)}
                  placeholder="Header name"
                  spellCheck={false}
                  className="flex-1 rounded-lg border border-border bg-card px-2 py-1.5 font-mono text-xs text-text outline-none placeholder:text-subText"
                />
                <input
                  value={h.value}
                  onChange={(e) => updateHeader(h.id, "value", e.target.value)}
                  placeholder="Value"
                  spellCheck={false}
                  className="flex-1 rounded-lg border border-border bg-card px-2 py-1.5 font-mono text-xs text-text outline-none placeholder:text-subText"
                />
                <button
                  onClick={() => removeHeader(h.id)}
                  className="shrink-0 p-1.5 rounded-lg text-subText hover:bg-inputBg hover:text-text transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {hasBody && (
            <div className="p-4 border-t border-border flex flex-col gap-2">
              <span className="text-xs font-medium text-subText">Body</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                spellCheck={false}
                rows={8}
                className="w-full resize-none rounded-lg border border-border bg-card p-3 font-mono text-sm text-text outline-none placeholder:text-subText"
              />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Response
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {error && (
              <div className="p-4 text-sm text-danger font-mono whitespace-pre-wrap">
                {error}
              </div>
            )}

            {!error && !response && (
              <p className="p-4 text-sm text-subText">
                Send a request to see the response here.
              </p>
            )}

            {response && (
              <>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <span className={`text-sm font-semibold ${statusColor}`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-xs text-subText">
                    {response.durationMs.toFixed(0)} ms
                  </span>
                </div>

                {response.headers.length > 0 && (
                  <div className="px-4 py-3 border-b border-border">
                    <span className="text-xs font-medium text-subText">
                      Headers
                    </span>
                    <div className="mt-2 flex flex-col gap-1">
                      {response.headers.map(([key, value]) => (
                        <div key={key} className="text-xs font-mono">
                          <span className="text-subText">{key}: </span>
                          <span className="text-text">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs font-medium text-subText">Body</span>
                  <button
                    onClick={handleCopyBody}
                    className="flex items-center gap-1 text-xs text-subText hover:text-text transition-colors"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="px-4 pb-4 font-mono text-sm text-text whitespace-pre-wrap break-words">
                  {response.body}
                </pre>
              </>
            )}
          </div>
        </div>

        {showStatusCodes && (
          <div className="w-80 flex flex-col overflow-hidden border-l border-border shrink-0 bg-card">
            <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
              <span>HTTP Status Codes</span>
              <button
                onClick={() => setShowStatusCodes(false)}
                className="text-subText hover:text-text transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-3 border-b border-border shrink-0">
              <input
                value={statusQuery}
                onChange={(e) => setStatusQuery(e.target.value)}
                placeholder="Search code, name, or description..."
                spellCheck={false}
                className="w-full rounded-lg border border-border bg-inputBg px-3 py-1.5 text-sm text-text outline-none placeholder:text-subText"
              />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1">
              {filteredStatusCodes.length === 0 ? (
                <p className="text-sm text-subText px-2">No matches.</p>
              ) : (
                filteredStatusCodes.map((s) => (
                  <div
                    key={s.code}
                    className="rounded-lg px-2 py-1.5 hover:bg-inputBg"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-sm font-semibold text-primary">
                        {s.code}
                      </span>
                      <span className="text-sm font-medium text-text">
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-subText">{s.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
