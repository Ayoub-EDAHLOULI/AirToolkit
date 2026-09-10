import { useEffect, useState } from "react";
import { Hash, Copy, Check, Trash2, RefreshCw } from "lucide-react";
import { md5 } from "../lib/md5";

type Algo = "MD5" | "SHA-1" | "SHA-256" | "SHA-512";

const ALGOS: Algo[] = ["MD5", "SHA-1", "SHA-256", "SHA-512"];

async function computeHash(input: string, algo: Algo): Promise<string> {
  if (algo === "MD5") return md5(input);

  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest(algo, bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function HashRow({
  algo,
  input,
}: {
  algo: Algo;
  input: string;
}) {
  const [hash, setHash] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!input) {
      setHash("");
      return;
    }
    computeHash(input, algo).then((result) => {
      if (!cancelled) setHash(result);
    });
    return () => {
      cancelled = true;
    };
  }, [input, algo]);

  const handleCopy = async () => {
    if (!hash) return;
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
      <span className="w-20 shrink-0 text-xs font-semibold text-subText">
        {algo}
      </span>
      <code className="flex-1 font-mono text-sm text-text break-all">
        {hash || "—"}
      </code>
      {hash && (
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

function UuidGenerator() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([crypto.randomUUID()]);
  const [copiedAll, setCopiedAll] = useState(false);

  const generate = () => {
    const n = Math.min(Math.max(count, 1), 100);
    setUuids(Array.from({ length: n }, () => crypto.randomUUID()));
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border shrink-0">
        <label className="text-sm text-subText">Count</label>
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-text outline-none"
        />
        <button
          onClick={generate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity"
        >
          <RefreshCw size={14} />
          Generate
        </button>
        {uuids.length > 0 && (
          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-subText hover:bg-inputBg transition-colors ml-auto"
          >
            {copiedAll ? <Check size={14} /> : <Copy size={14} />}
            {copiedAll ? "Copied" : "Copy all"}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="flex flex-col gap-1">
          {uuids.map((id, i) => (
            <code
              key={i}
              className="font-mono text-sm text-text px-3 py-1.5 rounded-lg hover:bg-inputBg"
            >
              {id}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HashUuid() {
  const [mode, setMode] = useState<"hash" | "uuid">("hash");
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Hash className="text-primary" size={20} />
          <h2 className="font-semibold text-text">Hash / UUID Generator</h2>
        </div>

        <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
          <button
            onClick={() => setMode("hash")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "hash"
                ? "bg-primary text-white"
                : "text-subText hover:bg-inputBg"
            }`}
          >
            Hash
          </button>
          <button
            onClick={() => setMode("uuid")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "uuid"
                ? "bg-primary text-white"
                : "text-subText hover:bg-inputBg"
            }`}
          >
            UUID
          </button>
        </div>
      </div>

      {mode === "hash" ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
              <span>Input</span>
              <button
                onClick={() => setInput("")}
                className="text-subText hover:text-text transition-colors"
                title="Clear"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              spellCheck={false}
              className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
            />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden bg-card">
            <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
              Digests
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
              {ALGOS.map((algo) => (
                <HashRow key={algo} algo={algo} input={input} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <UuidGenerator />
      )}
    </div>
  );
}
