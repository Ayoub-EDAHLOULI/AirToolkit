import { useMemo, useState } from "react";
import { Binary, Copy, Check, Trash2, ArrowLeftRight } from "lucide-react";

type Scheme = "base64" | "url" | "html";
type Direction = "encode" | "decode";

const SCHEMES: { key: Scheme; label: string }[] = [
  { key: "base64", label: "Base64" },
  { key: "url", label: "URL" },
  { key: "html", label: "HTML Entities" },
];

const HTML_ESCAPES: [string, string][] = [
  ["&", "&amp;"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ['"', "&quot;"],
  ["'", "&#39;"],
];

function base64Encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64Decode(input: string): string {
  const binary = atob(input);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function htmlEncode(input: string): string {
  let result = input;
  for (const [char, entity] of HTML_ESCAPES) {
    result = result.split(char).join(entity);
  }
  return result;
}

function htmlDecode(input: string): string {
  let result = input;
  for (const [char, entity] of [...HTML_ESCAPES].reverse()) {
    result = result.split(entity).join(char);
  }
  return result;
}

function transform(
  input: string,
  scheme: Scheme,
  direction: Direction,
): { output: string; error: string | null } {
  if (!input) return { output: "", error: null };

  try {
    if (scheme === "base64") {
      return {
        output:
          direction === "encode" ? base64Encode(input) : base64Decode(input),
        error: null,
      };
    }
    if (scheme === "url") {
      return {
        output:
          direction === "encode"
            ? encodeURIComponent(input)
            : decodeURIComponent(input),
        error: null,
      };
    }
    return {
      output: direction === "encode" ? htmlEncode(input) : htmlDecode(input),
      error: null,
    };
  } catch (err) {
    return { output: "", error: (err as Error).message };
  }
}

export default function EncodeDecode() {
  const [input, setInput] = useState("");
  const [scheme, setScheme] = useState<Scheme>("base64");
  const [direction, setDirection] = useState<Direction>("encode");
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(
    () => transform(input, scheme, direction),
    [input, scheme, direction],
  );

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const swapDirection = () => {
    setDirection((d) => (d === "encode" ? "decode" : "encode"));
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Binary className="text-primary" size={20} />
          <h2 className="font-semibold text-text">Encode / Decode</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
            {SCHEMES.map((s) => (
              <button
                key={s.key}
                onClick={() => setScheme(s.key)}
                className={`px-3 py-1.5 transition-colors ${
                  scheme === s.key
                    ? "bg-primary text-white"
                    : "text-subText hover:bg-inputBg"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={swapDirection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-subText hover:bg-inputBg transition-colors"
            title="Swap direction"
          >
            <ArrowLeftRight size={14} />
            {direction === "encode" ? "Encode" : "Decode"}
          </button>

          <button
            onClick={() => setInput("")}
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
            Input
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === "encode"
                ? "Enter text to encode..."
                : "Enter text to decode..."
            }
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            <span>Output</span>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-subText hover:text-text transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            {error ? (
              <div className="p-4 text-sm text-danger font-mono whitespace-pre-wrap">
                {error}
              </div>
            ) : (
              <pre className="p-4 font-mono text-sm text-text whitespace-pre-wrap break-words">
                {output}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
