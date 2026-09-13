import { useState } from "react";
import { ShieldPlus, Copy, Check, RefreshCw } from "lucide-react";
import {
  generateSelfSignedCert,
  generateCsr,
  type CertSubject,
  type KeyAlgorithm,
} from "../lib/certGenerate";

type Mode = "cert" | "csr";

const KEY_ALGORITHMS: { key: KeyAlgorithm; label: string }[] = [
  { key: "RSA-2048", label: "RSA 2048" },
  { key: "RSA-4096", label: "RSA 4096" },
  { key: "ECDSA-P256", label: "ECDSA P-256" },
];

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-subText">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm text-text outline-none placeholder:text-subText"
      />
    </div>
  );
}

function OutputBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-subText">{label}</span>
        {value && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-subText hover:text-text transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      <pre className="rounded-lg border border-border bg-card p-3 font-mono text-xs text-text whitespace-pre-wrap break-words max-h-48 overflow-y-auto custom-scrollbar">
        {value || "—"}
      </pre>
    </div>
  );
}

export default function CertGenerator() {
  const [mode, setMode] = useState<Mode>("cert");
  const [keyAlgorithm, setKeyAlgorithm] = useState<KeyAlgorithm>("RSA-2048");
  const [validityDays, setValidityDays] = useState(365);
  const [subject, setSubject] = useState<CertSubject>({
    commonName: "",
    organization: "",
    organizationalUnit: "",
    country: "",
    state: "",
    locality: "",
  });
  const [sansInput, setSansInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    outputPem: string;
    privateKeyPem: string;
    publicKeyPem: string;
  } | null>(null);

  const updateSubject = (field: keyof CertSubject) => (value: string) => {
    setSubject((s) => ({ ...s, [field]: value }));
  };

  const generate = async () => {
    if (!subject.commonName.trim()) {
      setError("Common Name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    const sans = sansInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const options = { subject, keyAlgorithm, validityDays, sans };
      const generated =
        mode === "cert"
          ? await generateSelfSignedCert(options)
          : await generateCsr(options);
      setResult(generated);
    } catch (err) {
      setError((err as Error).message || "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <ShieldPlus className="text-primary" size={20} />
          <h2 className="font-semibold text-text">
            Certificate / CSR Generator
          </h2>
        </div>

        <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm">
          <button
            onClick={() => setMode("cert")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "cert"
                ? "bg-primary text-white"
                : "text-subText hover:bg-inputBg"
            }`}
          >
            Self-Signed Cert
          </button>
          <button
            onClick={() => setMode("csr")}
            className={`px-3 py-1.5 transition-colors ${
              mode === "csr"
                ? "bg-primary text-white"
                : "text-subText hover:bg-inputBg"
            }`}
          >
            CSR
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar border-r border-border p-6">
          <div className="max-w-md flex flex-col gap-4">
            <Field
              label="Common Name (CN) *"
              value={subject.commonName}
              onChange={updateSubject("commonName")}
              placeholder="example.local"
            />
            <Field
              label="Organization (O)"
              value={subject.organization}
              onChange={updateSubject("organization")}
              placeholder="My Company"
            />
            <Field
              label="Organizational Unit (OU)"
              value={subject.organizationalUnit}
              onChange={updateSubject("organizationalUnit")}
              placeholder="Engineering"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Locality (L)"
                value={subject.locality}
                onChange={updateSubject("locality")}
                placeholder="City"
              />
              <Field
                label="State (ST)"
                value={subject.state}
                onChange={updateSubject("state")}
                placeholder="State"
              />
            </div>
            <Field
              label="Country (C)"
              value={subject.country}
              onChange={updateSubject("country")}
              placeholder="US"
            />
            <Field
              label="Subject Alternative Names (comma-separated)"
              value={sansInput}
              onChange={setSansInput}
              placeholder="example.local, www.example.local"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-subText">
                Key Algorithm
              </label>
              <div className="flex items-center rounded-lg border border-border overflow-hidden text-sm w-fit">
                {KEY_ALGORITHMS.map((k) => (
                  <button
                    key={k.key}
                    onClick={() => setKeyAlgorithm(k.key)}
                    className={`px-3 py-1.5 transition-colors ${
                      keyAlgorithm === k.key
                        ? "bg-primary text-white"
                        : "text-subText hover:bg-inputBg"
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            {mode === "cert" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-subText">
                  Validity (days)
                </label>
                <input
                  type="number"
                  min={1}
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="w-32 rounded-lg border border-border bg-card px-3 py-2 text-sm text-text outline-none"
                />
              </div>
            )}

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-40 w-fit"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading
                ? "Generating..."
                : mode === "cert"
                  ? "Generate Certificate"
                  : "Generate CSR"}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-card p-6">
          {!result ? (
            <p className="text-sm text-subText">
              Fill in the subject fields and click generate. The private key is
              generated locally and never leaves this device.
            </p>
          ) : (
            <div className="max-w-xl flex flex-col gap-4">
              <OutputBlock
                label={mode === "cert" ? "Certificate (PEM)" : "CSR (PEM)"}
                value={result.outputPem}
              />
              <OutputBlock
                label="Private Key (PEM, PKCS#8)"
                value={result.privateKeyPem}
              />
              <OutputBlock
                label="Public Key (PEM, SPKI)"
                value={result.publicKeyPem}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
