export interface CidrInfo {
  networkAddress: string;
  broadcastAddress: string;
  firstUsable: string | null;
  lastUsable: string | null;
  usableHostCount: number;
  totalHostCount: number;
  subnetMask: string;
  wildcardMask: string;
  prefixLength: number;
}

function parseIpv4(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;

  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    value = (value << 8) | n;
  }
  return value >>> 0;
}

function ipv4ToString(value: number): string {
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ].join(".");
}

export function calculateCidr(input: string): CidrInfo | null {
  const match = input.trim().match(/^(.+)\/(\d{1,2})$/);
  if (!match) return null;

  const [, ipStr, prefixStr] = match;
  const prefixLength = Number(prefixStr);
  if (prefixLength < 0 || prefixLength > 32) return null;

  const ip = parseIpv4(ipStr);
  if (ip === null) return null;

  // Build the subnet mask; special-case /0 since `<<32` is a no-op in JS
  // (shift amounts are taken mod 32), which would otherwise produce a
  // mask of all-ones instead of all-zeros.
  const mask =
    prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;
  const wildcard = ~mask >>> 0;

  const networkAddress = (ip & mask) >>> 0;
  const broadcastAddress = (networkAddress | wildcard) >>> 0;

  const totalHostCount = 2 ** (32 - prefixLength);
  const usableHostCount =
    prefixLength >= 31 ? 0 : Math.max(0, totalHostCount - 2);

  const firstUsable =
    prefixLength >= 31 ? null : ipv4ToString((networkAddress + 1) >>> 0);
  const lastUsable =
    prefixLength >= 31 ? null : ipv4ToString((broadcastAddress - 1) >>> 0);

  return {
    networkAddress: ipv4ToString(networkAddress),
    broadcastAddress: ipv4ToString(broadcastAddress),
    firstUsable,
    lastUsable,
    usableHostCount,
    totalHostCount,
    subnetMask: ipv4ToString(mask),
    wildcardMask: ipv4ToString(wildcard),
    prefixLength,
  };
}
