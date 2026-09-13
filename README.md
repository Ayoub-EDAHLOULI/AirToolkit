# AirToolkit

AirToolkit is an offline-first developer toolbox for air-gapped and locked-down
Windows machines. It bundles the everyday utilities developers reach for —
JSON formatting, regex testing, encode/decode, hashing, UUID generation, JWT
decoding, diffing, timestamp conversion, case conversion, and number base
conversion — into a single desktop app that makes **zero network calls of any
kind**: no telemetry, no auto-update, no external requests, ever. Built with
Tauri, React, and TypeScript.

## Motivation

This project came out of a real need: working on internet-restricted VMs at a
B2B security/access-control company, where pulling up a browser-based JSON
formatter or regex tester simply isn't an option. Most "offline" dev tool
sites still ship analytics, font CDNs, or update checks that fail loudly (or
silently phone home) the moment they're blocked. AirToolkit is built to have
no network dependency at all, verifiable at the OS level.

It's also maintained as an open portfolio project.

## Tech Stack

- [Tauri](https://tauri.app/) (Rust) — native shell, packaging, zero-network runtime
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) — UI
- Rust — backend/native logic

## Feature Roadmap

### Phase 1 — MVP (done)

- [x] JSON formatter / validator
- [x] Regex tester
- [x] Encode / decode (Base64, URL, HTML entities)
- [x] Hash / UUID generator
- [x] JWT decoder
- [x] Diff tool
- [x] Timestamp converter
- [x] Case converter
- [x] Number base converter

### Phase 2 — low complexity (done)

- [x] XML / CSV formatter — pretty-print/minify XML, validate well-formedness;
      CSV → table view with delimiter/quote handling
- [x] Color Tools — HEX ↔ RGB ↔ HSL ↔ CMYK conversion with a visual picker
- [x] Markdown previewer — live-rendered markdown as you type
- [x] SQL formatter — beautify minified SQL into readable, indented output
- [x] Fake data generator — names, emails, UUIDs, addresses, phone numbers,
      and company names for seeding test data
- [x] QR code generator — text/URL → QR image, with copy-as-data-URI and
      save-to-PNG (reading/scanning is a separate, later item — see Phase 3)

Base64 image ↔ data URI support will be added as a mode inside the existing
Encode/Decode tool rather than a new sidebar entry.

### Phase 3 — higher complexity or expanded capability surface

- [x] Cron expression parser/explainer — human-readable explanation of a
      cron string plus next 5 run times
- [x] X.509 certificate decoder — issuer/subject/validity/SANs/key algorithm
      from a pasted PEM cert
- [x] Favicon/image asset generator — one image in, PNGs at 8 standard sizes
      out, plus a multi-resolution favicon.ico; the first tool to use the
      folder-picker (`dialog:allow-open`) alongside the save-file capability
      already added for the QR code generator
- [x] Color palette extractor — dominant colors from an uploaded image via
      k-means clustering
- [x] QR code reader — decode an uploaded QR image back to text, completing
      the QR pair alongside the generator
- [x] Offline API request tester — see the note below; this is the one
      deliberate exception to AirToolkit's zero-network-calls posture

**A note on the API request tester:** AirToolkit's core promise is that the
_app itself_ never makes a network call on its own — no telemetry, no
auto-update, no phone-home, ever. The planned API request tester is a
deliberate, explicit exception to that: its entire purpose is letting you
compose and send an HTTP request to a service on your own network, on
demand. It changes nothing about the app's own behavior — it still makes
zero unsolicited calls — but it is the one tool whose job is to make a call
_you_ tell it to make. This will be called out again in that tool's own UI
when it ships.

### Phase 4 — additional developer/IT utilities

- [x] URL parser/builder — break a URL into scheme/host/port/path/query/
      fragment as editable fields, and rebuild it from edits
- [x] Subnet / CIDR calculator — network address, broadcast address, usable
      host range, and host count from an IP + CIDR
- [x] Text utilities — line sort, deduplicate, whitespace/line-ending
      normalization, character/word/line counts
- [x] Password / secret strength checker — entropy estimate, crack-time
      estimate, common-pattern detection (sequential, keyboard walk,
      dictionary word), and a strong-password generator
- [x] Log parser / grep — filter multi-line log output by pattern, with
      case-insensitive/invert-match options and a most-repeated-lines panel
- [x] dotenv diff & validator — compare two `.env` files, flag missing/extra
      keys, differing values, empty values, and duplicate keys
- [x] JSON ↔ YAML / TOML converter — bidirectional, using js-yaml and
      @iarna/toml
- [x] HTTP status code reference — searchable lookup with descriptions,
      surfaced as a toggleable panel inside the API Request Tester rather
      than a separate sidebar entry

### Phase 5 — planned

More utilities identified as filling real gaps the first 32 tools didn't
cover:

- [x] String escape/unescape helper — JSON string escaping, shell quoting,
      SQL string literals, and regex special characters in one tool
- [x] JSON structural diff — compares two JSON documents by key/value
      rather than by line, avoiding false differences from re-ordering or
      formatting that the line-based Diff Tool would show
- [x] Network port reference — searchable lookup of common ports (443,
      3306, 6379, etc.) and what typically runs on them, same shape as the
      HTTP status code reference
- [x] cURL ↔ request builder — parse a cURL command (including real
      multi-line browser devtools output) into method/URL/headers/body, or
      generate a cURL command from a request; a standalone tool, not
      integrated into the API Request Tester
- [x] JSON Schema validator — validate a JSON document against a JSON
      Schema, using the `ajv` library
- [x] Certificate / CSR generator — generate a self-signed certificate or
      CSR locally, extending `@peculiar/x509` (already a dependency of the
      X.509 Certificate Decoder); RSA 2048/4096 or ECDSA P-256, with the
      private key generated locally and never leaving the device
- [x] Hex/binary file inspector — open a file via the native file dialog,
      see its hex dump and detected magic bytes/file type; the first
      byte-level (rather than text-level) tool in the app

### Phase 6 — final polish round

- [x] Base64 file encoder — open any file via the native dialog and get its
      base64 (or data URI) encoding, or paste base64 back and save it to a
      file; complements the existing text-only Encode/Decode tool
- [x] System info panel — platform, OS version, architecture, locale,
      hostname, screen/viewport size, and CPU core count, read locally via
      `tauri-plugin-os`; useful for quick IT triage on a locked-down machine
- [x] Scratchpad — a simple local multi-note notepad for jotting things down
      mid-task, persisted via `localStorage` (per-machine only, never
      synced or exported automatically)

## Offline Verification

AirToolkit's zero-network-calls claim is checked two ways: a static code
audit (done on every change) and an OS-level runtime block (done before
tagging a release). Both are described below so the claim is reproducible,
not just asserted.

### 1. Static code audit

Run these from the repo root. Each should return **no matches**, or matches
only inside `src/pages/ApiTester.tsx` (the one deliberate exception — see
Phase 3 notes above):

```bash
# Browser-side network primitives
grep -rn "fetch(\|XMLHttpRequest\|WebSocket\|EventSource\|sendBeacon" src/

# Rust-side network primitives (Tauri's HTTP plugin itself is expected —
# it's what ApiTester.tsx calls into; anything beyond that is not)
grep -rn "reqwest\|TcpStream\|UdpSocket" src-tauri/src/
```

Also confirm `src-tauri/tauri.conf.json` has no `updater`/`analytics` config
block (Tauri's auto-updater is opt-in and must be explicitly configured —
absence of the block means it's off), and check `src-tauri/capabilities/*`
for the exact scope granted to `http:default` — it should be no broader than
required by the API Request Tester.

### 2. OS-level runtime block (Windows Firewall)

Build the release binary, then block all outbound traffic for it and confirm
every tool except the API Request Tester still works fully:

```powershell
# Build the release binary first: npm run tauri build
$exe = "src-tauri\target\release\airtoolkit.exe"
New-NetFirewallRule -DisplayName "AirToolkit-Block-Out" -Direction Outbound `
  -Program (Resolve-Path $exe) -Action Block
```

With the rule active, launch the app and exercise a cross-section of tools
(JSON formatter, hash/UUID generator, JWT decoder, cert generator, hex
inspector, etc.) — all should work identically to an unblocked run, since
none of them touch the network. The API Request Tester is expected to fail
to connect while the rule is active — that failure is itself confirmation
the block is working and that tool is the only one making real requests.

Remove the rule when done:

```powershell
Remove-NetFirewallRule -DisplayName "AirToolkit-Block-Out"
```

For a stronger guarantee, run the same build inside a network-isolated VM
(no virtual NIC, or a host-only adapter with no NAT) instead of relying on
a firewall rule.

**Status:** the static audit above has been run against the current
codebase (all Phase 1–6 tools) with no unexpected matches. The OS-level
firewall/VM run is a manual step the user needs to perform on their own
machine before tagging a release as offline-verified — it hasn't been run
against a signed release build yet.

## Getting Started

```bash
npm install
npm run tauri dev
```

## License

MIT — see [LICENSE](LICENSE).
