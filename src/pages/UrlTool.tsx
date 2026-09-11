import { useMemo, useState } from "react";
import { Link2, Plus, Trash2, Copy, Check } from "lucide-react";

interface ParamRow {
  id: number;
  key: string;
  value: string;
}

let nextParamId = 1;

function paramsFromSearch(search: string): ParamRow[] {
  const params = new URLSearchParams(search);
  const rows: ParamRow[] = [];
  params.forEach((value, key) => {
    rows.push({ id: nextParamId++, key, value });
  });
  return rows;
}

function buildSearch(rows: ParamRow[]): string {
  const params = new URLSearchParams();
  for (const row of rows) {
    if (row.key) params.append(row.key, row.value);
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-subText">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-text outline-none placeholder:text-subText"
      />
    </div>
  );
}

export default function UrlTool() {
  const [rawUrl, setRawUrl] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);

  const [protocol, setProtocol] = useState("https:");
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState("");
  const [pathname, setPathname] = useState("");
  const [hash, setHash] = useState("");
  const [params, setParams] = useState<ParamRow[]>([]);
  const [copied, setCopied] = useState(false);

  const handleParse = (value: string) => {
    setRawUrl(value);
    if (!value.trim()) {
      setParseError(null);
      return;
    }
    try {
      const parsed = new URL(value);
      setProtocol(parsed.protocol);
      setHostname(parsed.hostname);
      setPort(parsed.port);
      setPathname(parsed.pathname);
      setHash(parsed.hash);
      setParams(paramsFromSearch(parsed.search));
      setParseError(null);
    } catch {
      setParseError("Not a valid URL.");
    }
  };

  const builtUrl = useMemo(() => {
    if (!hostname) return "";
    const portPart = port ? `:${port}` : "";
    const pathPart = pathname
      ? pathname.startsWith("/")
        ? pathname
        : `/${pathname}`
      : "";
    const hashPart = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
    return `${protocol}//${hostname}${portPart}${pathPart}${buildSearch(params)}${hashPart}`;
  }, [protocol, hostname, port, pathname, params, hash]);

  const addParam = () => {
    setParams((p) => [...p, { id: nextParamId++, key: "", value: "" }]);
  };

  const updateParam = (id: number, field: "key" | "value", value: string) => {
    setParams((p) =>
      p.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removeParam = (id: number) => {
    setParams((p) => p.filter((row) => row.id !== id));
  };

  const handleCopy = async () => {
    if (!builtUrl) return;
    await navigator.clipboard.writeText(builtUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <Link2 className="text-primary" size={20} />
        <h2 className="font-semibold text-text">URL Parser / Builder</h2>
      </div>

      <div className="px-6 py-3 border-b border-border shrink-0 flex flex-col gap-2">
        <label className="text-xs font-medium text-subText">
          Paste a URL to parse it into fields
        </label>
        <input
          value={rawUrl}
          onChange={(e) => handleParse(e.target.value)}
          placeholder="https://example.com:8080/path/to/page?a=1&b=2#section"
          spellCheck={false}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-text outline-none placeholder:text-subText"
        />
        {parseError && <p className="text-sm text-danger">{parseError}</p>}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-xl flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Protocol"
              value={protocol}
              onChange={setProtocol}
              placeholder="https:"
            />
            <Field
              label="Port"
              value={port}
              onChange={setPort}
              placeholder="(default)"
            />
          </div>

          <Field
            label="Hostname"
            value={hostname}
            onChange={setHostname}
            placeholder="example.com"
          />

          <Field
            label="Path"
            value={pathname}
            onChange={setPathname}
            placeholder="/path/to/page"
          />

          <Field
            label="Hash / Fragment"
            value={hash}
            onChange={setHash}
            placeholder="#section"
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-subText">
                Query Parameters
              </span>
              <button
                onClick={addParam}
                className="flex items-center gap-1 text-xs text-subText hover:text-text transition-colors"
              >
                <Plus size={12} />
                Add
              </button>
            </div>
            {params.map((row) => (
              <div key={row.id} className="flex items-center gap-2">
                <input
                  value={row.key}
                  onChange={(e) => updateParam(row.id, "key", e.target.value)}
                  placeholder="key"
                  spellCheck={false}
                  className="flex-1 rounded-lg border border-border bg-card px-2 py-1.5 font-mono text-xs text-text outline-none placeholder:text-subText"
                />
                <input
                  value={row.value}
                  onChange={(e) => updateParam(row.id, "value", e.target.value)}
                  placeholder="value"
                  spellCheck={false}
                  className="flex-1 rounded-lg border border-border bg-card px-2 py-1.5 font-mono text-xs text-text outline-none placeholder:text-subText"
                />
                <button
                  onClick={() => removeParam(row.id)}
                  className="shrink-0 p-1.5 rounded-lg text-subText hover:bg-inputBg hover:text-text transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-subText">Built URL</span>
            {builtUrl ? (
              <div className="rounded-lg border border-border bg-card p-3 flex items-center justify-between gap-2">
                <code className="text-sm text-text font-mono break-all">
                  {builtUrl}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 p-1.5 rounded-lg text-subText hover:bg-inputBg hover:text-text transition-colors"
                  title="Copy"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ) : (
              <p className="text-sm text-subText">
                Enter a hostname to build a URL.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
