// Minimal, dependency-free MD5 implementation (RFC 1321).
// Web Crypto's SubtleCrypto does not support MD5, and this app makes
// no network calls, so MD5 support has to be self-contained.

function rotateLeft(x: number, c: number): number {
  return (x << c) | (x >>> (32 - c));
}

function toUtf8Bytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

const K = Array.from({ length: 64 }, (_, i) =>
  Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32),
);

const SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
  9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
  16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
  21,
];

export function md5(input: string): string {
  const message = toUtf8Bytes(input);
  const originalLengthBits = message.length * 8;

  const withPadding = new Uint8Array((((message.length + 8) >> 6) + 1) * 64);
  withPadding.set(message);
  withPadding[message.length] = 0x80;

  const view = new DataView(withPadding.buffer);
  view.setUint32(withPadding.length - 8, originalLengthBits >>> 0, true);
  view.setUint32(
    withPadding.length - 4,
    Math.floor(originalLengthBits / 2 ** 32),
    true,
  );

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let chunkStart = 0; chunkStart < withPadding.length; chunkStart += 64) {
    const M = new Array<number>(16);
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(chunkStart + j * 4, true);
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;

      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }

      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + rotateLeft(F, SHIFTS[i])) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const toLittleEndianHex = (n: number) => {
    const bytes = [
      n & 0xff,
      (n >>> 8) & 0xff,
      (n >>> 16) & 0xff,
      (n >>> 24) & 0xff,
    ];
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  return (
    toLittleEndianHex(a0) +
    toLittleEndianHex(b0) +
    toLittleEndianHex(c0) +
    toLittleEndianHex(d0)
  );
}
