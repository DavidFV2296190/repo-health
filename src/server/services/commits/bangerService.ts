import { Commit, BangerCommit } from "../../types";
import { getTopBangers } from "./bangerScorer";
import { explainBangers } from "./bangerExplainer";
import { cacheService } from "@/lib/redis";
import { getTokenHash } from "../github/shared";

const CACHE_TTL = 60 * 60 * 24; // 24 hours
export async function getBangerCommits(
  commits: Commit[],
  owner: string,
  repo: string,
  accessToken?: string | null
): Promise<BangerCommit[]> {
  if (commits.length === 0) {
    return [];
  }
  const tokenHash = getTokenHash(accessToken);
  const latestSha = commits[0].sha;
  const cacheKey = `banger:${owner}:${repo}:${latestSha}:${tokenHash}`;
  const cached = await cacheService.get<BangerCommit[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const topBangers = getTopBangers(commits, 5);
  if (topBangers.length === 0) {
    return [];
  }

  const explained = await explainBangers(topBangers);
  await cacheService.set(cacheKey, explained, CACHE_TTL);
  return explained;
}
