import { router, publicProcedure } from "../../trpc/init";
import { rateLimitService } from "@/lib/rateLimit";

export const rateLimitRouter = router({
  // Check if the current anonymous user can perform a search
  // Returns allowed: true if they can, or retryAfterSeconds if rate limited

  checkLimit: publicProcedure.query(async ({ ctx }) => {
    // Signed-in users are never rate limited
    if (ctx.session?.user) {
      return { allowed: true };
    }

    const ip = ctx.clientIp || "unknown";
    return await rateLimitService.checkLimit(ip);
  }),

  // Record that a search was performed by an anonymous user
  // it should be called after a successful search
  recordSearch: publicProcedure.mutation(async ({ ctx }) => {
    // Don't record for signed-in users
    if (ctx.session?.user) {
      return { success: true };
    }

    const ip = ctx.clientIp || "unknown";
    await rateLimitService.recordSearch(ip);
    return { success: true };
  }),

  // Get current rate limit status for display purposes
  getStatus: publicProcedure.query(async ({ ctx }) => {
    if (ctx.session?.user) {
      return {
        isSignedIn: true,
        isLimited: false,
        retryAfterSeconds: 0,
      };
    }

    const ip = ctx.clientIp || "unknown";
    const result = await rateLimitService.checkLimit(ip);

    return {
      isSignedIn: false,
      isLimited: !result.allowed,
      retryAfterSeconds: result.retryAfterSeconds || 0,
    };
  }),
});
