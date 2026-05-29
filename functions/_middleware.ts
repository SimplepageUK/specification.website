/**
 * Cloudflare Pages middleware — content negotiation for spec pages.
 *
 * Spec pages live at /spec/<category>/<slug>/ (HTML) and
 * /spec/<category>/<slug>.md (Markdown source). If a client sends
 * Accept: text/markdown, we serve the Markdown body from the canonical
 * (slash-terminated) URL with Content-Location and Vary: Accept set
 * correctly, so caches handle it right. Everything else passes through
 * to the static asset pipeline unchanged, with Vary: Accept appended to
 * spec-page HTML responses so caches don't conflate the two
 * representations.
 */

type Env = {
  ASSETS: Fetcher;
};

const SPEC_PAGE = /^\/spec\/([^/]+)\/([^/]+)\/?$/;

function prefersMarkdown(accept: string): boolean {
  // We treat the request as "wants markdown" only when text/markdown is
  // explicitly named. Browsers default to text/html and don't hit this
  // path. Agents that opt in get it.
  return /text\/markdown/i.test(accept);
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next, env } = context;
  const url = new URL(request.url);

  const match = url.pathname.match(SPEC_PAGE);
  if (!match) return next();

  const [, category, slug] = match;
  const mdPath = `/spec/${category}/${slug}.md`;
  const accept = request.headers.get('accept') ?? '';

  if (prefersMarkdown(accept)) {
    const mdUrl = new URL(mdPath, url);
    const upstream = await env.ASSETS.fetch(mdUrl.toString());
    const headers = new Headers(upstream.headers);
    headers.set('Vary', 'Accept');
    headers.set('Content-Location', mdPath);
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  }

  const response = await next();
  const headers = new Headers(response.headers);
  headers.append('Vary', 'Accept');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
