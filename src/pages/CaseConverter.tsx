import { useMemo, useState } from "react";
import { CaseSensitive, Copy, Check, Trash2 } from "lucide-react";
import { CASE_STYLES } from "../lib/caseConvert";

function ResultRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
      <span className="w-32 shrink-0 text-xs font-semibold text-subText">
        {label}
      </span>
      <code className="flex-1 font-mono text-sm text-text break-all">
        {value || "—"}
      </code>
      {value && (
        <button
          onClick={handleCopy}
          className="shrink-0 p-1.5 rounded-lg text-subText hover:bg-inputBg hover:text-text transition-colors"
          title="Copy"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}
    </div>
  );
}

export default function CaseConverter() {
  const [input, setInput] = useState("");

  const results = useMemo(
    () =>
      CASE_STYLES.map((style) => ({
        ...style,
        value: input ? style.convert(input) : "",
      })),
    [input],
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <CaseSensitive className="text-primary" size={20} />
          <h2 className="font-semibold text-text">Case Converter</h2>
        </div>
        <button
          onClick={() => setInput("")}
          className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
          title="Clear"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Input
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to convert..."
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Results
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
            {results.map((r) => (
              <ResultRow key={r.key} label={r.label} value={r.value} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
