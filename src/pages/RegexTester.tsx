import { useMemo, useRef, useState } from "react";
import { Regex as RegexIcon, Trash2, BookOpen, X } from "lucide-react";

interface FlagDef {
  key: string;
  label: string;
  title: string;
}

const FLAG_DEFS: FlagDef[] = [
  { key: "g", label: "g", title: "Global — find all matches" },
  { key: "i", label: "i", title: "Case insensitive" },
  { key: "m", label: "m", title: "Multiline — ^ and $ match line boundaries" },
  { key: "s", label: "s", title: "Dot all — . matches newlines" },
  { key: "u", label: "u", title: "Unicode" },
];

const CHEAT_SHEET: { pattern: string; meaning: string }[] = [
  { pattern: ".", meaning: "Any character except newline" },
  { pattern: "\\d", meaning: "Digit (0-9)" },
  { pattern: "\\w", meaning: "Word character (letters, digits, _)" },
  { pattern: "\\s", meaning: "Whitespace (space, tab, newline)" },
  { pattern: "^", meaning: "Start of string (or line, with m flag)" },
  { pattern: "$", meaning: "End of string (or line, with m flag)" },
  { pattern: "*", meaning: "0 or more of the previous token" },
  { pattern: "+", meaning: "1 or more of the previous token" },
  { pattern: "?", meaning: "0 or 1 of the previous token" },
  { pattern: "{n,m}", meaning: "Between n and m repetitions" },
  { pattern: "(...)", meaning: "Capture group" },
  { pattern: "(?:...)", meaning: "Non-capturing group" },
  { pattern: "a|b", meaning: "Match a or b" },
  { pattern: "[abc]", meaning: "Any one of a, b, or c" },
  { pattern: "[^abc]", meaning: "Any character except a, b, or c" },
];

interface MatchInfo {
  key: number;
  fullMatch: string;
  index: number;
  groups: (string | undefined)[];
  namedGroups: Record<string, string> | undefined;
}

interface BuildResult {
  regex: RegExp | null;
  error: string | null;
}

function buildRegex(pattern: string, flags: string): BuildResult {
  if (!pattern) return { regex: null, error: null };
  try {
    const regex = new RegExp(pattern, flags);
    return { regex, error: null };
  } catch (err) {
    return { regex: null, error: (err as Error).message };
  }
}

function findMatches(text: string, regex: RegExp | null): MatchInfo[] {
  if (!regex || !text) return [];

  const flags = regex.flags.includes("g") ? regex.flags : regex.flags + "g";
  const globalRegex = new RegExp(regex.source, flags);

  const matches: MatchInfo[] = [];
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = globalRegex.exec(text)) !== null) {
    if (match[0] === "") {
      globalRegex.lastIndex++;
      if (globalRegex.lastIndex > text.length) break;
      continue;
    }
    matches.push({
      key: key++,
      fullMatch: match[0],
      index: match.index,
      groups: match.slice(1),
      namedGroups: match.groups,
    });
    if (matches.length > 5000) break;
  }

  return matches;
}

function renderHighlighted(text: string, matches: MatchInfo[]) {
  if (!text) return [text];
  if (matches.length === 0) return [text];

  const parts: (string | { match: string; key: number })[] = [];
  let lastIndex = 0;

  for (const m of matches) {
    parts.push(text.slice(lastIndex, m.index));
    parts.push({ match: m.fullMatch, key: m.key });
    lastIndex = m.index + m.fullMatch.length;
  }
  parts.push(text.slice(lastIndex));

  return parts;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { regex, error } = useMemo(
    () => buildRegex(pattern, flags),
    [pattern, flags],
  );

  const matches = useMemo(
    () => findMatches(testString, error ? null : regex),
    [testString, regex, error],
  );

  const parts = useMemo(
    () => renderHighlighted(testString, matches),
    [testString, matches],
  );

  const toggleFlag = (key: string) => {
    setFlags((current) =>
      current.includes(key) ? current.replace(key, "") : current + key,
    );
  };

  const syncScroll = () => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-col gap-3 px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RegexIcon className="text-primary" size={20} />
            <h2 className="font-semibold text-text">Regex Tester</h2>
          </div>
          <button
            onClick={() => setShowCheatSheet((s) => !s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border transition-colors ${
              showCheatSheet
                ? "bg-primary text-white border-primary"
                : "text-subText hover:bg-inputBg"
            }`}
          >
            <BookOpen size={14} />
            Cheat Sheet
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center rounded-lg border border-border overflow-hidden bg-card">
            <span className="px-2 text-subText font-mono select-none">/</span>
            <input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              spellCheck={false}
              className="flex-1 bg-transparent py-2 font-mono text-sm text-text outline-none placeholder:text-subText"
            />
            <span className="px-2 text-subText font-mono select-none">
              /{flags}
            </span>
          </div>

          <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
            {FLAG_DEFS.map((f) => (
              <button
                key={f.key}
                title={f.title}
                onClick={() => toggleFlag(f.key)}
                className={`w-8 h-8 font-mono transition-colors ${
                  flags.includes(f.key)
                    ? "bg-primary text-white"
                    : "text-subText hover:bg-inputBg"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setPattern("");
              setTestString("");
            }}
            className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
            title="Clear"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {error ? (
          <p className="text-sm text-danger font-mono">{error}</p>
        ) : (
          <p className="text-sm text-subText">
            {pattern
              ? `${matches.length} match${matches.length === 1 ? "" : "es"}`
              : "Enter a pattern to start matching"}
          </p>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative overflow-hidden border-r border-border">
          <div
            ref={overlayRef}
            aria-hidden
            className="absolute inset-0 overflow-auto p-4 font-mono text-sm whitespace-pre-wrap break-words pointer-events-none"
          >
            {parts.map((part, i) =>
              typeof part === "string" ? (
                <span key={i} className="text-transparent">
                  {part}
                </span>
              ) : (
                <span
                  key={i}
                  className="text-transparent rounded-[2px]"
                  style={{ backgroundColor: "var(--regex-highlight)" }}
                >
                  {part.match}
                </span>
              ),
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            onScroll={syncScroll}
            placeholder="Enter test string..."
            spellCheck={false}
            className="relative w-full h-full resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText whitespace-pre-wrap break-words"
          />
        </div>

        <div className="w-80 flex flex-col overflow-hidden shrink-0 bg-card">
          {showCheatSheet ? (
            <>
              <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
                <span>Cheat Sheet</span>
                <button
                  onClick={() => setShowCheatSheet(false)}
                  className="text-subText hover:text-text transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1.5">
                {CHEAT_SHEET.map((item) => (
                  <div
                    key={item.pattern}
                    className="flex items-baseline gap-3 text-sm px-2 py-1.5 rounded-lg hover:bg-inputBg"
                  >
                    <code className="font-mono text-primary shrink-0 min-w-[4.5rem]">
                      {item.pattern}
                    </code>
                    <span className="text-subText">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
                Matches
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">
                {matches.length === 0 ? (
                  <p className="text-sm text-subText px-2">No matches yet.</p>
                ) : (
                  matches.map((m, i) => (
                    <div
                      key={m.key}
                      className="rounded-lg border border-border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-subText">
                          Match {i + 1}
                        </span>
                        <span className="text-xs text-subText">
                          at {m.index}
                        </span>
                      </div>
                      <code className="block font-mono text-text break-words mb-2">
                        {m.fullMatch}
                      </code>
                      {m.groups.length > 0 && (
                        <div className="flex flex-col gap-1 border-t border-border pt-2">
                          {m.groups.map((g, gi) => (
                            <div
                              key={gi}
                              className="flex items-baseline gap-2 text-xs"
                            >
                              <span className="text-subText shrink-0">
                                Group {gi + 1}:
                              </span>
                              <code className="font-mono text-text break-words">
                                {g ?? "(unmatched)"}
                              </code>
                            </div>
                          ))}
                        </div>
                      )}
                      {m.namedGroups &&
                        Object.keys(m.namedGroups).length > 0 && (
                          <div className="flex flex-col gap-1 border-t border-border pt-2 mt-2">
                            {Object.entries(m.namedGroups).map(
                              ([name, value]) => (
                                <div
                                  key={name}
                                  className="flex items-baseline gap-2 text-xs"
                                >
                                  <span className="text-subText shrink-0">
                                    {name}:
                                  </span>
                                  <code className="font-mono text-text break-words">
                                    {value ?? "(unmatched)"}
                                  </code>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
