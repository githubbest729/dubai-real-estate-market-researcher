# Security notes
- **Secret:** `GUMLOOP_WEBHOOK_URL` is server-side only. If it was ever committed, pasted publicly, or shared, rotate it in Gumloop (create a new trigger, delete the old one). Removing it from git history is not enough.
- **Proxy guard (`server/guard.js`):** POST + JSON only, same-origin check, 16 KB cap, field allowlist, server-side PII redaction, per-IP and daily limits, fixed upstream host (`api.gumloop.com`), generic errors.
- **Limits:** the in-memory limiter is per server instance. Add a platform rate limit (Vercel Firewall, Netlify, Cloudflare) and a Gumloop credit cap/alert. An anonymous public endpoint cannot be made abuse-proof without sign-in or a CAPTCHA.
- **Codespaces:** keep forwarded ports Private.
- **Local storage:** AES-GCM with a non-extractable key protects data at rest from casual inspection. It does not protect against XSS or someone using your unlocked browser profile. Keep the strict CSP.
- **GitHub settings:** enable secret scanning, push protection and Dependabot; require PR review on `main`.
