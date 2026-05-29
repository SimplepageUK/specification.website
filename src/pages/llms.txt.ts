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
    'This is the llms.txt index for ' +
      site.url +
      '. The site is a platform-agnostic specification of the technical features a good website should have. It covers HTML foundations, SEO, accessibility, security, well-known URIs, agent readiness, performance, privacy, resilience, and internationalisation.',
  );
  lines.push('');
  lines.push(
    'For the full content of every spec page concatenated into one file, see ' +
      site.url +
      '/llms-full.txt.',
  );
  lines.push('');

  for (const c of categories) {
    const items = grouped[c.slug] ?? [];
    if (!items.length) continue;
    lines.push(`## ${c.title}`);
    lines.push('');
    lines.push(c.summary);
    lines.push('');
    for (const e of items) {
      const slug = e.data.slug ?? e.id.split('/').pop()!;
      const url = `${site.url}/spec/${c.slug}/${slug}/`;
      lines.push(`- [${e.data.title}](${url}): ${e.data.summary}`);
    }
    lines.push('');
  }

  lines.push('## Project');
  lines.push('');
  lines.push(`- [About](${site.url}/about/): What the spec is and how it is built.`);
  lines.push(`- [Contribute](${site.url}/contribute/): How to propose changes.`);
  lines.push(`- [Checklist](${site.url}/checklist/): The whole spec as a flat checklist.`);
  lines.push(`- [Source on GitHub](${site.repo}): MIT licensed, open for pull requests.`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
