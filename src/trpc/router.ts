import { router } from "./init";
import { repoRouter } from "../server/routers/repoRouter";
import { healthRouter } from "../server/routers/healthRouter";
import { dependencyRouter } from "../server/routers/dependencyRouter";
import { prRouter } from "../server/routers/prRouter";
import { userRouter } from "../server/routers/userRouter";

export const appRouter = router({
  repo: repoRouter,
  health: healthRouter,
  dependency: dependencyRouter,
  pr: prRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
