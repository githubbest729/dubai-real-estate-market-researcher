Dubai Market Desk (PWA)
Dubai real-estate dashboard presenting a data-driven City Snapshot (as of October 2026), integrated with an autonomous AI Agent via a Gumloop webhook.
📌 Project Overview
This Progressive Web App (PWA) acts as a specialized terminal for researching the Dubai real estate market. It combines a statically pinned snapshot of third-party market data (based on DLD/Ejari registrations) with a dynamic "Ask" interface powered by an autonomous agent.

The dashboard provides transparent, verifiable insights without predictive speculation, adhering strictly to recent transaction facts.
📊 Dashboard Functions & Features
Core Metrics (City Snapshot)
The main dashboard visualizes real estate facts through interactive, tap-to-inspect charts:

Headline KPIs: September home sales volume, sales value, median price per sq ft, and 12-month apartment rent growth.
Price Per Sq Ft: Side-by-side comparison of different index methodologies (Projectory, PIX, Prop971).
Off-Plan vs. Ready: Breakdowns by count and value, including specific community performance (e.g., Azizi Venice).
Rental Yields & Costs: Rent changes by community (DIP Second, Liwan, Downtown Dubai, etc.) and apartment sizes (Studio to 3-Bed).
AI Agent Integration
Multi-Agent Support: Engage specialized AI personas including a Market Analyst, Compliance Reviewer, and Investment Advisor.
"Request Snapshot" Trigger: A dedicated button sends a standard {"message":"City snapshot"} payload directly to the Gumloop webhook to activate the agent.
Voice Input: Dictate queries directly into the Ask interface using native browser speech recognition.
Security, Export & Compliance
Data Protection: Automatic redaction of PII (emails, phone numbers, Emirates IDs, IBANs, passports) before payloads hit the webhook.
Audit Logging: Hash-chained (SHA-256) action logs with JSON/CSV export capabilities.
Export/Share: Generate PDF reports via print stylesheets or use the native mobile Share Sheet.
Compliance Dashboard: Live indicators for UAE PDPL compliance, data residency warnings, and localized data erasure tools (AES-GCM encryption on local storage; auto-deleted after 30 days).
🏗 System Architecture & CORS Handling
Because modern browsers block cross-origin requests (CORS) from client-side JavaScript to third-party webhooks, this app implements a proxy-first architecture.

Flow: Client (app.js)  →  Same-Origin Proxy Route (/api/gumloop)  →  Gumloop Webhook

Local Development: Uses dev-server.js to run a local Express-style server that proxies requests.
Vercel Deployment: Utilizes a vercel.json rewrite to route /api/gumloop directly to the webhook URL.
Netlify Deployment: Utilizes a netlify.toml status 200 redirect.
Note: GitHub Pages does not support proxying. Deploy via Vercel or Netlify for full webhook functionality.
🚀 How to Run Locally
Download or clone the repository.
Open a terminal in the project directory.
Install dependencies and start the proxy server:

npm install

npm start

Open the provided localhost:3000 link in your browser. (Note: If using GitHub Codespaces, wait for the "Open in Browser" prompt).
⚠️ Important Caveats
Hardcoded Snapshot: The current charts are built on a static October 2026 snapshot (js/snapshot.js). Updating the data requires manual updates to this file; agent text parsing is disabled for UI safety.
Public Webhook Endpoint: Once deployed, your /api/gumloop route is public. Consider wrapping the proxy in a serverless function with rate-limiting if abuse is a concern.
Unverified Data Notice: Data represents third-party calculations (PropertyIndex PIX©, Prop971, Projectory). They are not official DLD index releases.



Built with strict Content Security Policy (CSP) enforcement. Service worker caches app shell for offline functionality.
