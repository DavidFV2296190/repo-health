import { cacheService } from "@/lib/redis";

const SO_API_BASE = "https://api.stackexchange.com/2.3";
const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours

export type StackOverflowQuestion = {
  id: number;
  title: string;
  url: string;
  score: number;
  answerCount: number;
  isAnswered: boolean;
  tags: string[];
  createdAt: string;
};

export async function searchQuestions(
  query: string,
  tags: string[],
  limit = 5
): Promise<StackOverflowQuestion[]> {
  const tagString = tags.slice(0, 3).join(";");
  const cacheKey = `so:search:${query.slice(0, 30)}:${tagString}:${limit}`;

  const cached = await cacheService.get<StackOverflowQuestion[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    order: "desc",
    sort: "relevance",
    site: "stackoverflow",
    pagesize: String(limit),
    filter: "!nNPvSNPI7A",
  });

  if (tags.length > 0) {
    params.set("tagged", tagString);
  }
  params.set("intitle", query.slice(0, 100));

  const url = `${SO_API_BASE}/search/advanced?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const items = data.items || [];

    const questions: StackOverflowQuestion[] = items.map((item: any) => {
      const question: StackOverflowQuestion = {
        id: item.question_id,
        title: item.title,
        url: item.link,
        score: item.score || 0,
        answerCount: item.answer_count || 0,
        isAnswered: item.is_answered || false,
        tags: item.tags || [],
        createdAt: new Date(item.creation_date * 1000).toISOString(),
      };
      return question;
    });

    await cacheService.set(cacheKey, questions, CACHE_TTL_SECONDS);
    return questions;
  } catch {
    return [];
  }
}

export async function searchByTags(
  tags: string[],
  limit = 5
): Promise<StackOverflowQuestion[]> {
  const tagString = tags.slice(0, 5).join(";");
  const cacheKey = `so:tags:${tagString}:${limit}`;

  const cached = await cacheService.get<StackOverflowQuestion[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    order: "desc",
    sort: "votes",
    site: "stackoverflow",
    pagesize: String(limit),
    tagged: tagString,
    filter: "!nNPvSNPI7A",
  });

  const url = `${SO_API_BASE}/questions?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
      },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const items = data.items || [];

    const questions: StackOverflowQuestion[] = items.map((item: any) => {
      const question: StackOverflowQuestion = {
        id: item.question_id,
        title: item.title,
        url: item.link,
        score: item.score || 0,
        answerCount: item.answer_count || 0,
        isAnswered: item.is_answered || false,
        tags: item.tags || [],
        createdAt: new Date(item.creation_date * 1000).toISOString(),
      };
      return question;
    });

    await cacheService.set(cacheKey, questions, CACHE_TTL_SECONDS);
    return questions;
  } catch {
    return [];
  }
}
