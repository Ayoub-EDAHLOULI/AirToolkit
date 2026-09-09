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
];
