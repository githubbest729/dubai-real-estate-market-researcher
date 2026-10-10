
<div align="center">

# 🏙️ Dubai Market Desk
*An AI-Powered Progressive Web App for Dubai Real Estate Intelligence*

Dubai Market Desk is like having a super-smart, private real estate advisor in your pocket

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success?style=flat-square&logo=pwa)](#)
[![Data Status](https://img.shields.io/badge/Data_Snapshot-Oct_2026-orange?style=flat-square&logo=database)](#)
[![Gumloop AI](https://img.shields.io/badge/Gumloop-Live_Agent-purple?style=flat-square&logo=openai)](#)

### 🚀 Lighthouse Performance
![Performance](https://img.shields.io/badge/Performance-96-brightgreen?style=for-the-badge)
![Accessibility](https://img.shields.io/badge/Accessibility-100-brightgreen?style=for-the-badge)
![Best Practices](https://img.shields.io/badge/Best_Practices-100-brightgreen?style=for-the-badge)
![SEO](https://img.shields.io/badge/SEO-100-brightgreen?style=for-the-badge)

<p align="center">
  <b>Built for Individual Investors • Property Consultants • Serious Buyers</b><br>
  <i>Anchored in closed Dubai Land Department (DLD) sales and registered Ejari contracts.</i>
</p>

</div>

---

## 📖 Overview

**Dubai Market Desk** is a secure, offline-first Progressive Web App (PWA) acting as a specialized terminal for researching the Dubai real estate market. 

It solves the problem of inflated property portal asking prices by combining a **statically pinned offline snapshot** of verified DLD/Ejari market data with a **dynamic "Ask" interface** powered by an autonomous AI Agent via a Gumloop webhook. When the AI fetches real-time data for un-cached communities, the dashboard charts seamlessly update on the fly.

---

## ✨ Key Features & Functions

| 📊 **Market Dashboard** | 🤖 **Live AI Agents** |
| :--- | :--- |
| **City Snapshot:** Instant, offline-ready KPIs for home sales, values, and rental yields.<br><br>**Dynamic Injection:** Charts and cards automatically rebuild themselves when live JSON data is fetched by the AI.<br><br>**Granular Charts:** Tap-to-inspect Canvas charts for price-per-sqft, off-plan vs. ready, and bedroom ticket medians. | **Multi-Persona:** Route queries to a *Market Analyst*, *Compliance Reviewer*, or *Investment Advisor*.<br><br>**Voice Input:** Dictate research queries natively using browser speech recognition.<br><br>**Smart Context:** AI automatically knows your currently viewed community and the baseline snapshot dates. |

| 🛡️ **Enterprise Security** | ⚡ **PWA & Offline** |
| :--- | :--- |
| **PII Redaction:** Emails, phones, Emirates IDs, and passports are automatically masked locally before hitting the API.<br><br>**Audit Logging:** Immutable SHA-256 hash-chained logs of all queries and actions.<br><br>**Local Encryption:** AES-GCM encryption on local storage with automatic 30-day data deletion. | **Installable:** Runs securely in-browser or installs natively to mobile/desktop home screens.<br><br>**Zero-State Handlers:** Graceful fallbacks when a community isn't cached, prompting a live AI fetch.<br><br>**Export & Share:** Print-ready PDF rendering and native mobile Share Sheet integration. |

---

## 🏗️ The "Hybrid" Data Architecture

Modern browsers block cross-origin requests (CORS) from client-side JavaScript to third-party webhooks. Furthermore, static dashboards cannot normally display live AI text. 

This app solves both via a **Proxy-First + JSON Payload** architecture:

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 User
    participant UI as 📱 PWA Frontend
    participant P as ⚙️ Serverless Proxy
    participant AI as 🤖 Gumloop Agent

    U->>UI: Asks: "Rent & Sales for Al Furjan"
    UI->>UI: Redacts PII (Emails, IDs) locally
    UI->>P: POST /api/gumloop 
    Note over P: Bypasses CORS restrictions
    P->>AI: Forwards query to Webhook
    AI-->>P: Returns Markdown Brief + hidden ```json block
    P-->>UI: Returns payload to frontend
    UI->>UI: Parses JSON & strips it from text
    UI->>U: Displays clean text brief in "Ask" tab
    UI->>U: Injects JSON to live-update Dashboard Charts!

```

---

## 🧰 Tech Stack

* **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+). *Zero heavy frontend frameworks.*
* **Charts:** Dependency-free, custom-built Canvas API bar charts (`js/charts.js`).
* **Backend / API:** Vercel/Netlify Serverless Functions (`/api/gumloop`) for CORS bridging.
* **AI Engine:** Gumloop Webhooks connected to Claude/OpenAI models.
* **Security:** Web Crypto API (`js/security.js`) for AES-GCM local storage and SHA-256 auditing.

---

## 🔒 Compliance & Data Residency

This application provides live indicators for **UAE PDPL compliance**. Because Gumloop's processing location is not strictly localized to the UAE, the app explicitly warns users regarding data residency and actively forces local redaction of Personally Identifiable Information (PII) before any network request leaves the device.

---

