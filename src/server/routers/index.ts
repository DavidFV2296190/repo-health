import { router } from "../../trpc/init";
import { repoRouter } from "./repoRouter";
import { healthRouter } from "./healthRouter";
import { dependencyRouter } from "./dependencyRouter";
import { prRouter } from "./prRouter";
import { userRouter } from "./userRouter";
import { issueRouter } from "./issueRouter";
import { securityRouter } from "./securityRouter";

export const appRouter = router({
  repo: repoRouter,
  health: healthRouter,
  dependency: dependencyRouter,
  pr: prRouter,
  user: userRouter,
  issue: issueRouter,
  security: securityRouter,
});

export type AppRouter = typeof appRouter;
