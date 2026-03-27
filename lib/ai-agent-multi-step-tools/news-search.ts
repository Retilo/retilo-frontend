import { tool, type UIToolInvocation } from "ai";
import { z } from "zod";

export const NewsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url().optional(),
  publishedAt: z.string().optional(),
});

export const NewsSearchSchema = z.object({
  topic: z.string(),
  items: z.array(NewsItemSchema),
});

export type NewsItem = z.infer<typeof NewsItemSchema>;
export type NewsSearchResult = z.infer<typeof NewsSearchSchema>;

export const newsSearchTool = tool({
  description:
    "Search for recent news headlines related to a topic using Hacker News.",
  inputSchema: z.object({
    topic: z.string().min(1),
    limit: z.number().min(1).max(20).default(5),
  }),
  async *execute({ topic, limit }: { topic: string; limit: number }) {
    yield { state: "loading" as const };

    try {
      const url = `https://hn.algolia.com/api/v1/search?${new URLSearchParams({
        query: topic,
        tags: "story",
        hitsPerPage: String(limit),
      }).toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`News API failed: ${res.status}`);
      const data = await res.json();

      const items: NewsItem[] = (data.hits || []).map((h: any) => ({
        id: String(h.objectID),
        title: h.title || h.story_title || "(untitled)",
        url: h.url || h.story_url || undefined,
        publishedAt: h.created_at || undefined,
      }));

      yield {
        state: "ready" as const,
        topic,
        items,
      };
    } catch (error) {
      console.error("News search error:", error);
      yield {
        state: "ready" as const,
        topic,
        items: [
          {
            id: "error",
            title: "News search failed",
            url: "https://news.ycombinator.com",
            publishedAt: new Date().toISOString(),
          },
        ],
      };
    }
  },
});

export type NewsSearchUIToolInvocation = UIToolInvocation<
  typeof newsSearchTool
>;

export default newsSearchTool;
