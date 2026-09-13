import { useMemo, useState } from "react";
import { SquareTerminal, Plus, Trash2, Copy, Check } from "lucide-react";
import { parseCurl, buildCurl, type ParsedCurl } from "../lib/curl";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"] as const;

interface HeaderRow {
  id: number;
  key: string;
  value: string;
}

let nextId = 1;

function toHeaderRows(headers: ParsedCurl["headers"]): HeaderRow[] {
  return headers.map((h) => ({ id: nextId++, key: h.key, value: h.value }));
}

export default function CurlBuilder() {
  const [curlInput, setCurlInput] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<HeaderRow[]>([
    { id: nextId++, key: "", value: "" },
  ]);
  const [body, setBody] = useState("");

  const handleParse = (value: string) => {
    setCurlInput(value);
    if (!value.trim()) {
      setParseError(null);
      return;
    }
    try {
      const parsed = parseCurl(value);
      setMethod(parsed.method);
      setUrl(parsed.url);
      setHeaders(
        parsed.headers.length > 0
          ? toHeaderRows(parsed.headers)
          : [{ id: nextId++, key: "", value: "" }],
      );
      setBody(parsed.body ?? "");
      setParseError(null);
    } catch (err) {
      setParseError((err as Error).message);
    }
  };

  const addHeader = () => {
    setHeaders((h) => [...h, { id: nextId++, key: "", value: "" }]);
  };

  const updateHeader = (id: number, field: "key" | "value", value: string) => {
    setHeaders((h) =>
      h.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removeHeader = (id: number) => {
    setHeaders((h) => h.filter((row) => row.id !== id));
  };

  const generatedCurl = useMemo(() => {
    if (!url.trim()) return "";
    return buildCurl({
      method,
      url,
      headers: headers.filter((h) => h.key.trim()),
      body: body || null,
    });
  }, [method, url, headers, body]);

  const handleCopyCurl = async () => {
    if (!generatedCurl) return;
    await navigator.clipboard.writeText(generatedCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 1500);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <SquareTerminal className="text-primary" size={20} />
        <h2 className="font-semibold text-text">cURL ↔ Request Builder</h2>
      </div>

      <div className="px-6 py-3 border-b border-border shrink-0 flex flex-col gap-2">
        <label className="text-xs font-medium text-subText">
          Paste a cURL command to parse it into fields
        </label>
        <textarea
          value={curlInput}
          onChange={(e) => handleParse(e.target.value)}
          placeholder={`curl -X POST 'https://api.example.com/users' -H 'Content-Type: application/json' -d '{"name":"test"}'`}
          spellCheck={false}
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-card p-3 font-mono text-sm text-text outline-none placeholder:text-subText"
        />
        {parseError && <p className="text-sm text-danger">{parseError}</p>}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
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
              placeholder="https://api.example.com/resource"
              spellCheck={false}
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-text outline-none placeholder:text-subText"
            />
          </div>

          <div className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-subText">Body</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              spellCheck={false}
              rows={6}
              className="w-full resize-none rounded-lg border border-border bg-card p-3 font-mono text-sm text-text outline-none placeholder:text-subText"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-subText">
                Generated cURL
              </span>
              {generatedCurl && (
                <button
                  onClick={handleCopyCurl}
                  className="flex items-center gap-1 text-xs text-subText hover:text-text transition-colors"
                >
                  {copiedCurl ? <Check size={12} /> : <Copy size={12} />}
                  {copiedCurl ? "Copied" : "Copy"}
                </button>
              )}
            </div>
            <pre className="rounded-lg border border-border bg-card p-3 font-mono text-sm text-text whitespace-pre-wrap break-words">
              {generatedCurl || "—"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
