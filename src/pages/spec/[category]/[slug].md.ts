import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { site } from "~/lib/site";

export const getStaticPaths: GetStaticPaths = async () => {
  const all = await getCollection("spec", ({ data }) => !data.draft);
  return all.map((entry) => {
    const slug = entry.data.slug ?? entry.id.split("/").pop()!;
    return {
      params: { category: entry.data.category, slug },
      props: { entry },
    };
  });
};

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as Awaited<
    ReturnType<typeof getCollection<"spec">>
  >[number];
  const slug = entry.data.slug ?? entry.id.split("/").pop()!;
  const url = `${site.url}/spec/${entry.data.category}/${slug}/`;

  const fm: string[] = ["---"];
  fm.push(`title: ${JSON.stringify(entry.data.title)}`);
  fm.push(`category: ${entry.data.category}`);
  fm.push(`status: ${entry.data.status}`);
  fm.push(`url: ${url}`);
  if (entry.data.updated)
    fm.push(`updated: ${JSON.stringify(entry.data.updated)}`);
  if (entry.data.sources?.length) {
    fm.push("sources:");
    for (const s of entry.data.sources) {
      fm.push(`  - title: ${JSON.stringify(s.title)}`);
      fm.push(`    url: ${JSON.stringify(s.url)}`);
      if (s.publisher) fm.push(`    publisher: ${JSON.stringify(s.publisher)}`);
    }
  }
  fm.push(`source_repo: ${site.repo}`);
  fm.push(`licence: CC-BY-4.0`);
  fm.push("---");

  const body = [
    fm.join("\n"),
    "",
    `# ${entry.data.title}`,
    "",
    `> ${entry.data.summary}`,
    "",
    entry.body?.trim() ?? "",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Robots-Tag": "index, follow",
    },
  });
};
