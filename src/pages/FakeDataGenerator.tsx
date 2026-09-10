import { useState } from "react";
import { faker } from "@faker-js/faker";
import { Sparkles, Copy, Check, RefreshCw } from "lucide-react";

type FieldKey = "name" | "email" | "uuid" | "address" | "phone" | "company";

interface FieldDef {
  key: FieldKey;
  label: string;
  generate: () => string;
}

const FIELDS: FieldDef[] = [
  { key: "name", label: "Name", generate: () => faker.person.fullName() },
  { key: "email", label: "Email", generate: () => faker.internet.email() },
  { key: "uuid", label: "UUID", generate: () => faker.string.uuid() },
  {
    key: "address",
    label: "Address",
    generate: () => faker.location.streetAddress({ useFullAddress: true }),
  },
  { key: "phone", label: "Phone", generate: () => faker.phone.number() },
  { key: "company", label: "Company", generate: () => faker.company.name() },
];

type OutputFormat = "json" | "csv";

function toCsv(rows: Record<string, string>[], fields: FieldKey[]): string {
  const escape = (value: string) => {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };
  const header = fields.join(",");
  const lines = rows.map((row) => fields.map((f) => escape(row[f])).join(","));
  return [header, ...lines].join("\n");
}

export default function FakeDataGenerator() {
  const [selected, setSelected] = useState<Set<FieldKey>>(
    new Set(["name", "email", "uuid"]),
  );
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<OutputFormat>("json");
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [copied, setCopied] = useState(false);

  const toggleField = (key: FieldKey) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const generate = () => {
    const n = Math.min(Math.max(count, 1), 100);
    const activeFields = FIELDS.filter((f) => selected.has(f.key));
    const generated = Array.from({ length: n }, () => {
      const row: Record<string, string> = {};
      for (const field of activeFields) {
        row[field.key] = field.generate();
      }
      return row;
    });
    setRows(generated);
  };

  const activeKeys = FIELDS.filter((f) => selected.has(f.key)).map(
    (f) => f.key,
  );
  const output =
    rows.length === 0
      ? ""
      : format === "json"
        ? JSON.stringify(rows, null, 2)
        : toCsv(rows, activeKeys);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <Sparkles className="text-primary" size={20} />
        <h2 className="font-semibold text-text">Fake Data Generator</h2>
      </div>

      <div className="flex flex-col gap-3 px-6 py-3 border-b border-border shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {FIELDS.map((field) => (
            <button
              key={field.key}
              onClick={() => toggleField(field.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border border-border transition-colors ${
                selected.has(field.key)
                  ? "bg-primary text-white border-primary"
                  : "text-subText hover:bg-inputBg"
              }`}
            >
              {field.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-subText">Count</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-text outline-none"
          />

          <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
            {(["json", "csv"] as OutputFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-3 py-1.5 uppercase transition-colors ${
                  format === f
                    ? "bg-primary text-white"
                    : "text-subText hover:bg-inputBg"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={selected.size === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <RefreshCw size={14} />
            Generate
          </button>

          {output && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-subText hover:bg-inputBg transition-colors ml-auto"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar bg-card">
        {output ? (
          <pre className="p-4 font-mono text-sm text-text whitespace-pre-wrap break-words">
            {output}
          </pre>
        ) : (
          <p className="p-4 text-sm text-subText">
            Pick fields and click Generate.
          </p>
        )}
      </div>
    </div>
  );
}
