import { useMemo, useState } from "react";
import { SquareCode, Copy, Check, Trash2, ArrowLeftRight } from "lucide-react";
import {
  escapeString,
  unescapeString,
  type EscapeContext,
} from "../lib/stringEscape";

const CONTEXTS: { key: EscapeContext; label: string }[] = [
  { key: "json", label: "JSON" },
  { key: "shell", label: "Shell" },
  { key: "sql", label: "SQL" },
  { key: "regex", label: "Regex" },
];

type Direction = "escape" | "unescape";

function transform(
  input: string,
  context: EscapeContext,
  direction: Direction,
): { output: string; error: string | null } {
  if (!input) return { output: "", error: null };

  try {
    const output =
      direction === "escape"
        ? escapeString(input, context)
        : unescapeString(input, context);
    return { output, error: null };
  } catch (err) {
    return { output: "", error: (err as Error).message };
  }
}

export default function StringEscape() {
  const [input, setInput] = useState("");
  const [context, setContext] = useState<EscapeContext>("json");
  const [direction, setDirection] = useState<Direction>("escape");
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(
    () => transform(input, context, direction),
    [input, context, direction],
  );

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const swapDirection = () => {
    setDirection((d) => (d === "escape" ? "unescape" : "escape"));
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <SquareCode className="text-primary" size={20} />
          <h2 className="font-semibold text-text">String Escape / Unescape</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
            {CONTEXTS.map((c) => (
              <button
                key={c.key}
                onClick={() => setContext(c.key)}
                className={`px-3 py-1.5 transition-colors ${
                  context === c.key
                    ? "bg-primary text-white"
                    : "text-subText hover:bg-inputBg"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <button
            onClick={swapDirection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-subText hover:bg-inputBg transition-colors"
            title="Swap direction"
          >
            <ArrowLeftRight size={14} />
            {direction === "escape" ? "Escape" : "Unescape"}
          </button>

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
            Input
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === "escape"
                ? "Enter raw text to escape..."
                : "Enter escaped text to unescape..."
            }
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
