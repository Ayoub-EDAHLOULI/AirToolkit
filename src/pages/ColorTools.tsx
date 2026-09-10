import { useState } from "react";
import { Palette, Copy, Check } from "lucide-react";
import {
  type RGB,
  type HSL,
  type CMYK,
  parseHex,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToCmyk,
  cmykToRgb,
  parseRgbString,
  parseHslString,
  parseCmykString,
} from "../lib/color";

function CopyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-subText">{label}</label>
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-text outline-none"
        />
        <button
          onClick={handleCopy}
          className="shrink-0 p-2 rounded-lg text-subText hover:bg-inputBg hover:text-text transition-colors"
          title="Copy"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}

const DEFAULT_RGB: RGB = { r: 29, g: 99, b: 237 };

export default function ColorTools() {
  const [rgb, setRgb] = useState<RGB>(DEFAULT_RGB);
  const [error, setError] = useState<string | null>(null);

  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  const cmyk = rgbToCmyk(rgb);

  const hexString = hex;
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  const cmykString = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

  const handleHexChange = (value: string) => {
    const parsed = parseHex(value);
    if (parsed) {
      setRgb(parsed);
      setError(null);
    } else {
      setError("Invalid hex color.");
    }
  };

  const handleRgbChange = (value: string) => {
    const parsed = parseRgbString(value);
    if (parsed) {
      setRgb(parsed);
      setError(null);
    } else {
      setError("Invalid RGB — use rgb(r, g, b).");
    }
  };

  const handleHslChange = (value: string) => {
    const parsed = parseHslString(value);
    if (parsed) {
      setRgb(hslToRgb(parsed as HSL));
      setError(null);
    } else {
      setError("Invalid HSL — use hsl(h, s%, l%).");
    }
  };

  const handleCmykChange = (value: string) => {
    const parsed = parseCmykString(value);
    if (parsed) {
      setRgb(cmykToRgb(parsed as CMYK));
      setError(null);
    } else {
      setError("Invalid CMYK — use cmyk(c%, m%, y%, k%).");
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <Palette className="text-primary" size={20} />
        <h2 className="font-semibold text-text">Color Tools</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-xl flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={hex}
              onChange={(e) => {
                const parsed = parseHex(e.target.value);
                if (parsed) setRgb(parsed);
              }}
              className="w-16 h-16 rounded-lg border border-border cursor-pointer bg-transparent"
            />
            <div
              className="flex-1 h-16 rounded-lg border border-border"
              style={{ backgroundColor: hexString }}
            />
          </div>

          <CopyField label="HEX" value={hexString} onChange={handleHexChange} />
          <CopyField label="RGB" value={rgbString} onChange={handleRgbChange} />
          <CopyField label="HSL" value={hslString} onChange={handleHslChange} />
          <CopyField
            label="CMYK"
            value={cmykString}
            onChange={handleCmykChange}
          />

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}
