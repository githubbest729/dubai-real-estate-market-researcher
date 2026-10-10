# Dubai Market Desk (PWA)
Dubai real-estate research dashboard wired to a Gumloop AI agent via webhook (see `app.js`).
Run locally: `npx serve .` (service worker needs HTTPS or localhost). Deploy: push to GitHub, enable Pages (Actions).
Security notes: PII redaction, AES-GCM local storage, hash-chained audit log, strict CSP. The webhook URL is visible in client code; rotate it if exposed, or proxy via a serverless function.
