import { useRef, useState } from "react";
import { ScanLine, Upload, Copy, Check } from "lucide-react";
import jsQR from "jsqr";

export default function QrCodeReader() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    setDecoded(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const { data, width, height } = ctx.getImageData(
          0,
          0,
          img.width,
          img.height,
        );
        const result = jsQR(data, width, height);

        if (result) {
          setDecoded(result.data);
        } else {
          setError("No QR code found in this image.");
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async () => {
    if (!decoded) return;
    await navigator.clipboard.writeText(decoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <ScanLine className="text-primary" size={20} />
        <h2 className="font-semibold text-text">QR Code Reader</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-xl flex flex-col gap-4">
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
            {fileName || "Choose an image with a QR code..."}
          </button>

          {imageUrl && (
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full max-h-64 object-contain rounded-lg border border-border"
            />
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          {decoded && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-subText">
                  Decoded text
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-subText hover:text-text transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-sm text-text font-mono break-all whitespace-pre-wrap">
                {decoded}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
