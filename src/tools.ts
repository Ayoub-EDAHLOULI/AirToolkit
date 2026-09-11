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
  CalendarClock,
  ShieldCheck,
  ImageIcon,
  Pipette,
  ScanLine,
  Globe,
  Link2,
  Network,
  TextCursorInput,
  LockKeyhole,
  Terminal,
  FileDiff,
  FileJson2,
  type LucideIcon,
} from "lucide-react";

export interface ToolDef {
  path: string;
  label: string;
  icon: LucideIcon;
  category: Category;
}

export const CATEGORIES = [
  "Formatters & Text",
  "Generators",
  "Security",
  "Network & Config",
  "Converters & Media",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const tools: ToolDef[] = [
  // Formatters & Text
  { path: "/json", label: "JSON Formatter", icon: Braces, category: "Formatters & Text" },
  { path: "/xml-csv", label: "XML / CSV Formatter", icon: FileCode, category: "Formatters & Text" },
  { path: "/sql", label: "SQL Formatter", icon: Database, category: "Formatters & Text" },
  { path: "/markdown", label: "Markdown Previewer", icon: FileText, category: "Formatters & Text" },
  { path: "/json-yaml", label: "JSON ↔ YAML / TOML", icon: FileJson2, category: "Formatters & Text" },
  { path: "/regex", label: "Regex Tester", icon: Regex, category: "Formatters & Text" },
  { path: "/diff", label: "Diff Tool", icon: GitCompare, category: "Formatters & Text" },
  { path: "/case", label: "Case Converter", icon: CaseSensitive, category: "Formatters & Text" },
  { path: "/text", label: "Text Utilities", icon: TextCursorInput, category: "Formatters & Text" },
  { path: "/encode", label: "Encode / Decode", icon: Binary, category: "Formatters & Text" },
  { path: "/log-parser", label: "Log Parser / Grep", icon: Terminal, category: "Formatters & Text" },

  // Generators
  { path: "/hash", label: "Hash / UUID Generator", icon: Hash, category: "Generators" },
  { path: "/fake-data", label: "Fake Data Generator", icon: Sparkles, category: "Generators" },
  { path: "/qr", label: "QR Code Generator", icon: QrCode, category: "Generators" },
  { path: "/favicon", label: "Favicon Generator", icon: ImageIcon, category: "Generators" },

  // Security
  { path: "/jwt", label: "JWT Decoder", icon: KeyRound, category: "Security" },
  { path: "/cert", label: "X.509 Certificate Decoder", icon: ShieldCheck, category: "Security" },
  { path: "/password", label: "Password Strength Checker", icon: LockKeyhole, category: "Security" },

  // Network & Config
  { path: "/api-tester", label: "API Request Tester", icon: Globe, category: "Network & Config" },
  { path: "/url", label: "URL Parser / Builder", icon: Link2, category: "Network & Config" },
  { path: "/cidr", label: "Subnet / CIDR Calculator", icon: Network, category: "Network & Config" },
  { path: "/cron", label: "Cron Explainer", icon: CalendarClock, category: "Network & Config" },
  { path: "/dotenv-diff", label: "dotenv Diff & Validator", icon: FileDiff, category: "Network & Config" },

  // Converters & Media
  { path: "/timestamp", label: "Timestamp Converter", icon: Clock, category: "Converters & Media" },
  { path: "/base", label: "Number Base Converter", icon: Calculator, category: "Converters & Media" },
  { path: "/color", label: "Color Tools", icon: Palette, category: "Converters & Media" },
  { path: "/palette", label: "Color Palette Extractor", icon: Pipette, category: "Converters & Media" },
  { path: "/qr-reader", label: "QR Code Reader", icon: ScanLine, category: "Converters & Media" },
];
