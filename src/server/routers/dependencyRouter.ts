import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import { depsService } from "../services/deps/analyze";

const repoInput = z.object({
  owner: z.string(),
  repo: z.string(),
});

export const dependencyRouter = router({
  analyze: publicProcedure.input(repoInput).query(async ({ input, ctx }) => {
    const accessToken = ctx.session?.accessToken;
    return await depsService.analyze(input.owner, input.repo, accessToken);
  }),
  getRelatedPRs: publicProcedure
    .input(z.object({ vulnId: z.string() }))
    .query(async ({ input }) => {
      return await depsService.searchRelatedPRs(input.vulnId);
    }),

  checkIssueExists: publicProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
        vulnId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await depsService.checkIssueExists(
        input.owner,
        input.repo,
        input.vulnId
      );
    }),
});
