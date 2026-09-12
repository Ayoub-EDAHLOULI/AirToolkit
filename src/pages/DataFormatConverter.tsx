import { useMemo, useState } from "react";
import { FileJson2, Copy, Check, Trash2, ArrowRight } from "lucide-react";
import { convert, type DataFormat } from "../lib/dataFormats";

const FORMATS: { key: DataFormat; label: string }[] = [
  { key: "json", label: "JSON" },
  { key: "yaml", label: "YAML" },
  { key: "toml", label: "TOML" },
];

export default function DataFormatConverter() {
  const [input, setInput] = useState("");
  const [from, setFrom] = useState<DataFormat>("json");
  const [to, setTo] = useState<DataFormat>("yaml");
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(
    () => convert(input, from, to),
    [input, from, to],
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
          <FileJson2 className="text-primary" size={20} />
          <h2 className="font-semibold text-text">JSON ↔ YAML / TOML</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
            {FORMATS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFrom(f.key)}
                className={`px-3 py-1.5 transition-colors ${
                  from === f.key
                    ? "bg-primary text-white"
                    : "text-subText hover:bg-inputBg"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <ArrowRight size={14} className="text-subText" />

          <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
            {FORMATS.map((f) => (
              <button
                key={f.key}
                onClick={() => setTo(f.key)}
                className={`px-3 py-1.5 transition-colors ${
                  to === f.key
                    ? "bg-primary text-white"
                    : "text-subText hover:bg-inputBg"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setInput("")}
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
            Input ({FORMATS.find((f) => f.key === from)?.label})
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste ${from.toUpperCase()} here...`}
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            <span>Output ({FORMATS.find((f) => f.key === to)?.label})</span>
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
