import { useMemo, useState } from "react";
import { FileText, Copy, Check, Trash2 } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";

const PLACEHOLDER = `# Heading

Some **bold** and *italic* text, plus \`inline code\`.

- item one
- item two

\`\`\`js
console.log("hello");
\`\`\`

> A quote.

[A link](https://example.com)
`;

marked.setOptions({ gfm: true, breaks: false });

function renderMarkdown(source: string): string {
  const rawHtml = marked.parse(source, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml);
}

export default function MarkdownPreviewer() {
  const [source, setSource] = useState("");
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => renderMarkdown(source), [source]);

  const handleCopyHtml = async () => {
    if (!html) return;
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="text-primary" size={20} />
          <h2 className="font-semibold text-text">Markdown Previewer</h2>
        </div>
        <button
          onClick={() => setSource("")}
          className="p-2 rounded-lg text-subText hover:bg-inputBg transition-colors"
          title="Clear"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Source
          </div>
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            <span>Preview</span>
            {source && (
              <button
                onClick={handleCopyHtml}
                className="flex items-center gap-1 text-subText hover:text-text transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied HTML" : "Copy HTML"}
              </button>
            )}
          </div>
          <div
            className="flex-1 overflow-auto custom-scrollbar p-4 markdown-preview"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
