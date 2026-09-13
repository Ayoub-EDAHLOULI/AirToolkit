import {
  X509CertificateGenerator,
  Pkcs10CertificateRequestGenerator,
  SubjectAlternativeNameExtension,
  BasicConstraintsExtension,
  KeyUsagesExtension,
  KeyUsageFlags,
  cryptoProvider,
  type Extension,
} from "@peculiar/x509";

cryptoProvider.set(crypto);

export type KeyAlgorithm = "RSA-2048" | "RSA-4096" | "ECDSA-P256";

export interface CertSubject {
  commonName: string;
  organization: string;
  organizationalUnit: string;
  country: string;
  state: string;
  locality: string;
}

export interface GenerateOptions {
  subject: CertSubject;
  keyAlgorithm: KeyAlgorithm;
  validityDays: number;
  sans: string[];
}

export interface GenerateResult {
  privateKeyPem: string;
  publicKeyPem: string;
  outputPem: string;
}

function buildSubjectName(subject: CertSubject): string {
  const parts: string[] = [];
  if (subject.commonName) parts.push(`CN=${subject.commonName}`);
  if (subject.organization) parts.push(`O=${subject.organization}`);
  if (subject.organizationalUnit)
    parts.push(`OU=${subject.organizationalUnit}`);
  if (subject.locality) parts.push(`L=${subject.locality}`);
  if (subject.state) parts.push(`ST=${subject.state}`);
  if (subject.country) parts.push(`C=${subject.country}`);
  return parts.join(",");
}

function keyGenAlgorithm(
  alg: KeyAlgorithm,
): RsaHashedKeyGenParams | EcKeyGenParams {
  switch (alg) {
    case "RSA-2048":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
        publicExponent: new Uint8Array([1, 0, 1]),
        modulusLength: 2048,
      };
    case "RSA-4096":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
        publicExponent: new Uint8Array([1, 0, 1]),
        modulusLength: 4096,
      };
    case "ECDSA-P256":
      return { name: "ECDSA", namedCurve: "P-256" };
  }
}

function signingAlgorithm(alg: KeyAlgorithm) {
  if (alg === "ECDSA-P256") return { name: "ECDSA", hash: "SHA-256" };
  return { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
}

function pemWrap(label: string, base64: string): string {
  const lines = base64.match(/.{1,64}/g) ?? [base64];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

async function exportPrivateKeyPem(key: CryptoKey): Promise<string> {
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", key);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(pkcs8)));
  return pemWrap("PRIVATE KEY", base64);
}

async function exportPublicKeyPem(key: CryptoKey): Promise<string> {
  const spki = await crypto.subtle.exportKey("spki", key);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(spki)));
  return pemWrap("PUBLIC KEY", base64);
}

export async function generateSelfSignedCert(
  options: GenerateOptions,
): Promise<GenerateResult> {
  const keys = await crypto.subtle.generateKey(
    keyGenAlgorithm(options.keyAlgorithm),
    true,
    ["sign", "verify"],
  );

  const extensions: Extension[] = [new BasicConstraintsExtension(false)];
  extensions.push(
    new KeyUsagesExtension(
      KeyUsageFlags.digitalSignature | KeyUsageFlags.keyEncipherment,
      true,
    ),
  );
  if (options.sans.length > 0) {
    extensions.push(
      new SubjectAlternativeNameExtension(
        options.sans.map((value) => ({ type: "dns" as const, value })),
      ),
    );
  }

  const now = new Date();
  const notAfter = new Date(
    now.getTime() + options.validityDays * 24 * 60 * 60 * 1000,
  );

  const cert = await X509CertificateGenerator.createSelfSigned({
    serialNumber: crypto
      .getRandomValues(new Uint8Array(8))
      .reduce((acc, b) => acc + b.toString(16).padStart(2, "0"), ""),
    name: buildSubjectName(options.subject),
    notBefore: now,
    notAfter,
    signingAlgorithm: signingAlgorithm(options.keyAlgorithm),
    keys,
    extensions,
  });

  const [privateKeyPem, publicKeyPem] = await Promise.all([
    exportPrivateKeyPem(keys.privateKey),
    exportPublicKeyPem(keys.publicKey),
  ]);

  return {
    privateKeyPem,
    publicKeyPem,
    outputPem: cert.toString("pem"),
  };
}

export async function generateCsr(
  options: GenerateOptions,
): Promise<GenerateResult> {
  const keys = await crypto.subtle.generateKey(
    keyGenAlgorithm(options.keyAlgorithm),
    true,
    ["sign", "verify"],
  );

  const extensions =
    options.sans.length > 0
      ? [
          new SubjectAlternativeNameExtension(
            options.sans.map((value) => ({ type: "dns" as const, value })),
          ),
        ]
      : [];

  const csr = await Pkcs10CertificateRequestGenerator.create({
    name: buildSubjectName(options.subject),
    keys,
    signingAlgorithm: signingAlgorithm(options.keyAlgorithm),
    extensions,
  });

  const [privateKeyPem, publicKeyPem] = await Promise.all([
    exportPrivateKeyPem(keys.privateKey),
    exportPublicKeyPem(keys.publicKey),
  ]);

  return {
    privateKeyPem,
    publicKeyPem,
    outputPem: csr.toString("pem"),
  };
}
