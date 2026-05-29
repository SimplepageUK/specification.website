---
title: "/.well-known/ai.txt"
slug: ai-txt
category: well-known
summary: "An emerging convention for declaring opt-outs and policies around AI training and content use. Not yet an IETF standard, not yet in the IANA registry."
status: optional
order: 80
appliesTo: [all]
relatedSlugs: [well-known-overview, llms-txt]
updated: "2026-05-29"
sources:
  - title: "Spawning — ai.txt"
    url: "https://spawning.ai/ai-txt"
    publisher: "Spawning"
  - title: "IANA — Well-Known URIs Registry"
    url: "https://www.iana.org/assignments/well-known-uris/well-known-uris.xhtml"
    publisher: "IANA"
  - title: "llms.txt convention"
    url: "https://llmstxt.org/"
    publisher: "Answer.AI"
---

## What it is

`ai.txt` is a proposed text file, served from `/.well-known/ai.txt` or sometimes from the document root, that declares how a site owner wants AI systems to treat their content. The most widely used variant is the one published by Spawning, which uses a syntax modelled on `robots.txt` to allow or disallow data-mining and model-training use of specific paths.

It is **not** an IETF standard. It is **not** in the IANA well-known URIs registry. Compliance is voluntary, inconsistent, and largely depends on whether the crawler operator has chosen to honour it.

## Why it matters

- **A signal of intent.** Even without legal force, publishing `ai.txt` documents that you do not consent to certain uses of your content. Several jurisdictions (notably the EU, under the Copyright in the Digital Single Market Directive) require machine-readable opt-outs for text-and-data-mining exceptions.
- **Some crawlers honour it.** Spawning's crawler, Common Crawl's optional filters, and a handful of model providers respect it. Others do not.
- **It complements `robots.txt`.** `robots.txt` controls indexing for search; `ai.txt` is specifically about model training and dataset inclusion.

Because the convention is unsettled, treat `ai.txt` as a useful signal layered on top of stronger controls (server-side blocks of known AI crawler user agents, licence terms in your Terms of Service), not as a sole defence.

## How to implement

The Spawning format looks like this:

```
User-Agent: *
Disallow: /
```

A more granular example, allowing one section while disallowing the rest:

```
User-Agent: *
Disallow: /
Allow: /public-docs/
```

Rules:

- Serve as **`Content-Type: text/plain; charset=utf-8`** over **HTTPS**.
- Place at **`/.well-known/ai.txt`** — although some publishers also mirror it at `/ai.txt`, prefer the well-known location for future compatibility.
- Keep the syntax close to `robots.txt`. Crawlers reuse their parsers.
- Pair it with `robots.txt` directives that block specific AI crawler user agents (GPTBot, ClaudeBot, Google-Extended, CCBot, PerplexityBot, Bytespider) if you want a stronger signal.

## Related but separate: llms.txt

`llms.txt` is a different convention, proposed by Answer.AI, for offering a curated, plain-text summary of a site that LLM-powered assistants can ingest **at query time**. It is about helping language models understand your site, not about opting out of training. See [the llms.txt page](/spec/agent-readiness/llms-txt/) for the full treatment.

The two files are complementary: `ai.txt` says "do not train on this", `llms.txt` says "here is what this site is".

## Common mistakes

- Treating `ai.txt` as legally binding. It is not. It is a request.
- Assuming any crawler will obey it. Many will not. Block known bad actors at the server or CDN layer.
- Confusing `ai.txt` (training opt-out) with `llms.txt` (assistant-friendly summary). They have different purposes.
- Serving `ai.txt` only from the root and not from `/.well-known/`, then being surprised when newer tools cannot find it.

## Verification

```
curl -s https://example.com/.well-known/ai.txt
```

Confirm a plain-text response and parse it with a `robots.txt`-compatible library. Note the limits: this verifies the file exists and is syntactically valid. It does not verify that any crawler will respect it.
