import { useEffect, useState } from "react";
import { MonitorCog, Copy, Check } from "lucide-react";
import {
  platform,
  version,
  family,
  type as osType,
  arch,
  exeExtension,
  eol,
  locale,
  hostname,
} from "@tauri-apps/plugin-os";
import { getVersion, getTauriVersion } from "@tauri-apps/api/app";

interface InfoRow {
  label: string;
  value: string;
}

export default function SystemInfo() {
  const [rows, setRows] = useState<InfoRow[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [localeStr, hostnameStr, appVersion, tauriVersion] =
        await Promise.all([
          locale().catch(() => null),
          hostname().catch(() => null),
          getVersion().catch(() => null),
          getTauriVersion().catch(() => null),
        ]);

      if (cancelled) return;

      setRows([
        { label: "Platform", value: platform() },
        { label: "OS Type", value: osType() },
        { label: "OS Version", value: version() },
        { label: "Family", value: family() },
        { label: "Architecture", value: arch() },
        { label: "Executable extension", value: exeExtension() || "(none)" },
        {
          label: "Line ending",
          value: eol() === "\r\n" ? "CRLF (\\r\\n)" : "LF (\\n)",
        },
        { label: "Locale", value: localeStr ?? "Unknown" },
        { label: "Hostname", value: hostnameStr ?? "Unknown" },
        { label: "Screen resolution", value: `${screen.width} × ${screen.height}` },
        {
          label: "Window (viewport) size",
          value: `${window.innerWidth} × ${window.innerHeight}`,
        },
        {
          label: "Device pixel ratio",
          value: String(window.devicePixelRatio),
        },
        { label: "CPU logical cores", value: String(navigator.hardwareConcurrency ?? "Unknown") },
        { label: "User agent", value: navigator.userAgent },
        { label: "AirToolkit version", value: appVersion ?? "Unknown" },
        { label: "Tauri version", value: tauriVersion ?? "Unknown" },
      ]);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopy = async () => {
    const text = rows.map((r) => `${r.label}: ${r.value}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <MonitorCog className="text-primary" size={20} />
          <h2 className="font-semibold text-text">System Info</h2>
        </div>
        <button
          onClick={handleCopy}
          disabled={rows.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-subText hover:bg-inputBg transition-colors disabled:opacity-40"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy All"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-2xl rounded-xl border border-border overflow-hidden">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-start gap-4 px-4 py-3 text-sm ${
                i !== rows.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="w-48 shrink-0 text-subText">{row.label}</span>
              <span className="text-text break-all font-mono">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
