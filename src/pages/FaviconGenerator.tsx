import { useRef, useState } from "react";
import { ImageIcon, Upload, Download, FolderDown } from "lucide-react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { buildIco } from "../lib/ico";

const SIZES = [16, 32, 48, 64, 128, 180, 192, 512];
const ICO_SIZES = [16, 32, 48];

interface GeneratedIcon {
  size: number;
  dataUrl: string;
  png: Uint8Array;
}

function resizeToPng(
  img: HTMLImageElement,
  size: number,
): { dataUrl: string; png: Uint8Array } {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);

  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const png = Uint8Array.from(binary, (c) => c.charCodeAt(0));

  return { dataUrl, png };
}

export default function FaviconGenerator() {
  const [icons, setIcons] = useState<GeneratedIcon[]>([]);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setStatus(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const generated = SIZES.map((size) => ({
          size,
          ...resizeToPng(img, size),
        }));
        setIcons(generated);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAllPng = async () => {
    if (icons.length === 0) return;
    setStatus(null);

    const folder = await open({ directory: true });
    if (!folder) return;

    try {
      for (const icon of icons) {
        const path = await join(folder, `icon-${icon.size}x${icon.size}.png`);
        await writeFile(path, icon.png);
      }
      setStatus(`Saved ${icons.length} PNG files.`);
    } catch (err) {
      setStatus(`Failed to save: ${(err as Error).message}`);
    }
  };

  const handleSaveIco = async () => {
    if (icons.length === 0) return;
    setStatus(null);

    const icoImages = ICO_SIZES.map(
      (size) => icons.find((i) => i.size === size)!,
    ).filter(Boolean);

    const path = await save({
      defaultPath: "favicon.ico",
      filters: [{ name: "ICO Image", extensions: ["ico"] }],
    });
    if (!path) return;

    try {
      const ico = buildIco(icoImages);
      await writeFile(path, ico);
      setStatus("Saved favicon.ico.");
    } catch (err) {
      setStatus(`Failed to save: ${(err as Error).message}`);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <ImageIcon className="text-primary" size={20} />
        <h2 className="font-semibold text-text">Favicon Generator</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-3xl flex flex-col gap-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-subText hover:bg-inputBg hover:border-primary transition-colors"
          >
            <Upload size={18} />
            {fileName || "Choose an image..."}
          </button>

          {icons.length > 0 && (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveAllPng}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity"
                >
                  <FolderDown size={14} />
                  Save all PNGs to folder
                </button>
                <button
                  onClick={handleSaveIco}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-subText hover:bg-inputBg transition-colors"
                >
                  <Download size={14} />
                  Save favicon.ico
                </button>
              </div>

              {status && <p className="text-sm text-subText">{status}</p>}

              <div className="grid grid-cols-4 gap-4">
                {icons.map((icon) => (
                  <div
                    key={icon.size}
                    className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3"
                  >
                    <img
                      src={icon.dataUrl}
                      alt={`${icon.size}x${icon.size}`}
                      className="w-16 h-16 object-contain"
                      style={{
                        imageRendering: icon.size <= 32 ? "pixelated" : "auto",
                      }}
                    />
                    <span className="text-xs text-subText">
                      {icon.size}×{icon.size}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
