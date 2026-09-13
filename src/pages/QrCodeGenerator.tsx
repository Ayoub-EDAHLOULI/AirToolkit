import { useEffect, useRef, useState } from "react";
import { QrCode, Copy, Check, Download, Trash2 } from "lucide-react";
import QRCode from "qrcode";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";

export default function QrCodeGenerator() {
  const [text, setText] = useState("");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) {
      setDataUrl("");
      setError(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(canvas, text, { width: 256, margin: 2 })
      .then(() => {
        setDataUrl(canvas.toDataURL("image/png"));
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message);
        setDataUrl("");
      });
  }, [text]);

  const handleCopy = async () => {
    if (!dataUrl) return;
    await navigator.clipboard.writeText(dataUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = async () => {
    if (!dataUrl) return;
    setSaveStatus(null);

    const path = await save({
      defaultPath: "qrcode.png",
      filters: [{ name: "PNG Image", extensions: ["png"] }],
    });
    if (!path) return;

    const base64 = dataUrl.split(",")[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    try {
      await writeFile(path, bytes);
      setSaveStatus("Saved.");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      setSaveStatus(`Failed to save: ${(err as Error).message}`);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <QrCode className="text-primary" size={20} />
          <h2 className="font-semibold text-text">QR Code Generator</h2>
        </div>
        {text && (
          <button
            onClick={() => setText("")}
            className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
            title="Clear"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-xl flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-subText">
              Text or URL
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or a URL..."
              spellCheck={false}
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-card p-3 font-mono text-sm text-text outline-none placeholder:text-subText"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6">
            <canvas ref={canvasRef} className={dataUrl ? "" : "hidden"} />
            {!dataUrl && !error && (
              <p className="text-sm text-subText py-16">
                Enter text above to generate a QR code.
              </p>
            )}

            {dataUrl && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-subText hover:bg-inputBg transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy as data URI"}
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity"
                >
                  <Download size={14} />
                  Save as PNG
                </button>
              </div>
            )}

            {saveStatus && <p className="text-sm text-subText">{saveStatus}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
