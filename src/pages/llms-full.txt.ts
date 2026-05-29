import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { categories, categoryFor, site } from '~/lib/site';

export const GET: APIRoute = async () => {
  const entries = await getCollection('spec', ({ data }) => !data.draft);
  const grouped: Record<string, typeof entries> = {};
  for (const e of entries) (grouped[e.data.category] ??= []).push(e);
  for (const k of Object.keys(grouped)) {
    grouped[k].sort(
      (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
    );
  }

  const lines: string[] = [];
  lines.push(`# ${site.name}`);
  lines.push('');
  lines.push(`> ${site.description}`);
  lines.push('');
  lines.push(
    `Source: ${site.url}  ·  Repository: ${site.repo}  ·  Content licence: CC BY 4.0`,
  );
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const c of categories) {
    const items = grouped[c.slug] ?? [];
    if (!items.length) continue;
    lines.push(`# ${c.title}`);
    lines.push('');
    lines.push(c.summary);
    lines.push('');
    for (const e of items) {
      const slug = e.data.slug ?? e.id.split('/').pop()!;
      const url = `${site.url}/spec/${c.slug}/${slug}/`;
      lines.push(`## ${e.data.title}`);
      lines.push('');
      lines.push(`Status: ${e.data.status}  ·  Source page: ${url}`);
      lines.push('');
      lines.push(e.data.summary);
      lines.push('');
      // body is in entry.body for content collections
      if (e.body) {
        lines.push(e.body.trim());
        lines.push('');
      }
      if (e.data.sources?.length) {
        lines.push('### Sources');
        for (const s of e.data.sources) {
          lines.push(`- ${s.title} (${s.publisher ?? ''}) — ${s.url}`);
        }
        lines.push('');
      }
      lines.push('---');
      lines.push('');
    }
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
