import { useEffect, useMemo, useState } from "react";
import { Clock, Copy, Check, X } from "lucide-react";

type Unit = "seconds" | "milliseconds";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
      <div className="flex flex-col">
        <span className="text-xs text-subText">{label}</span>
        <code className="font-mono text-sm text-text break-all">
          {value || "—"}
        </code>
      </div>
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

function NowClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-6 px-6 py-3 border-b border-border shrink-0 text-sm">
      <span className="text-subText">Now</span>
      <span className="font-mono text-text">
        {Math.floor(now.getTime() / 1000)}
      </span>
      <span className="font-mono text-text">{now.getTime()}</span>
      <span className="text-text">{now.toISOString()}</span>
      <span className="text-text">{now.toLocaleString()}</span>
    </div>
  );
}

function UnixToDate() {
  const [unit, setUnit] = useState<Unit>("seconds");
  const [input, setInput] = useState("");

  const date = useMemo(() => {
    if (!input.trim()) return null;
    const num = Number(input.trim());
    if (!Number.isFinite(num)) return null;
    const ms = unit === "seconds" ? num * 1000 : num;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }, [input, unit]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
      <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
        <span>Unix Timestamp → Date</span>
        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          {(["seconds", "milliseconds"] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-2 py-1 transition-colors ${
                unit === u
                  ? "bg-primary text-white"
                  : "text-subText hover:bg-inputBg"
              }`}
            >
              {u === "seconds" ? "sec" : "ms"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              unit === "seconds" ? "e.g. 1516239022" : "e.g. 1516239022000"
            }
            spellCheck={false}
            className="w-full rounded-lg border border-border bg-card px-3 pr-9 py-2 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
          {input && (
            <button
              onClick={() => setInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subText hover:text-text transition-colors"
              title="Clear"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {input.trim() && !date ? (
          <p className="text-sm text-danger">Not a valid timestamp.</p>
        ) : (
          date && (
            <div className="flex flex-col gap-2">
              <CopyField label="ISO 8601" value={date.toISOString()} />
              <CopyField label="Local time" value={date.toString()} />
              <CopyField label="UTC" value={date.toUTCString()} />
            </div>
          )
        )}
      </div>
    </div>
  );
}

function DateToUnix() {
  const [input, setInput] = useState("");

  const date = useMemo(() => {
    if (!input.trim()) return null;
    const d = new Date(input.trim());
    return isNaN(d.getTime()) ? null : d;
  }, [input]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-card">
      <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
        Date → Unix Timestamp
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 2024-01-17T10:30:00Z or Jan 17 2024"
            spellCheck={false}
            className="w-full rounded-lg border border-border bg-card px-3 pr-9 py-2 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
          {input && (
            <button
              onClick={() => setInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subText hover:text-text transition-colors"
              title="Clear"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {input.trim() && !date ? (
          <p className="text-sm text-danger">
            Could not parse this date. Try ISO 8601 (2024-01-17T10:30:00Z) or a
            common format like "Jan 17 2024".
          </p>
        ) : (
          date && (
            <div className="flex flex-col gap-2">
              <CopyField
                label="Unix seconds"
                value={String(Math.floor(date.getTime() / 1000))}
              />
              <CopyField
                label="Unix milliseconds"
                value={String(date.getTime())}
              />
              <CopyField label="ISO 8601" value={date.toISOString()} />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function TimestampConverter() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <Clock className="text-primary" size={20} />
        <h2 className="font-semibold text-text">Timestamp Converter</h2>
      </div>

      <NowClock />

      <div className="flex flex-1 overflow-y-auto custom-scrollbar">
        <UnixToDate />
        <DateToUnix />
      </div>
    </div>
  );
}
