import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  X509Certificate,
  SubjectAlternativeNameExtension,
  BasicConstraintsExtension,
  KeyUsagesExtension,
  ExtendedKeyUsageExtension,
} from "@peculiar/x509";

interface CertInfo {
  subject: string;
  issuer: string;
  serialNumber: string;
  notBefore: string;
  notAfter: string;
  isExpired: boolean;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  sans: string[];
  keyUsages: string[];
  extendedKeyUsages: string[];
  isCA: boolean | null;
  sha1Thumbprint: string;
  sha256Thumbprint: string;
}

const KEY_USAGE_LABELS: Record<number, string> = {
  1: "Digital Signature",
  2: "Non-Repudiation",
  4: "Key Encipherment",
  8: "Data Encipherment",
  16: "Key Agreement",
  32: "Key Cert Sign",
  64: "CRL Sign",
  128: "Encipher Only",
  256: "Decipher Only",
};

function describeAlgorithm(alg: unknown): string {
  if (!alg || typeof alg !== "object") return "Unknown";
  const a = alg as { name?: string; hash?: { name?: string } };
  if (a.hash?.name) return `${a.name} (${a.hash.name})`;
  return a.name ?? "Unknown";
}

async function parseCert(pem: string): Promise<CertInfo> {
  const cert = new X509Certificate(pem);

  const sanExt = cert.getExtension(SubjectAlternativeNameExtension);
  const sans = sanExt ? sanExt.names.items.map((n) => n.value) : [];

  const basicConstraints = cert.getExtension(BasicConstraintsExtension);

  const keyUsageExt = cert.getExtension(KeyUsagesExtension);
  const keyUsages: string[] = [];
  if (keyUsageExt) {
    for (const [bit, label] of Object.entries(KEY_USAGE_LABELS)) {
      if ((keyUsageExt.usages & Number(bit)) !== 0) keyUsages.push(label);
    }
  }

  const ekuExt = cert.getExtension(ExtendedKeyUsageExtension);
  const extendedKeyUsages = ekuExt ? ekuExt.usages.map((u) => String(u)) : [];

  const sha1 = Array.from(new Uint8Array(await cert.getThumbprint("SHA-1")))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(":");
  const sha256 = Array.from(new Uint8Array(await cert.getThumbprint("SHA-256")))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(":");

  return {
    subject: cert.subject,
    issuer: cert.issuer,
    serialNumber: cert.serialNumber,
    notBefore: cert.notBefore.toLocaleString(),
    notAfter: cert.notAfter.toLocaleString(),
    isExpired: cert.notAfter.getTime() < Date.now(),
    signatureAlgorithm: describeAlgorithm(cert.signatureAlgorithm),
    publicKeyAlgorithm: describeAlgorithm(cert.publicKey.algorithm),
    sans,
    keyUsages,
    extendedKeyUsages,
    isCA: basicConstraints ? basicConstraints.ca : null,
    sha1Thumbprint: sha1.toUpperCase(),
    sha256Thumbprint: sha256.toUpperCase(),
  };
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-border last:border-b-0">
      <span className="text-xs text-subText">{label}</span>
      <span className="text-sm text-text font-mono break-all">{value}</span>
    </div>
  );
}

export default function CertDecoder() {
  const [pem, setPem] = useState("");
  const [info, setInfo] = useState<CertInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pem.trim()) {
      setInfo(null);
      setError(null);
      return;
    }

    let cancelled = false;
    parseCert(pem.trim())
      .then((result) => {
        if (!cancelled) {
          setInfo(result);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setInfo(null);
          setError(err.message || "Failed to parse certificate.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pem]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border shrink-0">
        <ShieldCheck className="text-primary" size={20} />
        <h2 className="font-semibold text-text">X.509 Certificate Decoder</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            PEM Certificate
          </div>
          <textarea
            value={pem}
            onChange={(e) => setPem(e.target.value)}
            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
            spellCheck={false}
            className="flex-1 resize-none bg-transparent p-4 font-mono text-sm text-text outline-none placeholder:text-subText"
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-card">
          <div className="px-4 py-2 text-xs font-medium text-subText border-b border-border shrink-0">
            Details
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar p-4">
            {error && <p className="text-sm text-danger">{error}</p>}

            {info && (
              <div className="flex flex-col">
                <Field label="Subject" value={info.subject} />
                <Field label="Issuer" value={info.issuer} />
                <Field label="Serial Number" value={info.serialNumber} />
                <Field label="Valid From" value={info.notBefore} />
                <Field
                  label={
                    info.isExpired ? "Valid Until (EXPIRED)" : "Valid Until"
                  }
                  value={info.notAfter}
                />
                <Field
                  label="Signature Algorithm"
                  value={info.signatureAlgorithm}
                />
                <Field
                  label="Public Key Algorithm"
                  value={info.publicKeyAlgorithm}
                />
                {info.isCA !== null && (
                  <Field
                    label="Certificate Authority"
                    value={info.isCA ? "Yes" : "No"}
                  />
                )}
                {info.keyUsages.length > 0 && (
                  <Field label="Key Usage" value={info.keyUsages.join(", ")} />
                )}
                {info.extendedKeyUsages.length > 0 && (
                  <Field
                    label="Extended Key Usage"
                    value={info.extendedKeyUsages.join(", ")}
                  />
                )}
                {info.sans.length > 0 && (
                  <Field
                    label="Subject Alternative Names"
                    value={info.sans.join(", ")}
                  />
                )}
                <Field label="SHA-1 Thumbprint" value={info.sha1Thumbprint} />
                <Field
                  label="SHA-256 Thumbprint"
                  value={info.sha256Thumbprint}
                />
              </div>
            )}

            {!info && !error && (
              <p className="text-sm text-subText">
                Paste a PEM-encoded certificate to decode it.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
