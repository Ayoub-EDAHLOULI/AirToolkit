import { useMemo, useState } from "react";
import { GitCompareArrows, Trash2 } from "lucide-react";
import { diffJson, formatValue, type JsonDiffEntry } from "../lib/jsonDiff";

const OP_STYLES: Record<
  JsonDiffEntry["op"],
  { label: string; bg: string; text: string }
> = {
  added: {
    label: "+",
    bg: "bg-[color:var(--diff-add-bg)]",
    text: "text-[color:var(--diff-add-text)]",
  },
  removed: {
    label: "−",
    bg: "bg-[color:var(--diff-remove-bg)]",
    text: "text-[color:var(--diff-remove-text)]",
  },
  changed: {
    label: "~",
    bg: "bg-[color:var(--diff-remove-bg)]",
    text: "text-[color:var(--diff-remove-text)]",
  },
  unchanged: { label: "", bg: "", text: "" },
};

function EntryRow({ entry }: { entry: JsonDiffEntry }) {
  const style = OP_STYLES[entry.op];

  return (
    <div className={`rounded-lg px-3 py-2 ${style.bg}`}>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-sm font-bold ${style.text}`}>
          {style.label}
        </span>
        <code className="font-mono text-sm text-text">
          {entry.path || "(root)"}
        </code>
      </div>
      {entry.op === "changed" && (
        <div className="pl-5 mt-1 flex flex-col gap-0.5 text-xs font-mono">
          <span className="text-[color:var(--diff-remove-text)]">
            − {formatValue(entry.oldValue)}
          </span>
          <span className="text-[color:var(--diff-add-text)]">
            + {formatValue(entry.newValue)}
          </span>
        </div>
      )}
      {entry.op === "added" && (
        <div className="pl-5 mt-1 text-xs font-mono text-[color:var(--diff-add-text)]">
          {formatValue(entry.newValue)}
        </div>
      )}
      {entry.op === "removed" && (
        <div className="pl-5 mt-1 text-xs font-mono text-[color:var(--diff-remove-text)]">
          {formatValue(entry.oldValue)}
        </div>
      )}
    </div>
  );
}

export default function JsonDiff() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");

  const { entries, error } = useMemo(
    () => diffJson(textA, textB),
    [textA, textB],
  );

  const hasContent = textA.trim() || textB.trim();

  const counts = useMemo(() => {
    const added = entries.filter((e) => e.op === "added").length;
    const removed = entries.filter((e) => e.op === "removed").length;
    const changed = entries.filter((e) => e.op === "changed").length;
    return { added, removed, changed };
  }, [entries]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="text-primary" size={20} />
          <h2 className="font-semibold text-text">JSON Diff</h2>
        </div>

        <div className="flex items-center gap-3">
          {hasContent && !error && (
            <p className="text-sm text-subText">
              <span className="text-[color:var(--diff-add-text)]">
                +{counts.added}
              </span>{" "}
              <span className="text-[color:var(--diff-remove-text)]">
                −{counts.removed}
              </span>{" "}
              <span className="text-subText">~{counts.changed}</span>
            </p>
          )}
          <button
            onClick={() => {
              setTextA("");
              setTextB("");
            }}
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
            JSON A
          </div>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder='{"name": "test", "port": 8080}'
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            JSON B
          </div>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder='{"port": 8080, "name": "test-v2"}'
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="w-96 flex flex-col overflow-hidden bg-card shrink-0">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Differences
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1">
            {error && <p className="text-sm text-danger px-2">{error}</p>}

            {!error && !hasContent && (
              <p className="text-sm text-subText px-2">
                Paste two JSON documents to compare them structurally
                (key/value, not line-by-line — reordered keys show no diff).
              </p>
            )}

            {!error && hasContent && entries.length === 0 && (
              <p className="text-sm text-[color:var(--diff-add-text)] px-2">
                No structural differences found.
              </p>
            )}

            {!error &&
              entries.map((entry, i) => (
                <EntryRow key={`${entry.path}-${i}`} entry={entry} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
