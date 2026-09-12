import { useMemo, useState } from "react";
import { FileDiff, AlertTriangle, Plus, Minus, Trash2 } from "lucide-react";
import { compareDotenv } from "../lib/dotenv";

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-subText">
        {icon}
        {title}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

export default function DotenvDiff() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");

  const result = useMemo(() => compareDotenv(textA, textB), [textA, textB]);

  const hasContent = textA.trim() || textB.trim();
  const hasIssues =
    result.onlyInA.length > 0 ||
    result.onlyInB.length > 0 ||
    result.differentValues.length > 0 ||
    result.emptyInA.length > 0 ||
    result.emptyInB.length > 0 ||
    result.duplicatesInA.length > 0 ||
    result.duplicatesInB.length > 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <FileDiff className="text-primary" size={20} />
          <h2 className="font-semibold text-text">
            dotenv Diff &amp; Validator
          </h2>
        </div>
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

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            .env A
          </div>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder={"DB_HOST=localhost\nDB_PORT=5432\nAPI_KEY=secret"}
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            .env B
          </div>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder={
              "DB_HOST=prod.example.com\nDB_PORT=5432\nAPI_KEY=other-secret"
            }
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="w-96 flex flex-col overflow-hidden bg-card shrink-0">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Comparison
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
            {!hasContent && (
              <p className="text-sm text-subText">
                Paste two .env files to compare them.
              </p>
            )}

            {hasContent && !hasIssues && (
              <p className="text-sm text-[color:var(--diff-add-text)]">
                No differences or issues found.
              </p>
            )}

            {result.onlyInA.length > 0 && (
              <Section
                title="Only in A (missing from B)"
                icon={<Minus size={12} className="text-danger" />}
              >
                {result.onlyInA.map((e) => (
                  <code key={e.key} className="text-xs font-mono text-danger">
                    {e.key}
                  </code>
                ))}
              </Section>
            )}

            {result.onlyInB.length > 0 && (
              <Section
                title="Only in B (missing from A)"
                icon={
                  <Plus
                    size={12}
                    className="text-[color:var(--diff-add-text)]"
                  />
                }
              >
                {result.onlyInB.map((e) => (
                  <code
                    key={e.key}
                    className="text-xs font-mono text-[color:var(--diff-add-text)]"
                  >
                    {e.key}
                  </code>
                ))}
              </Section>
            )}

            {result.differentValues.length > 0 && (
              <Section
                title="Different values"
                icon={<AlertTriangle size={12} className="text-subText" />}
              >
                {result.differentValues.map((d) => (
                  <div key={d.key} className="text-xs font-mono">
                    <span className="text-text">{d.key}</span>
                    <div className="pl-2 text-subText">
                      A: {d.valueA || "(empty)"}
                    </div>
                    <div className="pl-2 text-subText">
                      B: {d.valueB || "(empty)"}
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {result.emptyInA.length > 0 && (
              <Section
                title="Empty values in A"
                icon={<AlertTriangle size={12} className="text-subText" />}
              >
                {result.emptyInA.map((e) => (
                  <code key={e.key} className="text-xs font-mono text-subText">
                    {e.key}
                  </code>
                ))}
              </Section>
            )}

            {result.emptyInB.length > 0 && (
              <Section
                title="Empty values in B"
                icon={<AlertTriangle size={12} className="text-subText" />}
              >
                {result.emptyInB.map((e) => (
                  <code key={e.key} className="text-xs font-mono text-subText">
                    {e.key}
                  </code>
                ))}
              </Section>
            )}

            {result.duplicatesInA.length > 0 && (
              <Section
                title="Duplicate keys in A"
                icon={<AlertTriangle size={12} className="text-danger" />}
              >
                {result.duplicatesInA.map((key) => (
                  <code key={key} className="text-xs font-mono text-danger">
                    {key}
                  </code>
                ))}
              </Section>
            )}

            {result.duplicatesInB.length > 0 && (
              <Section
                title="Duplicate keys in B"
                icon={<AlertTriangle size={12} className="text-danger" />}
              >
                {result.duplicatesInB.map((key) => (
                  <code key={key} className="text-xs font-mono text-danger">
                    {key}
                  </code>
                ))}
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
