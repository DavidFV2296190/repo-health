import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "@/trpc/init";
import { getUserRepos } from "../services/user/repoService";
import { prisma } from "@/lib/prisma";

type RepoSuggestion = {
  fullName: string;
  owner: string;
  name: string;
  private: boolean;
};

export const userRouter = router({
  getMyRepos: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.accessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "GitHub access token is missing or expired. Please sign in again.",
      });
    }
    return getUserRepos(ctx.session.accessToken);
  }),
  getRecentSearches: protectedProcedure.query(async ({ ctx }) => {
    return prisma.searchHistory.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { searchedAt: "desc" },
      take: 5,
    });
  }),
  saveSearch: protectedProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
        isPrivate: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { owner, repo, isPrivate } = input;
      return prisma.searchHistory.upsert({
        where: {
          userId_owner_repo: {
            userId: ctx.session.user.id,
            owner,
            repo,
          },
        },
        update: { searchedAt: new Date(), isPrivate },
        create: {
          userId: ctx.session.user.id,
          owner,
          repo,
          fullName: `${owner}/${repo}`,
          isPrivate,
        },
      });
    }),

  searchRepos: publicProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ input, ctx }): Promise<RepoSuggestion[]> => {
      try {
        // Use the current user's access token if signed in, otherwise fall back to app token
        // This ensures private repos only appear for their actual owner
        const token = ctx.session?.accessToken || process.env.GITHUB_TOKEN;

        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(input.query)}&per_page=5`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
              ...(token && {
                Authorization: `Bearer ${token}`,
              }),
            },
          }
        );

        if (!response.ok) return [];

        const data = await response.json();
        return (
          data.items?.map(
            (repo: {
              full_name: string;
              owner: { login: string };
              name: string;
              private: boolean;
            }) => ({
              fullName: repo.full_name,
              owner: repo.owner.login,
              name: repo.name,
              private: repo.private,
            })
          ) || []
        );
      } catch {
        return [];
      }
    }),
});
