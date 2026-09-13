import { useMemo, useState } from "react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  AlertTriangle,
  Wand2,
  X,
} from "lucide-react";
import {
  analyzePassword,
  generateStrongPassword,
} from "../lib/passwordStrength";

const SCORE_COLORS = [
  "var(--diff-remove-text)",
  "var(--diff-remove-text)",
  "#f59e0b",
  "var(--diff-add-text)",
  "var(--diff-add-text)",
];

export default function PasswordChecker() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  const analysis = useMemo(() => analyzePassword(password), [password]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <LockKeyhole className="text-primary" size={20} />
        <h2 className="font-semibold text-text">Password Strength Checker</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-xl flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-subText">
                Password
              </label>
              <button
                onClick={() => {
                  setPassword(generateStrongPassword());
                  setVisible(true);
                }}
                className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity"
              >
                <Wand2 size={12} />
                Suggest a strong password
              </button>
            </div>
            <div className="relative">
              <input
                type={visible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type a password to analyze..."
                spellCheck={false}
                className="w-full rounded-lg border border-border bg-card pl-3 pr-16 py-2 font-mono text-sm text-text outline-none placeholder:text-subText"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {password && (
                  <button
                    onClick={() => setPassword("")}
                    className="text-subText hover:text-text transition-colors"
                    title="Clear"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  onClick={() => setVisible((v) => !v)}
                  className="text-subText hover:text-text transition-colors"
                >
                  {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <p className="text-xs text-subText">
              This runs entirely on your device — nothing is sent anywhere.
            </p>
          </div>

          {password && (
            <>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text">
                    {analysis.scoreLabel}
                  </span>
                  <span className="text-xs text-subText">
                    {analysis.entropyBits} bits of entropy
                  </span>
                </div>
                <div className="h-2 rounded-full bg-inputBg overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${((analysis.score + 1) / 5) * 100}%`,
                      backgroundColor: SCORE_COLORS[analysis.score],
                    }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-1">
                <span className="text-xs text-subText">
                  Estimated crack time (offline attack, ~10B guesses/sec)
                </span>
                <span className="text-lg font-semibold text-text">
                  {analysis.crackTimeLabel}
                </span>
              </div>

              {analysis.warnings.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-2">
                  {analysis.warnings.map((warning) => (
                    <div
                      key={warning}
                      className="flex items-start gap-2 text-sm text-danger"
                    >
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
