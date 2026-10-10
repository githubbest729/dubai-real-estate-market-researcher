# Contributing to Dubai Market Desk

First off, thank you for considering contributing to Dubai Market Desk! It's people like you that make this tool a powerful, secure resource for real estate intelligence.

## 🛡️ Security & Privacy First (Strict Policy)

Because this application handles sensitive data and integrates with an external AI webhook, we have a zero-tolerance policy for data leaks:
* **NEVER commit secrets:** Do not commit API keys, webhook URLs, or `.env` files. 
* **NEVER commit personal data:** Ensure no PII (names, emails, phone numbers, Emirates IDs) is accidentally hardcoded in the codebase, tests, or `js/snapshot.js`.
* **Test data only:** If adding tests, use synthetic, anonymized dummy data.

## 🛠️ Local Development Setup

This project uses a lightweight Vanilla JS architecture with zero heavy frontend frameworks. 

1. **Fork and clone** the repository to your local machine.
2. **Install dependencies:** Run `npm install` to load the testing libraries.
3. **Local Server:** You can serve the root directory using any local web server (e.g., `npx serve` or VS Code Live Server). *Note: AI Webhook proxying requires a serverless environment like Vercel/Netlify for full functionality.*

## 🧪 Testing Requirements

Before opening a pull request, you **must** ensure all automated test suites pass. 

Run the test suite from your terminal:
```bash
npm test
