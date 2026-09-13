import { useMemo, useState } from "react";
import { FileDigit, FolderOpen, Trash2 } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { detectFileType, isLikelyText } from "../lib/fileSignatures";

const DISPLAY_LIMIT = 16 * 1024; // show at most 16 KB in the hex view

function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function toHexLine(bytes: Uint8Array, offset: number): string {
  const slice = bytes.subarray(offset, offset + 16);
  const hexParts: string[] = [];
  let ascii = "";

  for (let i = 0; i < 16; i++) {
    if (i < slice.length) {
      const byte = slice[i];
      hexParts.push(byte.toString(16).padStart(2, "0"));
      ascii += byte >= 0x20 && byte < 0x7f ? String.fromCharCode(byte) : ".";
    } else {
      hexParts.push("  ");
    }
    if (i === 7) hexParts.push("");
  }

  const offsetStr = offset.toString(16).padStart(8, "0");
  return `${offsetStr}  ${hexParts.join(" ")}  |${ascii}|`;
}

export default function HexInspector() {
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const detectedType = useMemo(
    () => (bytes ? detectFileType(bytes) : null),
    [bytes],
  );

  const looksLikeText = useMemo(
    () => (bytes ? isLikelyText(bytes) : null),
    [bytes],
  );

  const hexLines = useMemo(() => {
    if (!bytes) return [];
    const shown = bytes.subarray(0, DISPLAY_LIMIT);
    const lines: string[] = [];
    for (let offset = 0; offset < shown.length; offset += 16) {
      lines.push(toHexLine(shown, offset));
    }
    return lines;
  }, [bytes]);

  const handleOpen = async () => {
    setError(null);
    try {
      const path = await open({ multiple: false });
      if (!path || Array.isArray(path)) return;

      setLoading(true);
      const data = await readFile(path);
      setBytes(data);
      setFileSize(data.length);
      setFileName(path.split(/[\\/]/).pop() ?? path);
    } catch (err) {
      setError((err as Error).message || "Failed to read file.");
      setBytes(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <FileDigit className="text-primary" size={20} />
          <h2 className="font-semibold text-text">
            Hex / Binary File Inspector
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpen}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <FolderOpen size={14} />
            {loading ? "Reading..." : "Open File"}
          </button>
          {bytes && (
            <button
              onClick={() => {
                setBytes(null);
                setFileName("");
                setFileSize(0);
                setError(null);
              }}
              className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
              title="Clear"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="px-6 py-3 border-b border-border shrink-0">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {bytes && (
        <div className="flex items-center gap-6 px-6 py-3 border-b border-border shrink-0 text-sm">
          <span className="text-text font-medium truncate max-w-xs">
            {fileName}
          </span>
          <span className="text-subText">{formatBytes(fileSize)}</span>
          <span className="text-subText">
            Type:{" "}
            <span className="text-text">
              {detectedType?.name ??
                (looksLikeText ? "Plain text" : "Unknown binary")}
            </span>
          </span>
          {fileSize > DISPLAY_LIMIT && (
            <span className="text-subText">
              Showing first {formatBytes(DISPLAY_LIMIT)}
            </span>
          )}
        </div>
      )}

      <div className="flex-1 overflow-auto custom-scrollbar p-4">
        {!bytes && !error && (
          <p className="text-sm text-subText">
            Open a file to see its hex dump and detected type.
          </p>
        )}
        {bytes && (
          <pre className="font-mono text-xs text-text whitespace-pre">
            {hexLines.join("\n")}
          </pre>
        )}
      </div>
    </div>
  );
}
