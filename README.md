# Dubai Market Desk (PWA)
Dubai real-estate dashboard showing the 10 Oct 2026 city snapshot (js/snapshot.js), wired to a Gumloop AI agent via webhook (see `app.js`).
Run locally: `npx serve .` (service worker needs HTTPS or localhost). Deploy: push to GitHub, enable Pages (Actions).
Security notes: PII redaction, AES-GCM local storage, hash-chained audit log, strict CSP. The webhook URL is visible in client code; rotate it if exposed, or proxy via a serverless function.
