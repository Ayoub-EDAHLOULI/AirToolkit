import { useMemo, useState } from "react";
import { TextCursorInput, Copy, Check, Trash2 } from "lucide-react";
import {
  computeStats,
  sortLines,
  deduplicateLines,
  removeEmptyLines,
  trimLines,
  normalizeLineEndings,
  collapseWhitespace,
} from "../lib/textUtils";

export default function TextUtilities() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => computeStats(text), [text]);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const actions: { label: string; run: (t: string) => string }[] = [
    { label: "Sort A→Z", run: (t) => sortLines(t) },
    { label: "Sort Z→A", run: (t) => sortLines(t, true) },
    { label: "Remove duplicates", run: deduplicateLines },
    { label: "Remove empty lines", run: removeEmptyLines },
    { label: "Trim each line", run: trimLines },
    { label: "Collapse whitespace", run: collapseWhitespace },
    { label: "Line endings → LF", run: (t) => normalizeLineEndings(t, "lf") },
    {
      label: "Line endings → CRLF",
      run: (t) => normalizeLineEndings(t, "crlf"),
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <TextCursorInput className="text-primary" size={20} />
          <h2 className="font-semibold text-text">Text Utilities</h2>
        </div>
        <div className="flex items-center gap-2">
          {text && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-subText hover:bg-inputBg transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
          <button
            onClick={() => setText("")}
            className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
            title="Clear"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap px-6 py-3 border-b border-border shrink-0">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => setText((t) => action.run(t))}
            disabled={!text}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-subText hover:bg-inputBg transition-colors disabled:opacity-40"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6 px-6 py-2 border-b border-border shrink-0 text-xs text-subText">
        <span>
          <span className="text-text font-medium">{stats.characters}</span>{" "}
          characters
        </span>
        <span>
          <span className="text-text font-medium">
            {stats.charactersNoSpaces}
          </span>{" "}
          (no spaces)
        </span>
        <span>
          <span className="text-text font-medium">{stats.words}</span> words
        </span>
        <span>
          <span className="text-text font-medium">{stats.lines}</span> lines
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type text here..."
        spellCheck={false}
        className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
      />
    </div>
  );
}
