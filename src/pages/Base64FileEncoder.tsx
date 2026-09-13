import { useState } from "react";
import {
  FileArchive,
  FolderOpen,
  Save,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function guessMimeType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
    pdf: "application/pdf",
    txt: "text/plain",
    json: "application/json",
  };
  return map[ext] ?? "application/octet-stream";
}

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Base64FileEncoder() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [base64, setBase64] = useState("");
  const [asDataUrl, setAsDataUrl] = useState(false);
  const [mimeType, setMimeType] = useState("application/octet-stream");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [decodeInput, setDecodeInput] = useState("");

  const output =
    asDataUrl && base64 ? `data:${mimeType};base64,${base64}` : base64;

  const handleOpen = async () => {
    setError(null);
    setStatus(null);
    try {
      const path = await open({ multiple: false });
      if (!path || Array.isArray(path)) return;

      const data = await readFile(path);
      const name = path.split(/[\\/]/).pop() ?? path;
      setFileName(name);
      setFileSize(data.length);
      setMimeType(guessMimeType(name));
      setBase64(bytesToBase64(data));
    } catch (err) {
      setError((err as Error).message || "Failed to read file.");
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    setFileName("");
    setFileSize(0);
    setBase64("");
    setError(null);
    setStatus(null);
    setDecodeInput("");
  };

  const handleDecodeSave = async () => {
    setError(null);
    setStatus(null);
    try {
      const cleaned = decodeInput.includes("base64,")
        ? decodeInput.split("base64,")[1]
        : decodeInput;
      const bytes = base64ToBytes(cleaned);

      const path = await save({ defaultPath: "decoded.bin" });
      if (!path) return;

      await writeFile(path, bytes);
      setStatus(`Saved ${formatBytes(bytes.length)}.`);
    } catch (err) {
      setError((err as Error).message || "Invalid base64 input.");
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <FileArchive className="text-primary" size={20} />
          <h2 className="font-semibold text-text">Base64 File Encoder</h2>
        </div>

        <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
          <button
            onClick={() => {
              setMode("encode");
              setError(null);
              setStatus(null);
            }}
            className={`px-3 py-1.5 font-medium transition-colors ${
              mode === "encode"
                ? "bg-primary text-white"
                : "text-subText hover:bg-inputBg"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => {
              setMode("decode");
              setError(null);
              setStatus(null);
            }}
            className={`px-3 py-1.5 font-medium transition-colors ${
              mode === "decode"
                ? "bg-primary text-white"
                : "text-subText hover:bg-inputBg"
            }`}
          >
            Decode
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-3 border-b border-border shrink-0">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}
      {status && (
        <div className="px-6 py-3 border-b border-border shrink-0">
          <p className="text-sm text-primary">{status}</p>
        </div>
      )}

      {mode === "encode" ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-3 border-b border-border shrink-0">
            <button
              onClick={handleOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity"
            >
              <FolderOpen size={14} />
              Open File
            </button>

            {base64 && (
              <>
                <span className="text-sm text-text font-medium truncate max-w-xs">
                  {fileName}
                </span>
                <span className="text-sm text-subText">
                  {formatBytes(fileSize)}
                </span>

                <label className="flex items-center gap-1.5 text-sm text-subText ml-auto cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={asDataUrl}
                    onChange={(e) => setAsDataUrl(e.target.checked)}
                  />
                  Data URI
                </label>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-subText hover:bg-inputBg transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleClear}
                  className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
                  title="Clear"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar p-4">
            {!base64 ? (
              <p className="text-sm text-subText">
                Open a file to see its base64 encoding.
              </p>
            ) : (
              <textarea
                readOnly
                value={output}
                spellCheck={false}
                className="w-full h-full resize-none bg-transparent font-mono text-xs text-text outline-none whitespace-pre-wrap break-all"
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-3 border-b border-border shrink-0">
            <button
              onClick={handleDecodeSave}
              disabled={!decodeInput.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Save size={14} />
              Decode &amp; Save As...
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
              title="Clear"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar p-4">
            <textarea
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder="Paste base64 (plain or data:*;base64,... URI)..."
              spellCheck={false}
              className="w-full h-full resize-none bg-transparent font-mono text-xs text-text outline-none placeholder:text-subText whitespace-pre-wrap break-all"
            />
          </div>
        </div>
      )}
    </div>
  );
}
