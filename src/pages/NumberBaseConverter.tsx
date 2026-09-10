import { useState } from "react";
import { Calculator, Copy, Check, Trash2 } from "lucide-react";

type Base = 2 | 8 | 10 | 16;

interface BaseField {
  base: Base;
  label: string;
  prefix: string;
  pattern: RegExp;
}

const FIELDS: BaseField[] = [
  { base: 2, label: "Binary", prefix: "0b", pattern: /^[01]*$/ },
  { base: 8, label: "Octal", prefix: "0o", pattern: /^[0-7]*$/ },
  { base: 10, label: "Decimal", prefix: "", pattern: /^[0-9]*$/ },
  { base: 16, label: "Hexadecimal", prefix: "0x", pattern: /^[0-9a-fA-F]*$/ },
];

function toAllBases(value: bigint): Record<Base, string> {
  return {
    2: value.toString(2),
    8: value.toString(8),
    10: value.toString(10),
    16: value.toString(16).toUpperCase(),
  };
}

export default function NumberBaseConverter() {
  const [values, setValues] = useState<Record<Base, string>>({
    2: "",
    8: "",
    10: "",
    16: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [copiedBase, setCopiedBase] = useState<Base | null>(null);

  const handleChange = (base: Base, raw: string) => {
    const field = FIELDS.find((f) => f.base === base)!;

    if (!field.pattern.test(raw)) {
      return;
    }

    if (!raw) {
      setValues({ 2: "", 8: "", 10: "", 16: "" });
      setError(null);
      return;
    }

    try {
      const parsed = BigInt(
        base === 10 ? raw : `${field.prefix}${raw}`,
      );
      setValues(toAllBases(parsed));
      setError(null);
    } catch {
      setError("Invalid number for this base.");
    }
  };

  const handleCopy = async (base: Base) => {
    const value = values[base];
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedBase(base);
    setTimeout(() => setCopiedBase(null), 1500);
  };

  const clear = () => {
    setValues({ 2: "", 8: "", 10: "", 16: "" });
    setError(null);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Calculator className="text-primary" size={20} />
          <h2 className="font-semibold text-text">Number Base Converter</h2>
        </div>
        <button
          onClick={clear}
          className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
          title="Clear"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-xl flex flex-col gap-4">
          {FIELDS.map((field) => (
            <div key={field.base} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-subText">
                {field.label} (base {field.base})
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={values[field.base]}
                  onChange={(e) => handleChange(field.base, e.target.value)}
                  placeholder={field.prefix ? `${field.prefix}...` : "0"}
                  spellCheck={false}
                  className="flex-1 rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-text outline-none placeholder:text-subText"
                />
                {values[field.base] && (
                  <button
                    onClick={() => handleCopy(field.base)}
                    className="shrink-0 p-2 rounded-lg text-subText hover:bg-inputBg hover:text-text transition-colors"
                    title="Copy"
                  >
                    {copiedBase === field.base ? (
                      <Check size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </div>
    </div>
  );
}
