import { useMemo, useState } from "react";
import { GitCompare, Trash2 } from "lucide-react";
import { diffLines, type DiffLine } from "../lib/diff";

function lineBg(op: DiffLine["op"]) {
  if (op === "add") return "bg-[color:var(--diff-add-bg)]";
  if (op === "remove") return "bg-[color:var(--diff-remove-bg)]";
  return "";
}

function LeftColumn({ lines }: { lines: DiffLine[] }) {
  return (
    <>
      {lines
        .filter((l) => l.op !== "add")
        .map((l, i) => (
          <div key={i} className={`flex ${lineBg(l.op)}`}>
            <span className="w-10 shrink-0 select-none text-right pr-2 text-subText text-xs py-0.5">
              {l.leftNumber}
            </span>
            <span className="w-4 shrink-0 select-none text-xs py-0.5">
              {l.op === "remove" ? "−" : ""}
            </span>
            <span className="flex-1 whitespace-pre-wrap break-words py-0.5">
              {l.text || " "}
            </span>
          </div>
        ))}
    </>
  );
}

function RightColumn({ lines }: { lines: DiffLine[] }) {
  return (
    <>
      {lines
        .filter((l) => l.op !== "remove")
        .map((l, i) => (
          <div key={i} className={`flex ${lineBg(l.op)}`}>
            <span className="w-10 shrink-0 select-none text-right pr-2 text-subText text-xs py-0.5">
              {l.rightNumber}
            </span>
            <span className="w-4 shrink-0 select-none text-xs py-0.5">
              {l.op === "add" ? "+" : ""}
            </span>
            <span className="flex-1 whitespace-pre-wrap break-words py-0.5">
              {l.text || " "}
            </span>
          </div>
        ))}
    </>
  );
}

export default function DiffTool() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const lines = useMemo(() => diffLines(left, right), [left, right]);

  const stats = useMemo(() => {
    const added = lines.filter((l) => l.op === "add").length;
    const removed = lines.filter((l) => l.op === "remove").length;
    return { added, removed };
  }, [lines]);

  const hasContent = left.length > 0 || right.length > 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <GitCompare className="text-primary" size={20} />
          <h2 className="font-semibold text-text">Diff Tool</h2>
        </div>

        <div className="flex items-center gap-3">
          {hasContent && (
            <p className="text-sm text-subText">
              <span className="text-[color:var(--diff-add-text)]">
                +{stats.added}
              </span>{" "}
              <span className="text-[color:var(--diff-remove-text)]">
                −{stats.removed}
              </span>
            </p>
          )}
          <button
            onClick={() => {
              setLeft("");
              setRight("");
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
            Original
          </div>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste original text..."
            spellCheck={false}
            className="h-32 shrink-0 resize-none border-b border-border bg-transparent p-3 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
          <div className="flex-1 overflow-auto custom-scrollbar font-mono text-sm">
            <LeftColumn lines={lines} />
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Changed
          </div>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste changed text..."
            spellCheck={false}
            className="h-32 shrink-0 resize-none border-b border-border bg-transparent p-3 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
          <div className="flex-1 overflow-auto custom-scrollbar font-mono text-sm">
            <RightColumn lines={lines} />
          </div>
        </div>
      </div>
    </div>
  );
}
