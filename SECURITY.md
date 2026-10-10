# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please DO NOT open a public issue. Instead, please send an email to **[INSERT YOUR EMAIL HERE]**. 

All security vulnerabilities will be promptly addressed. We aim to acknowledge receipt of your vulnerability report within 48 hours and will provide regular updates on the resolution process.

---

## Architecture Security Notes for Maintainers

- **Secret Management:** `GUMLOOP_WEBHOOK_URL` is strictly server-side. If it is ever committed, pasted publicly, or shared, you must rotate it in Gumloop (create a new trigger, delete the old one). Removing it from git history is not enough.
- **Proxy Guard (`server/guard.js`):** Enforces POST + JSON only, same-origin checks, a 16 KB payload cap, field allowlists, server-side PII redaction, per-IP and daily limits, a fixed upstream host (`api.gumloop.com`), and generic errors.
- **Rate Limits:** The custom in-memory limiter is per server instance. For production, ensure a platform rate limit (Vercel Firewall, Netlify, Cloudflare) and a Gumloop credit cap/alert are active. An anonymous public endpoint cannot be made completely abuse-proof without user sign-in or a CAPTCHA.
- **Codespaces:** Keep forwarded ports set to Private.
- **Local Storage Encryption:** AES-GCM with a non-extractable key protects data at rest from casual inspection. Note: this does not protect against XSS or physical access to an unlocked browser profile. Maintain the strict Content Security Policy (CSP) at all times.
- **GitHub Repository Settings:** Maintain active secret scanning, push protection, and Dependabot alerts. Ensure PR reviews are required on the `main` branch.
