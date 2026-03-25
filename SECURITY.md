# Security Policy

Goofre connects to live Google Commerce APIs and processes HMAC-signed webhook payloads. We take security seriously. This policy explains what we cover, how to report vulnerabilities, and what you can expect from us.

---

## Supported Versions

| Version               | Supported                  |
| --------------------- | -------------------------- |
| `1.x` (latest)        | ✅ Active security updates |
| `< 1.0` (pre-release) | ❌ Not supported           |

Only the **latest minor release** within the `1.x` line receives security patches. We recommend always running the latest version.

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.** Public disclosure before a patch is ready puts every Goofre user at risk.

Instead, report privately:

**Email:** [security@goofre.io](mailto:security@goofre.io)

**Subject line format:**

```
[SECURITY] <short description> — Severity: Critical/High/Medium/Low
```

**What to include in your report:**

- A clear description of the vulnerability
- Steps to reproduce (the more specific, the faster we patch)
- The version(s) affected
- Any proof-of-concept code (optional but very helpful)
- Your preferred handle for acknowledgement in our release notes

---

## What Happens After You Report

| Timeline             | Action                                                           |
| -------------------- | ---------------------------------------------------------------- |
| **Within 48 hours**  | We acknowledge receipt and assign a severity                     |
| **Within 7 days**    | We provide an estimated patch timeline                           |
| **Within 90 days**   | We aim to ship a patch for all Critical and High findings        |
| **At patch release** | We credit you in the release notes (unless you prefer anonymity) |

We follow **coordinated disclosure**: we ask that you give us 90 days to patch before public disclosure. If we haven't shipped a fix within 90 days, you're free to disclose publicly.

---

## Severity Classification

We use a simplified version of the CVSS framework:

| Severity        | Description                                                | Example                                          |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| 🔴 **Critical** | Remote code execution, full data exfiltration, auth bypass | HMAC bypass allowing arbitrary webhook injection |
| 🟠 **High**     | Significant data exposure, privilege escalation, SSRF      | Leaking Google OAuth credentials via log output  |
| 🟡 **Medium**   | Limited data exposure, DoS on specific endpoints           | Unhandled exception crashing the mock server     |
| 🟢 **Low**      | Informational, minimal real-world impact                   | Verbose error messages exposing internal paths   |

---

## Scope

**In scope:**

- `@goofre/core-engine` — SwitchboardOrchestrator, PosSyncEngine, WebhookProcessor
- `@goofre/plugins` — Google Merchant Center plugin
- `@goofre/mock-server` — Express API server
- `packages/create-goofre-ucp` — scaffolding CLI
- CI/CD pipeline and GitHub Actions workflows

**Out of scope:**

- Third-party community plugins (report to the plugin author)
- The live goofre.io website (report to [support@goofre.io](mailto:support@goofre.io))
- Issues in dependencies — report to the upstream package maintainer and we will update our dependency

---

## Security Design Principles

- **HMAC validation by default** — `WebhookProcessor` validates signatures on all inbound webhooks. Disable only in development with an explicit flag.
- **Stateless AI layer** — No client PII is persisted in the LLM context at any point.
- **Least privilege** — The Google Merchant Center plugin requests only the Content API for Shopping scope.
- **No secrets in logs** — `SwitchboardOrchestrator` debug logging never outputs credential fields.
- **SHA-pinned CI actions** — All GitHub Actions are pinned to specific commit SHAs to prevent supply chain attacks.

---

## Hall of Fame

Responsible disclosures that resulted in security improvements will be acknowledged here.

_No CVEs to date — first public release._

---

_This policy was last reviewed: March 2026._
