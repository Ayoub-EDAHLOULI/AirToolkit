import { useMemo, useState } from "react";
import { FileCheck2, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { validateAgainstSchema } from "../lib/jsonSchemaValidate";

export default function JsonSchemaValidator() {
  const [schemaText, setSchemaText] = useState("");
  const [dataText, setDataText] = useState("");

  const { valid, issues, error } = useMemo(
    () => validateAgainstSchema(schemaText, dataText),
    [schemaText, dataText],
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <FileCheck2 className="text-primary" size={20} />
          <h2 className="font-semibold text-text">JSON Schema Validator</h2>
        </div>
        {(schemaText || dataText) && (
          <button
            onClick={() => {
              setSchemaText("");
              setDataText("");
            }}
            className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
            title="Clear"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            JSON Schema
          </div>
          <textarea
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            placeholder={
              '{\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" }\n  },\n  "required": ["name"]\n}'
            }
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            JSON Data
          </div>
          <textarea
            value={dataText}
            onChange={(e) => setDataText(e.target.value)}
            placeholder='{\n  "name": "example"\n}'
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="w-96 flex flex-col overflow-hidden bg-card shrink-0">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Result
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3">
            {error && (
              <p className="text-sm text-danger font-mono whitespace-pre-wrap">
                {error}
              </p>
            )}

            {!error && valid === null && (
              <p className="text-sm text-subText">
                Paste a JSON Schema and a JSON document to validate.
              </p>
            )}

            {!error && valid === true && (
              <div className="flex items-center gap-2 text-[color:var(--diff-add-text)]">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">
                  Valid — the document matches the schema.
                </span>
              </div>
            )}

            {!error && valid === false && (
              <>
                <div className="flex items-center gap-2 text-danger">
                  <XCircle size={18} />
                  <span className="text-sm font-medium">
                    Invalid — {issues.length} issue
                    {issues.length === 1 ? "" : "s"} found.
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {issues.map((issue, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border px-3 py-2"
                    >
                      <code className="text-xs font-mono text-primary">
                        {issue.path}
                      </code>
                      <p className="text-sm text-text mt-0.5">
                        {issue.message}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
