import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '~/lib/site';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const entries = await getCollection('spec', ({ data }) => !data.draft);
  entries.sort((a, b) => (b.data.updated ?? '').localeCompare(a.data.updated ?? ''));
  return rss({
    title: site.name,
    description: site.description,
    site: context.site?.toString() ?? site.url,
    items: entries.map((e) => {
      const slug = e.data.slug ?? e.id.split('/').pop()!;
      return {
        title: e.data.title,
        description: e.data.summary,
        pubDate: e.data.updated ? new Date(e.data.updated) : new Date(),
        link: `/spec/${e.data.category}/${slug}/`,
        categories: [e.data.category, e.data.status],
      };
    }),
    customData: '<language>en-GB</language>',
  });
}
