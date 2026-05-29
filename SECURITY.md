# Security policy

## Reporting a vulnerability

If you find a security issue in this site or the build pipeline:

- Email **security@specification.website**.
- Or open a [GitHub Security Advisory](https://github.com/jdevalk/specification.website/security/advisories/new).

Please **do not** open a public issue for security bugs.

## What is in scope

- The hosted site at `https://specification.website` and its subdomains.
- The code in this repository (Astro source, GitHub Actions workflows, deployment configuration).

## What is out of scope

- Reports about missing security headers without a demonstrable impact — the site's headers are documented in [`public/_headers`](public/_headers) and the relevant [spec pages](https://specification.website/spec/security/).
- Reports generated solely by automated scanners with no proof of exploit.
- Social engineering attempts against maintainers.

## Response

- We will acknowledge a valid report within **3 business days**.
- We will work with you on a fix and disclosure timeline.
- The disclosure window is typically **90 days** from the acknowledgement, or sooner if a fix ships earlier.

## Acknowledgements

Contributors who responsibly report security issues are credited in the project unless they prefer otherwise.

See also [`/.well-known/security.txt`](https://specification.website/.well-known/security.txt) — the machine-readable version, per [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116).
