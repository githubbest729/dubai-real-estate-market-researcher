# Dubai Market Desk (PWA)
Dubai real-estate dashboard showing the 10 Oct 2026 city snapshot (js/snapshot.js), wired to a Gumloop AI agent via webhook (see `app.js`).
Run locally: `npx serve .` (service worker needs HTTPS or localhost). Deploy: push to GitHub, enable Pages (Actions).
Security notes: PII redaction, AES-GCM local storage, hash-chained audit log, strict CSP. The webhook URL is visible in client code; rotate it if exposed, or proxy via a serverless function.

## Webhook proxy (CORS)
The browser posts to `/api/gumloop`; the host forwards it to Gumloop.
- Codespaces/local: `npm start` (runs `dev-server.js`, port 3000).
- Vercel: `vercel.json` rewrite. Netlify: `netlify.toml` redirect. GitHub Pages cannot proxy.
Override the target with `GUMLOOP_WEBHOOK_URL` for the dev server.

## Security
See `SECURITY.md`. The webhook URL is an environment variable only (`.env` locally, dashboard settings on Vercel/Netlify). Run `npm test` before every push; it fails if a webhook URL appears in any file.
