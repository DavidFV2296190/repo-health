import { z } from "zod";
import { router, publicProcedure } from "../../trpc/init";
import * as issueService from "../services/issues/analyze";

export const issueRouter = router({
  analyze: publicProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await issueService.analyze({
        owner: input.owner,
        repo: input.repo,
        token: ctx.session?.accessToken,
      });
      return result;
    }),
});
