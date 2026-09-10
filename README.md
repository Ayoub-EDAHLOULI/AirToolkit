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

### Phase 2 — planned, low complexity

- [ ] XML / CSV formatter — pretty-print/minify XML, validate well-formedness;
      CSV → table view with delimiter/quote handling
- [ ] Color Tools — HEX ↔ RGB ↔ HSL ↔ CMYK conversion with a visual picker
- [ ] Markdown previewer — live-rendered markdown as you type
- [ ] SQL formatter — beautify minified SQL into readable, indented output
- [ ] Fake data generator — names, emails, UUIDs, addresses, lat/longs for
      seeding test data
- [ ] QR code generator — text/URL → QR image (reading/scanning is a
      separate, later item — see Phase 3)

Base64 image ↔ data URI support will be added as a mode inside the existing
Encode/Decode tool rather than a new sidebar entry.

### Phase 3 — planned, higher complexity or expanded capability surface

- [ ] Cron expression parser/explainer — human-readable explanation of a
      cron string plus next N run times
- [ ] X.509 certificate decoder — issuer/subject/validity/SANs/key algorithm
      from a pasted PEM cert
- [ ] Offline API request tester — see the note below; this is the one
      deliberate exception to AirToolkit's zero-network-calls posture
- [ ] Favicon/image asset generator — one image in, a standard icon set out;
      the first tool that writes files rather than just transforming text,
      which will require expanding Tauri's filesystem allowlist
- [ ] Color palette extractor — dominant colors from an uploaded image
- [ ] QR code reader — decode an uploaded QR image back to text

**A note on the API request tester:** AirToolkit's core promise is that the
_app itself_ never makes a network call on its own — no telemetry, no
auto-update, no phone-home, ever. The planned API request tester is a
deliberate, explicit exception to that: its entire purpose is letting you
compose and send an HTTP request to a service on your own network, on
demand. It changes nothing about the app's own behavior — it still makes
zero unsolicited calls — but it is the one tool whose job is to make a call
_you_ tell it to make. This will be called out again in that tool's own UI
when it ships.

## Offline Verification

**TODO:** Each release should be verified with OS-level network blocking
(e.g. Windows Firewall outbound rules, or running the packaged binary in a
network-isolated VM) to confirm zero outbound calls before it's tagged as
verified. No release has been verified this way yet — treat any offline claim
as unverified until this section is updated with an actual test procedure and
results.

## Getting Started

```bash
npm install
npm run tauri dev
```

## License

MIT — see [LICENSE](LICENSE).
