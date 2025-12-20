import { Octokit } from "@octokit/rest";
import { cacheService } from "@/lib/redis";

const CACHE_TTL = 10 * 60;

export type UserRepo = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
};

export async function getUserRepos(accessToken: string): Promise<UserRepo[]> {
  const cacheKey = `user-repos:${accessToken.slice(-8)}`;

  // Check cache first
  const cached = await cacheService.get<UserRepo[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const octokit = new Octokit({ auth: accessToken });

  try {
    const repos = await octokit.paginate(
      octokit.repos.listForAuthenticatedUser,
      {
        visibility: "all",
        affiliation: "owner,collaborator,organization_member",
        sort: "updated",
        per_page: 100,
      }
    );

    const userRepos: UserRepo[] = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner?.login ?? "",
      private: repo.private,
    }));

    // Cache the results
    await cacheService.set(cacheKey, userRepos, CACHE_TTL);

    return userRepos;
  } catch (error) {
    console.error("Failed to fetch user repos:", error);
    return [];
  }
}
