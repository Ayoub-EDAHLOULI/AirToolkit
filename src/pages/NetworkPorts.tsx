import { useMemo, useState } from "react";
import { Router, Search } from "lucide-react";
import { NETWORK_PORTS } from "../lib/networkPorts";

export default function NetworkPorts() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NETWORK_PORTS;
    return NETWORK_PORTS.filter(
      (p) =>
        String(p.port).includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.protocol.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <Router className="text-primary" size={20} />
        <h2 className="font-semibold text-text">Network Port Reference</h2>
      </div>

      <div className="px-6 py-3 border-b border-border shrink-0">
        <div className="relative max-w-md">
          <Search
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subText pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search port, service, or description..."
            spellCheck={false}
            className="w-full rounded-lg border border-border bg-card pl-8 pr-3 py-2 text-sm text-text outline-none placeholder:text-subText"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {filtered.length === 0 ? (
          <p className="text-sm text-subText">No matches.</p>
        ) : (
          <div className="max-w-3xl flex flex-col gap-1">
            {filtered.map((p) => (
              <div
                key={`${p.port}-${p.service}`}
                className="flex items-start gap-4 rounded-lg px-3 py-2.5 hover:bg-inputBg"
              >
                <span className="w-16 shrink-0 font-mono text-sm font-semibold text-primary">
                  {p.port}
                </span>
                <span className="w-20 shrink-0 text-xs font-medium text-subText">
                  {p.protocol}
                </span>
                <span className="w-40 shrink-0 text-sm font-medium text-text">
                  {p.service}
                </span>
                <span className="flex-1 text-sm text-subText">
                  {p.description}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
