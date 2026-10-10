# 🏙️ Dubai Market Desk (PWA)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success)](#)
[![Data Status](https://img.shields.io/badge/Data_Snapshot-Oct_2026-orange)](#)

A Progressive Web App (PWA) acting as a specialized terminal for researching the Dubai real estate market. It combines a statically pinned snapshot of third-party market data with a dynamic "Ask" interface powered by an autonomous AI Agent via a Gumloop webhook.

---

## ✨ Key Features & Functions

### 📊 Core Metrics (City Snapshot)
The main dashboard visualizes real estate facts through interactive, tap-to-inspect charts based on DLD/Ejari data up to Q3 2026:
*   **Headline KPIs:** Track September home sales volume, total sales value, median price per sq ft, and 12-month apartment rent growth.
*   **Price Per Sq Ft:** Side-by-side comparison of different index methodologies (Projectory, PIX, Prop971).
*   **Off-Plan vs. Ready:** Breakdowns by count and value, including community-specific drops (e.g., Azizi Venice).
*   **Rental Yields & Costs:** Track rent changes across specific communities (DIP Second, Liwan, Downtown Dubai) and apartment sizes (Studio to 3-Bed).

### 🤖 AI Agent Integration
*   **Multi-Agent Support:** Engage specialized AI personas including a *Market Analyst*, *Compliance Reviewer*, and *Investment Advisor*.
*   **"Request Snapshot" Trigger:** A dedicated button sends a standard `{"message":"City snapshot"}` payload directly to the Gumloop webhook.
*   **Voice Input:** Dictate queries directly into the Ask interface using native browser speech recognition.

### 🛡️ Security, Export & Compliance
*   **Data Protection:** Automatic redaction of PII (emails, phone numbers, Emirates IDs, IBANs, passports) before payloads hit the webhook.
*   **Audit Logging:** Hash-chained (SHA-256) action logs with JSON/CSV export capabilities.
*   **Export/Share:** Generate PDF reports via print stylesheets or use the native mobile Share Sheet.
*   **Compliance Dashboard:** Live indicators for UAE PDPL compliance, data residency warnings, and localized data erasure tools (AES-GCM encryption on local storage; auto-deleted after 30 days).

---

## 🏗️ System Architecture & CORS Handling

Because modern browsers block cross-origin requests (CORS) from client-side JavaScript to third-party webhooks, this app implements a proxy-first architecture. 

### Request Flow
```mermaid
graph LR
    A[📱 PWA Client] -->|POST /api/gumloop| B(⚙️ Proxy Server)
    B -->|Forwards Request| C((🤖 Gumloop Webhook))
    C -->|Returns AI Insights| B
    B -->|Bypasses CORS Check| A
