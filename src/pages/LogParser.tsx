import { useMemo, useState } from "react";
import { Terminal, Copy, Check, Trash2 } from "lucide-react";

interface FilterResult {
  matchedLines: string[];
  error: string | null;
}

function filterLines(
  text: string,
  pattern: string,
  caseInsensitive: boolean,
  invert: boolean,
  useRegex: boolean,
): FilterResult {
  if (!pattern) {
    return { matchedLines: text ? text.split("\n") : [], error: null };
  }

  const lines = text.split("\n");

  if (!useRegex) {
    const needle = caseInsensitive ? pattern.toLowerCase() : pattern;
    const matched = lines.filter((line) => {
      const haystack = caseInsensitive ? line.toLowerCase() : line;
      const isMatch = haystack.includes(needle);
      return invert ? !isMatch : isMatch;
    });
    return { matchedLines: matched, error: null };
  }

  try {
    const regex = new RegExp(pattern, caseInsensitive ? "i" : "");
    const matched = lines.filter((line) => {
      const isMatch = regex.test(line);
      return invert ? !isMatch : isMatch;
    });
    return { matchedLines: matched, error: null };
  } catch (err) {
    return { matchedLines: [], error: (err as Error).message };
  }
}

function topRepeatedLines(
  lines: string[],
  limit = 5,
): { line: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const line of lines) {
    if (!line.trim()) continue;
    counts.set(line, (counts.get(line) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([line, count]) => ({ line, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export default function LogParser() {
  const [text, setText] = useState("");
  const [pattern, setPattern] = useState("");
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [invert, setInvert] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [copied, setCopied] = useState(false);

  const { matchedLines, error } = useMemo(
    () => filterLines(text, pattern, caseInsensitive, invert, useRegex),
    [text, pattern, caseInsensitive, invert, useRegex],
  );

  const totalLines = text ? text.split("\n").length : 0;
  const topRepeated = useMemo(
    () => topRepeatedLines(matchedLines),
    [matchedLines],
  );

  const handleCopy = async () => {
    if (matchedLines.length === 0) return;
    await navigator.clipboard.writeText(matchedLines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="text-primary" size={20} />
          <h2 className="font-semibold text-text">Log Parser / Grep</h2>
        </div>
        <button
          onClick={() => {
            setText("");
            setPattern("");
          }}
          className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
          title="Clear"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder={
              useRegex ? "regex pattern..." : "plain text to find..."
            }
            spellCheck={false}
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
          <button
            onClick={handleCopy}
            disabled={matchedLines.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-border text-subText hover:bg-inputBg transition-colors disabled:opacity-40"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy matches"}
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-1.5 text-subText cursor-pointer">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
            />
            Regex
          </label>
          <label className="flex items-center gap-1.5 text-subText cursor-pointer">
            <input
              type="checkbox"
              checked={caseInsensitive}
              onChange={(e) => setCaseInsensitive(e.target.checked)}
            />
            Case insensitive
          </label>
          <label className="flex items-center gap-1.5 text-subText cursor-pointer">
            <input
              type="checkbox"
              checked={invert}
              onChange={(e) => setInvert(e.target.checked)}
            />
            Invert match (like grep -v)
          </label>

          {error ? (
            <span className="text-danger font-mono text-xs">{error}</span>
          ) : (
            <span className="text-subText ml-auto">
              {matchedLines.length} / {totalLines} lines
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Input
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste log output here..."
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Matched Lines
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <pre className="p-4 font-mono text-sm text-text whitespace-pre-wrap break-words">
              {matchedLines.join("\n")}
            </pre>
          </div>

          {topRepeated.length > 0 && (
            <div className="border-t border-border p-4 flex flex-col gap-2 shrink-0 max-h-48 overflow-y-auto custom-scrollbar">
              <span className="text-xs font-medium text-subText">
                Most repeated matched lines
              </span>
              {topRepeated.map(({ line, count }) => (
                <div
                  key={line}
                  className="flex items-center gap-2 text-xs font-mono"
                >
                  <span className="shrink-0 px-1.5 py-0.5 rounded bg-inputBg text-text">
                    ×{count}
                  </span>
                  <span className="text-subText truncate">{line}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
