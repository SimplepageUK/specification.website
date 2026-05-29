---
title: "/.well-known/ai.txt"
slug: ai-txt
category: well-known
summary: "A non-standard, non-registered convention for declaring AI training opt-outs. The original Spawning proposal site no longer serves the spec, and the file is not in the IANA well-known registry. Prefer robots.txt directives for AI crawlers and llms.txt for positive guidance."
status: avoid
order: 80
appliesTo: [all]
relatedSlugs: [well-known-overview, llms-txt, robots-for-ai-crawlers, robots-txt]
updated: "2026-05-29"
sources:
  - title: "IANA — Well-Known URIs Registry (ai.txt is not listed)"
    url: "https://www.iana.org/assignments/well-known-uris/well-known-uris.xhtml"
    publisher: "IANA"
  - title: "Spawning — ai.txt proposal (archived; the live URL no longer resolves)"
    url: "https://web.archive.org/web/2024/https://spawning.ai/ai-txt"
    publisher: "Internet Archive"
  - title: "llms.txt convention"
    url: "https://llmstxt.org/"
    publisher: "llmstxt.org"
  - title: "ai.robots.txt — community-maintained robots.txt for AI crawlers"
    url: "https://github.com/ai-robots-txt/ai.robots.txt"
    publisher: "ai-robots-txt (GitHub)"
---

## What it is

`ai.txt` was a 2023 proposal from Spawning AI for a text file at `/.well-known/ai.txt` (or, in some variants, the document root) that would declare a site's policy on AI training, dataset inclusion, and model use. The syntax was modelled on `robots.txt`.

Three things have happened since.

1. **It never reached an RFC and never entered the IANA Well-Known URIs registry.** Confirm for yourself: open the [IANA registry](https://www.iana.org/assignments/well-known-uris/well-known-uris.xhtml) and search for `ai.txt`. It is not there.
2. **The original proposer's specification page no longer resolves.** `spawning.ai/ai-txt` returns an error. The only canonical reference is the [Internet Archive snapshot](https://web.archive.org/web/2024/https://spawning.ai/ai-txt).
3. **The conventions that actually work in practice** are `robots.txt` with AI-crawler user-agent directives (see [robots.txt for AI crawlers](/spec/agent-readiness/robots-for-ai-crawlers/)) and `llms.txt` (see [/llms.txt](/spec/agent-readiness/llms-txt/)). Both are honoured by mainstream model providers; neither requires inventing a new well-known path.

This page exists for completeness — sites that still serve `/.well-known/ai.txt` should know what they are and are not signing up for.

## Why this is now "avoid"

- **No standards-track home.** Without IETF registration, well-known URI conflicts and parser disagreements are possible.
- **No live canonical source.** A spec whose authoritative page does not load is, in practice, not a spec.
- **Better alternatives exist.** Every AI crawler that respects `ai.txt` also respects `robots.txt` directives targeted at its user-agent — which **is** in the [IETF-standardised](https://www.rfc-editor.org/rfc/rfc9309.html) registry. The `robots.txt` approach is strictly more compatible.
- **Shipping it implies a contract you cannot enforce.** Visitors and crawler operators reading your `ai.txt` may infer obligations on your side that you have no mechanism to deliver on.

If your motivation is "I want AI bots not to train on this content", do this instead, in this order:

1. **`robots.txt`** with explicit `User-agent` blocks for the major AI crawlers — GPTBot, OAI-SearchBot, ClaudeBot, Google-Extended, Applebot-Extended, PerplexityBot, CCBot, Bytespider. See [robots-txt for AI crawlers](/spec/agent-readiness/robots-for-ai-crawlers/) for the current list. The [ai.robots.txt](https://github.com/ai-robots-txt/ai.robots.txt) community list is kept up to date.
2. **Server- or CDN-level blocks** of those same user agents for crawlers that ignore `robots.txt`. Cloudflare, Fastly, and Vercel all expose AI-bot blocking rules.
3. **A `Terms of Service` clause** if you also want a legal hook. None of the technical files have legal force on their own.

If your motivation is "I want LLMs to use my content *well*", ship [`/llms.txt`](/spec/agent-readiness/llms-txt/) and [per-page Markdown source endpoints](/spec/agent-readiness/markdown-source-endpoints/). Both are recommended.

## What sites that still ship ai.txt look like

The widely-copied syntax, for reference only — *not* a recommendation to deploy it:

```
User-Agent: *
Disallow: /
```

```
User-Agent: *
Disallow: /
Allow: /public-docs/
```

If you do ship it (matching what some sites already have for continuity with crawlers that look for it), serve it as `Content-Type: text/plain; charset=utf-8` over HTTPS at `/.well-known/ai.txt`, and treat it as supplementary signal on top of the working `robots.txt` and edge-level blocks.

## Common mistakes

- Treating `ai.txt` as a substitute for `robots.txt`. It is not, and the major crawlers do not parse it.
- Assuming it has legal force. It is a request; no court has tested it as a contract.
- Citing `spawning.ai/ai-txt` as the canonical source. Use the [Internet Archive snapshot](https://web.archive.org/web/2024/https://spawning.ai/ai-txt) and note the spec has not been actively maintained.
- Inferring from "well-known" in the path that it is IETF-registered. It is not.

## Verification

`curl -s https://example.com/.well-known/ai.txt` returns a plain-text file. That confirms the file is served correctly — nothing more. No verification step exists that confirms any crawler will honour it.
