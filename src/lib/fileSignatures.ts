export interface FileSignature {
  name: string;
  extension: string;
  match: (bytes: Uint8Array) => boolean;
}

function bytesMatch(
  bytes: Uint8Array,
  offset: number,
  pattern: number[],
): boolean {
  if (bytes.length < offset + pattern.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    if (bytes[offset + i] !== pattern[i]) return false;
  }
  return true;
}

function asciiAt(bytes: Uint8Array, offset: number, text: string): boolean {
  const pattern = Array.from(text, (c) => c.charCodeAt(0));
  return bytesMatch(bytes, offset, pattern);
}

const SIGNATURES: FileSignature[] = [
  {
    name: "PNG image",
    extension: "png",
    match: (b) =>
      bytesMatch(b, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  {
    name: "JPEG image",
    extension: "jpg",
    match: (b) => bytesMatch(b, 0, [0xff, 0xd8, 0xff]),
  },
  {
    name: "GIF image",
    extension: "gif",
    match: (b) => asciiAt(b, 0, "GIF87a") || asciiAt(b, 0, "GIF89a"),
  },
  { name: "BMP image", extension: "bmp", match: (b) => asciiAt(b, 0, "BM") },
  {
    name: "WebP image",
    extension: "webp",
    match: (b) => asciiAt(b, 0, "RIFF") && asciiAt(b, 8, "WEBP"),
  },
  {
    name: "ICO icon",
    extension: "ico",
    match: (b) => bytesMatch(b, 0, [0x00, 0x00, 0x01, 0x00]),
  },
  {
    name: "PDF document",
    extension: "pdf",
    match: (b) => asciiAt(b, 0, "%PDF-"),
  },
  {
    name: "ZIP archive",
    extension: "zip",
    match: (b) =>
      bytesMatch(b, 0, [0x50, 0x4b, 0x03, 0x04]) ||
      bytesMatch(b, 0, [0x50, 0x4b, 0x05, 0x06]),
  },
  {
    name: "GZIP archive",
    extension: "gz",
    match: (b) => bytesMatch(b, 0, [0x1f, 0x8b]),
  },
  {
    name: "7-Zip archive",
    extension: "7z",
    match: (b) => bytesMatch(b, 0, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]),
  },
  {
    name: "TAR archive",
    extension: "tar",
    match: (b) => asciiAt(b, 257, "ustar"),
  },
  {
    name: "RAR archive",
    extension: "rar",
    match: (b) => bytesMatch(b, 0, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]),
  },
  {
    name: "ELF executable",
    extension: "elf",
    match: (b) => bytesMatch(b, 0, [0x7f, 0x45, 0x4c, 0x46]),
  },
  {
    name: "Windows PE executable (EXE/DLL)",
    extension: "exe",
    match: (b) => asciiAt(b, 0, "MZ"),
  },
  {
    name: "Java class file",
    extension: "class",
    match: (b) => bytesMatch(b, 0, [0xca, 0xfe, 0xba, 0xbe]),
  },
  {
    name: "SQLite database",
    extension: "sqlite",
    match: (b) => asciiAt(b, 0, "SQLite format 3\0"),
  },
  {
    name: "WAV audio",
    extension: "wav",
    match: (b) => asciiAt(b, 0, "RIFF") && asciiAt(b, 8, "WAVE"),
  },
  {
    name: "MP3 audio",
    extension: "mp3",
    match: (b) =>
      bytesMatch(b, 0, [0x49, 0x44, 0x33]) || bytesMatch(b, 0, [0xff, 0xfb]),
  },
  { name: "OGG media", extension: "ogg", match: (b) => asciiAt(b, 0, "OggS") },
  { name: "MP4 video", extension: "mp4", match: (b) => asciiAt(b, 4, "ftyp") },
  {
    name: "TrueType font",
    extension: "ttf",
    match: (b) => bytesMatch(b, 0, [0x00, 0x01, 0x00, 0x00, 0x00]),
  },
  { name: "WOFF font", extension: "woff", match: (b) => asciiAt(b, 0, "wOFF") },
  {
    name: "WOFF2 font",
    extension: "woff2",
    match: (b) => asciiAt(b, 0, "wOF2"),
  },
];

export function detectFileType(bytes: Uint8Array): FileSignature | null {
  for (const sig of SIGNATURES) {
    if (sig.match(bytes)) return sig;
  }
  return null;
}

export function isLikelyText(bytes: Uint8Array, sampleSize = 2048): boolean {
  const sample = bytes.subarray(0, Math.min(sampleSize, bytes.length));
  if (sample.length === 0) return true;

  let controlChars = 0;
  for (const byte of sample) {
    // NUL byte is a strong binary indicator.
    if (byte === 0) return false;
    // Allow common whitespace control chars (tab, LF, CR); count others.
    if (byte < 0x09 || (byte > 0x0d && byte < 0x20)) controlChars++;
  }

  return controlChars / sample.length < 0.05;
}
