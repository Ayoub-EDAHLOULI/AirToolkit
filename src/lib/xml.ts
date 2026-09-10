export interface XmlResult {
  output: string;
  error: string | null;
}

function parseXml(input: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "application/xml");
  const parserError = doc.getElementsByTagName("parsererror")[0];
  if (parserError) {
    throw new Error(parserError.textContent?.trim() || "Malformed XML.");
  }
  return doc;
}

function indentNode(node: Node, depth: number, indentSize: number): string {
  const pad = " ".repeat(depth * indentSize);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    return text ? text : "";
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!--${node.textContent}-->`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  const attrs = Array.from(el.attributes)
    .map((a) => ` ${a.name}="${a.value}"`)
    .join("");

  const children = Array.from(el.childNodes).filter((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      return !!child.textContent?.trim();
    }
    return true;
  });

  if (children.length === 0) {
    return `${pad}<${el.tagName}${attrs} />`;
  }

  const onlyTextChild =
    children.length === 1 && children[0].nodeType === Node.TEXT_NODE;

  if (onlyTextChild) {
    return `${pad}<${el.tagName}${attrs}>${children[0].textContent?.trim()}</${el.tagName}>`;
  }

  const inner = children
    .map((child) => indentNode(child, depth + 1, indentSize))
    .filter(Boolean)
    .join("\n");

  return `${pad}<${el.tagName}${attrs}>\n${inner}\n${pad}</${el.tagName}>`;
}

export function formatXml(
  input: string,
  indentSize: number,
  minify: boolean,
): XmlResult {
  if (!input.trim()) return { output: "", error: null };

  try {
    const doc = parseXml(input);

    if (minify) {
      const serializer = new XMLSerializer();
      const raw = serializer.serializeToString(doc);
      return { output: raw.replace(/>\s+</g, "><").trim(), error: null };
    }

    const root = doc.documentElement;
    if (!root) return { output: "", error: null };
    return { output: indentNode(root, 0, indentSize), error: null };
  } catch (err) {
    return { output: "", error: (err as Error).message };
  }
}
