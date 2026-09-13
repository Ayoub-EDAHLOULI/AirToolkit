import { useMemo, useState } from "react";
import { Network, Copy, Check, X } from "lucide-react";
import { calculateCidr } from "../lib/cidr";

function ResultRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
      <span className="w-40 shrink-0 text-xs font-semibold text-subText">
        {label}
      </span>
      <code className="flex-1 font-mono text-sm text-text break-all">
        {value}
      </code>
      <button
        onClick={handleCopy}
        className="shrink-0 p-1.5 rounded-lg text-subText hover:bg-inputBg hover:text-text transition-colors"
        title="Copy"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}

export default function CidrCalculator() {
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return calculateCidr(input);
  }, [input]);

  const showError = input.trim() && !result;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <Network className="text-primary" size={20} />
        <h2 className="font-semibold text-text">Subnet / CIDR Calculator</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-xl flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-subText">
              IP Address / CIDR Prefix
            </label>
            <div className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="192.168.1.100/24"
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
          </div>

          {showError && (
            <p className="text-sm text-danger">
              Not a valid IPv4 CIDR (e.g. 192.168.1.100/24).
            </p>
          )}

          {result && (
            <div className="rounded-lg border border-border bg-card px-4">
              <ResultRow
                label="Network Address"
                value={result.networkAddress}
              />
              <ResultRow
                label="Broadcast Address"
                value={result.broadcastAddress}
              />
              <ResultRow label="Subnet Mask" value={result.subnetMask} />
              <ResultRow label="Wildcard Mask" value={result.wildcardMask} />
              <ResultRow
                label="Usable Host Range"
                value={
                  result.firstUsable && result.lastUsable
                    ? `${result.firstUsable} – ${result.lastUsable}`
                    : "None"
                }
              />
              <ResultRow
                label="Usable Hosts"
                value={result.usableHostCount.toLocaleString()}
              />
              <ResultRow
                label="Total Addresses"
                value={result.totalHostCount.toLocaleString()}
              />
              <ResultRow
                label="Prefix Length"
                value={`/${result.prefixLength}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
