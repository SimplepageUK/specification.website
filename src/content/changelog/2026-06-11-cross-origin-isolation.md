---
title: Added a page on cross-origin isolation (COOP / COEP / CORP)
date: "2026-06-11"
type: added
relatedSlugs: [cross-origin-isolation]
---

New **Security** topic on [cross-origin isolation](/spec/security/cross-origin-isolation/) — the `Cross-Origin-Opener-Policy`, `Cross-Origin-Embedder-Policy`, and `Cross-Origin-Resource-Policy` response headers that sever risky cross-window links (tabnabbing, XS-Leaks) and keep your resources out of an attacker's process (Spectre). The site already ships COOP and CORP on every response, so this closes a ship-it-before-you-spec-it gap; status: recommended.
