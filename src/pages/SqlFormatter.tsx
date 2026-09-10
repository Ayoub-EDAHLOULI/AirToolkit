import { useMemo, useState } from "react";
import { Database, Copy, Check, Trash2 } from "lucide-react";
import { format, type SqlLanguage } from "sql-formatter";

const DIALECTS: { key: SqlLanguage; label: string }[] = [
  { key: "postgresql", label: "PostgreSQL" },
  { key: "mysql", label: "MySQL" },
  { key: "sqlite", label: "SQLite" },
  { key: "transactsql", label: "SQL Server" },
  { key: "sql", label: "Standard SQL" },
];

type KeywordCase = "preserve" | "upper" | "lower";

function formatSql(
  input: string,
  language: SqlLanguage,
  keywordCase: KeywordCase,
): { output: string; error: string | null } {
  if (!input.trim()) return { output: "", error: null };

  try {
    const output = format(input, { language, keywordCase, tabWidth: 2 });
    return { output, error: null };
  } catch (err) {
    return { output: "", error: (err as Error).message };
  }
}

export default function SqlFormatter() {
  const [raw, setRaw] = useState("");
  const [language, setLanguage] = useState<SqlLanguage>("postgresql");
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(
    () => formatSql(raw, language, keywordCase),
    [raw, language, keywordCase],
  );

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Database className="text-primary" size={20} />
          <h2 className="font-semibold text-text">SQL Formatter</h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SqlLanguage)}
            className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-text outline-none"
          >
            {DIALECTS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>

          <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
            {(["upper", "lower", "preserve"] as KeywordCase[]).map((c) => (
              <button
                key={c}
                onClick={() => setKeywordCase(c)}
                className={`px-3 py-1.5 transition-colors capitalize ${
                  keywordCase === c
                    ? "bg-primary text-white"
                    : "text-subText hover:bg-inputBg"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={() => setRaw("")}
            className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
            title="Clear"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Input
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Paste your SQL here..."
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            <span>Output</span>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-subText hover:text-text transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            {error ? (
              <div className="p-4 text-sm text-danger font-mono whitespace-pre-wrap">
                {error}
              </div>
            ) : (
              <pre className="p-4 font-mono text-sm text-text whitespace-pre-wrap break-words">
                {output}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
