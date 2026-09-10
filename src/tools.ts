import {
  Braces,
  Regex,
  Binary,
  Hash,
  KeyRound,
  GitCompare,
  Clock,
  CaseSensitive,
  Calculator,
  FileCode,
  Palette,
  FileText,
  Database,
  Sparkles,
  QrCode,
  type LucideIcon,
} from "lucide-react";

export interface ToolDef {
  path: string;
  label: string;
  icon: LucideIcon;
}

export const tools: ToolDef[] = [
  { path: "/json", label: "JSON Formatter", icon: Braces },
  { path: "/regex", label: "Regex Tester", icon: Regex },
  { path: "/encode", label: "Encode / Decode", icon: Binary },
  { path: "/hash", label: "Hash / UUID Generator", icon: Hash },
  { path: "/jwt", label: "JWT Decoder", icon: KeyRound },
  { path: "/diff", label: "Diff Tool", icon: GitCompare },
  { path: "/timestamp", label: "Timestamp Converter", icon: Clock },
  { path: "/case", label: "Case Converter", icon: CaseSensitive },
  { path: "/base", label: "Number Base Converter", icon: Calculator },
  { path: "/xml-csv", label: "XML / CSV Formatter", icon: FileCode },
  { path: "/color", label: "Color Tools", icon: Palette },
  { path: "/markdown", label: "Markdown Previewer", icon: FileText },
  { path: "/sql", label: "SQL Formatter", icon: Database },
  { path: "/fake-data", label: "Fake Data Generator", icon: Sparkles },
  { path: "/qr", label: "QR Code Generator", icon: QrCode },
];
