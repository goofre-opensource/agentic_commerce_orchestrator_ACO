# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Active  |
| < 1.0   | ❌ EOL     |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub Issues.**

### Preferred Disclosure Method

1. **Email:** security@goofre.io
2. **Subject:** `[SECURITY] ACO - <Brief Description>`
3. **Encryption:** Use our PGP key (fingerprint: `AB12 CD34 EF56 GH78 IJ90 KL12`)

### What to Include

- Description of the vulnerability
- Steps to reproduce (with code sample if possible)
- Potential impact assessment
- Any proposed mitigation

---

## Response SLA

| Severity | Initial Response | Patch Target |
|----------|-----------------|--------------|
| Critical | 24 hours        | 72 hours     |
| High     | 48 hours        | 7 days       |
| Medium   | 5 business days | 30 days      |
| Low      | 10 business days| Next release |

---

## Scope

The following are **in scope** for security reports:

- Authentication bypass in WebhookProcessor HMAC validation
- Data exfiltration via malformed UCP schema payloads
- Prototype pollution in SwitchboardOrchestrator plugin registry
- Dependency vulnerabilities in `@goofre/core-engine` or `@goofre/plugins`

The following are **out of scope:**

- Issues in third-party APIs (Google Merchant Center, etc.) that Goofre integrates with
- Social engineering attacks
- Physical security issues

---

## Responsible Disclosure Policy

We follow a coordinated disclosure process. Upon receiving a valid report:

1. We will acknowledge receipt within the SLA above
2. We will investigate and validate the vulnerability
3. We will develop and test a patch
4. We will release the patch and publicly disclose the vulnerability (with credit to the reporter, if desired) within 90 days of the initial report

We will **not** pursue legal action against researchers who:

- Act in good faith and avoid privacy violations
- Do not disrupt services or destroy data
- Report vulnerabilities promptly and responsibly
