import rss from "@astrojs/rss";
import { useStoryblokApi } from "@storyblok/astro";

export async function GET(context) {
  const storyblokApi = useStoryblokApi();
  const { data } = await storyblokApi.get("cdn/stories", {
    content_type: "blogPost",
    version: "published",
  });

  return rss({
    title: "Tufan Calisir - Frontend Entwickler aus Hamburg",
    description: "Aktuelle Blog Posts von Tufan Calisir",
    site: context.site,
    items: data.stories.map((post) => ({
      title: post.name,
      pubDate: new Date(post.published_at),
      description: post.content.description,
      link: `/blog/${post.slug}/`,
    })),
  });
}
