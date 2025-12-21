import { cacheService } from "@/lib/redis";

const DEVTO_API_BASE = "https://dev.to/api";
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours

export type DevToArticle = {
  id: number;
  title: string;
  url: string;
  description: string;
  tags: string[];
  readingTimeMinutes: number;
  positiveReactions: number;
};

export async function searchByTag(
  tag: string,
  limit = 5
): Promise<DevToArticle[]> {
  const cacheKey = `devto:tag:${tag}:${limit}`;

  const cached = await cacheService.get<DevToArticle[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `${DEVTO_API_BASE}/articles?tag=${encodeURIComponent(tag)}&per_page=${limit}&top=30`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    const articles: DevToArticle[] = data.map((item: any) => {
      const article: DevToArticle = {
        id: item.id,
        title: item.title,
        url: item.url,
        description: item.description || "",
        tags: item.tag_list || [],
        readingTimeMinutes: item.reading_time_minutes || 0,
        positiveReactions: item.positive_reactions_count || 0,
      };
      return article;
    });

    await cacheService.set(cacheKey, articles, CACHE_TTL_SECONDS);
    return articles;
  } catch {
    return [];
  }
}

export async function searchArticles(
  query: string,
  limit = 5
): Promise<DevToArticle[]> {
  const cacheKey = `devto:search:${query.slice(0, 30)}:${limit}`;

  const cached = await cacheService.get<DevToArticle[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const tag = query.split(/\s+/)[0]?.toLowerCase() || "programming";
  const articles = await searchByTag(tag, limit);

  await cacheService.set(cacheKey, articles, CACHE_TTL_SECONDS);
  return articles;
}
