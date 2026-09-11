import { useRef, useState } from "react";
import { Palette as PaletteIcon, Upload, Copy, Check } from "lucide-react";
import { extractDominantColors } from "../lib/colorQuantize";

interface Swatch {
  hex: string;
  percentage: number;
}

const COLOR_COUNT = 6;
const SAMPLE_SIZE = 100; // downscale for speed; color distribution is preserved

function SwatchCard({ swatch }: { swatch: Swatch }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(swatch.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex flex-col overflow-hidden rounded-lg border border-border text-left hover:border-primary transition-colors"
    >
      <div className="h-20" style={{ backgroundColor: swatch.hex }} />
      <div className="flex items-center justify-between px-3 py-2 bg-card">
        <div className="flex flex-col">
          <span className="font-mono text-sm text-text">{swatch.hex}</span>
          <span className="text-xs text-subText">
            {swatch.percentage.toFixed(1)}%
          </span>
        </div>
        {copied ? (
          <Check size={14} className="text-primary" />
        ) : (
          <Copy size={14} className="text-subText" />
        )}
      </div>
    </button>
  );
}

export default function PaletteExtractor() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);

      const img = new Image();
      img.onload = () => {
        const scale = Math.min(
          1,
          SAMPLE_SIZE / Math.max(img.width, img.height),
        );
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);

        const { data } = ctx.getImageData(0, 0, w, h);
        const colors = extractDominantColors(data, COLOR_COUNT);
        setSwatches(colors);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <PaletteIcon className="text-primary" size={20} />
        <h2 className="font-semibold text-text">Color Palette Extractor</h2>
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

          {imageUrl && (
            <div className="flex flex-col gap-4 md:flex-row">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="w-full md:w-64 rounded-lg border border-border object-contain max-h-64"
              />

              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {swatches.map((swatch) => (
                  <SwatchCard key={swatch.hex} swatch={swatch} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
