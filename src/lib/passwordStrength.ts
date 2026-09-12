import { COMMON_PASSWORDS } from "./commonPasswords";

export interface PasswordAnalysis {
  entropyBits: number;
  crackTimeSeconds: number;
  crackTimeLabel: string;
  score: 0 | 1 | 2 | 3 | 4;
  scoreLabel: string;
  warnings: string[];
}

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

function charsetSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 33; // common symbol set
  return size || 1;
}

function hasSequentialRun(password: string, minLength = 4): boolean {
  const lower = password.toLowerCase();
  for (let i = 0; i <= lower.length - minLength; i++) {
    let ascending = true;
    let descending = true;
    for (let j = 1; j < minLength; j++) {
      const diff = lower.charCodeAt(i + j) - lower.charCodeAt(i + j - 1);
      if (diff !== 1) ascending = false;
      if (diff !== -1) descending = false;
    }
    if (ascending || descending) return true;
  }
  return false;
}

function hasKeyboardWalk(password: string, minLength = 4): boolean {
  const lower = password.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i <= row.length - minLength; i++) {
      const forward = row.slice(i, i + minLength);
      const backward = [...forward].reverse().join("");
      if (lower.includes(forward) || lower.includes(backward)) return true;
    }
  }
  return false;
}

function hasRepeatedChars(password: string, minLength = 4): boolean {
  for (let i = 0; i <= password.length - minLength; i++) {
    const char = password[i];
    let allSame = true;
    for (let j = 1; j < minLength; j++) {
      if (password[i + j] !== char) {
        allSame = false;
        break;
      }
    }
    if (allSame) return true;
  }
  return false;
}

function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

function formatDuration(seconds: number): string {
  if (seconds < 1) return "instantly";

  const years = seconds / (60 * 60 * 24 * 365);
  if (years >= 1e6) return "millions of years";
  if (years >= 1) {
    const rounded =
      years >= 100 ? Math.round(years) : Math.round(years * 10) / 10;
    return `${rounded.toLocaleString()} ${rounded === 1 ? "year" : "years"}`;
  }

  const units: [string, string][] = [
    ["second", "seconds"],
    ["minute", "minutes"],
    ["hour", "hours"],
    ["day", "days"],
  ];
  const sizes = [60, 60, 24, 365];

  let value = seconds;
  let unitIndex = 0;
  for (let i = 0; i < sizes.length; i++) {
    if (value < sizes[i]) break;
    value /= sizes[i];
    unitIndex++;
  }

  const [singular, plural] = units[unitIndex];
  const rounded =
    value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${rounded === 1 ? singular : plural}`;
}

// Assumes an offline attacker at 10 billion guesses/second (roughly
// representative of a modern GPU cracking rig against a fast hash).
const GUESSES_PER_SECOND = 1e10;

const PASSWORD_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_=+";

// Generates a cryptographically random password (crypto.getRandomValues,
// not Math.random) drawn uniformly from a mixed alphabet. Ambiguous
// characters (0/O, 1/l/I) are excluded so the result is easier to
// transcribe by hand if needed.
export function generateStrongPassword(length = 16): string {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(
    bytes,
    (n) => PASSWORD_ALPHABET[n % PASSWORD_ALPHABET.length],
  ).join("");
}

export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return {
      entropyBits: 0,
      crackTimeSeconds: 0,
      crackTimeLabel: "instantly",
      score: 0,
      scoreLabel: "Empty",
      warnings: [],
    };
  }

  const warnings: string[] = [];

  if (isCommonPassword(password)) {
    warnings.push("This is one of the most commonly used passwords.");
  }
  if (hasRepeatedChars(password)) {
    warnings.push('Contains a run of repeated characters (e.g. "aaaa").');
  }
  if (hasSequentialRun(password)) {
    warnings.push('Contains a sequential run (e.g. "abcd", "1234").');
  }
  if (hasKeyboardWalk(password)) {
    warnings.push('Contains a keyboard pattern (e.g. "qwerty", "asdf").');
  }

  const pool = charsetSize(password);
  let entropyBits = password.length * Math.log2(pool);

  // Known weak patterns dramatically reduce real-world guessing
  // difficulty even though the raw character-pool entropy looks fine;
  // penalize entropy accordingly rather than just warning about it.
  if (isCommonPassword(password)) entropyBits = Math.min(entropyBits, 10);
  else if (warnings.length > 0) entropyBits *= 0.5;

  const crackTimeSeconds = Math.pow(2, entropyBits) / GUESSES_PER_SECOND;

  let score: PasswordAnalysis["score"];
  let scoreLabel: string;
  if (entropyBits < 28) {
    score = 0;
    scoreLabel = "Very Weak";
  } else if (entropyBits < 36) {
    score = 1;
    scoreLabel = "Weak";
  } else if (entropyBits < 60) {
    score = 2;
    scoreLabel = "Fair";
  } else if (entropyBits < 80) {
    score = 3;
    scoreLabel = "Strong";
  } else {
    score = 4;
    scoreLabel = "Very Strong";
  }

  return {
    entropyBits: Math.round(entropyBits * 10) / 10,
    crackTimeSeconds,
    crackTimeLabel: formatDuration(crackTimeSeconds),
    score,
    scoreLabel,
    warnings,
  };
}
