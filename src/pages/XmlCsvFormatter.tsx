import { useMemo, useState } from "react";
import { FileCode, Copy, Check, Trash2 } from "lucide-react";
import { formatXml } from "../lib/xml";
import { parseCsv } from "../lib/csv";

type Mode = "xml" | "csv";
type IndentSize = 2 | 4;

function XmlPanel() {
  const [raw, setRaw] = useState("");
  const [indent, setIndent] = useState<IndentSize>(2);
  const [minify, setMinify] = useState(false);
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(
    () => formatXml(raw, indent, minify),
    [raw, indent, minify],
  );

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
          {([2, 4] as IndentSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setIndent(size)}
              disabled={minify}
              className={`px-3 py-1.5 transition-colors disabled:opacity-40 ${
                indent === size && !minify
                  ? "bg-primary text-white"
                  : "text-subText hover:bg-inputBg"
              }`}
            >
              {size} spaces
            </button>
          ))}
        </div>
        <button
          onClick={() => setMinify((m) => !m)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border border-border transition-colors ${
            minify
              ? "bg-primary text-white border-primary"
              : "text-subText hover:bg-inputBg"
          }`}
        >
          Minify
        </button>
        <button
          onClick={() => setRaw("")}
          className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors ml-auto"
          title="Clear"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Input
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Paste your XML here..."
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
    </>
  );
}

function CsvPanel() {
  const [raw, setRaw] = useState("");
  const [delimiter, setDelimiter] = useState(",");

  const { rows, error } = useMemo(
    () => parseCsv(raw, delimiter),
    [raw, delimiter],
  );

  return (
    <>
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border shrink-0">
        <label className="text-sm text-subText">Delimiter</label>
        <input
          value={delimiter}
          onChange={(e) => setDelimiter(e.target.value.slice(0, 1))}
          maxLength={1}
          className="w-12 text-center rounded-lg border border-border bg-card px-2 py-1.5 font-mono text-sm text-text outline-none"
        />
        <button
          onClick={() => setRaw("")}
          className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors ml-auto"
          title="Clear"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Input
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Paste your CSV here..."
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Table
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            {error ? (
              <div className="p-4 text-sm text-danger font-mono whitespace-pre-wrap">
                {error}
              </div>
            ) : rows.length === 0 ? (
              <p className="p-4 text-sm text-subText">—</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {rows[0].map((cell, i) => (
                      <th
                        key={i}
                        className="text-left px-3 py-2 border-b border-border font-semibold text-text sticky top-0 bg-card"
                      >
                        {cell || ` `}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((r, ri) => (
                    <tr key={ri} className="hover:bg-inputBg">
                      {r.map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-3 py-1.5 border-b border-border text-text"
                        >
                          {cell || ` `}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function XmlCsvFormatter() {
  const [mode, setMode] = useState<Mode>("xml");

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <FileCode className="text-primary" size={20} />
          <h2 className="font-semibold text-text">XML / CSV Formatter</h2>
        </div>

        <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
          <button
            onClick={() => setMode("xml")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "xml"
                ? "bg-primary text-white"
                : "text-subText hover:bg-inputBg"
            }`}
          >
            XML
          </button>
          <button
            onClick={() => setMode("csv")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "csv"
                ? "bg-primary text-white"
                : "text-subText hover:bg-inputBg"
            }`}
          >
            CSV
          </button>
        </div>
      </div>

      {mode === "xml" ? <XmlPanel /> : <CsvPanel />}
    </div>
  );
}
