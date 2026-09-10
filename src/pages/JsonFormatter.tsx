import { useMemo, useState } from "react";
import { Braces, Copy, Check, Trash2 } from "lucide-react";

type IndentSize = 2 | 4;

function formatJson(
  raw: string,
  indent: IndentSize,
  minify: boolean,
): { output: string; error: string | null } {
  if (!raw.trim()) return { output: "", error: null };

  try {
    const parsed = JSON.parse(raw);
    const output = minify
      ? JSON.stringify(parsed)
      : JSON.stringify(parsed, null, indent);
    return { output, error: null };
  } catch (err) {
    return { output: "", error: (err as Error).message };
  }
}

export default function JsonFormatter() {
  const [raw, setRaw] = useState("");
  const [indent, setIndent] = useState<IndentSize>(2);
  const [minify, setMinify] = useState(false);
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(
    () => formatJson(raw, indent, minify),
    [raw, indent, minify],
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
          <Braces className="text-primary" size={20} />
          <h2 className="font-semibold text-text">JSON Formatter</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
            {([2, 4] as IndentSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setIndent(size)}
                disabled={minify}
                className={`px-3 py-1.5 transition-colors disabled:opacity-40 ${
                  indent === size && !minify
                    ? "bg-primary text-white"
                    : "text-subText hover:bg-inputBg"
                }`}
              >
                {size} spaces
              </button>
            ))}
          </div>

          <button
            onClick={() => setMinify((m) => !m)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border border-border transition-colors ${
              minify
                ? "bg-primary text-white border-primary"
                : "text-subText hover:bg-inputBg"
            }`}
          >
            Minify
          </button>

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
            placeholder="Paste your JSON here..."
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
