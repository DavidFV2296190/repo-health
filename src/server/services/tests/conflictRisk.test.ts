import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateConflictRisk } from "../prs/conflictRisk";
import type { GitHubPR } from "../../types";

// Mock AI to avoid API calls
vi.mock("../insights/analyzeConflictReasons", () => ({
  analyzeConflictReasons: vi.fn().mockResolvedValue(
    new Map([
      [1, "Mock reason"],
      [2, "Mock reason"],
    ])
  ),
}));

const FROZEN_TIME = new Date("2025-01-15T12:00:00Z");

const createOpenPR = (overrides: Partial<GitHubPR> = {}): GitHubPR => ({
  number: 1,
  title: "Test PR",
  html_url: "https://github.com/test/repo/pull/1",
  created_at: new Date(
    FROZEN_TIME.getTime() - 10 * 24 * 60 * 60 * 1000
  ).toISOString(),
  author_association: "CONTRIBUTOR",
  user: { login: "community-user", type: "User" },
  ...overrides,
});

const createMergedPR = (overrides: Partial<GitHubPR> = {}): GitHubPR => ({
  number: 100,
  title: "Merged PR",
  html_url: "https://github.com/test/repo/pull/100",
  created_at: new Date(
    FROZEN_TIME.getTime() - 20 * 24 * 60 * 60 * 1000
  ).toISOString(),
  merged_at: new Date(
    FROZEN_TIME.getTime() - 5 * 24 * 60 * 60 * 1000
  ).toISOString(),
  author_association: "MEMBER",
  user: { login: "maintainer", type: "User" },
  ...overrides,
});

const daysAgo = (days: number) =>
  new Date(FROZEN_TIME.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

describe("calculateConflictRisk", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FROZEN_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Filtering
  describe("filtering community vs maintainer/bot PRs", () => {
    it("excludes OWNER PRs", async () => {
      const result = await calculateConflictRisk(
        [createOpenPR({ author_association: "OWNER" })],
        [createMergedPR()]
      );
      expect(result.atRiskPRs).toHaveLength(0);
    });

    it("excludes MEMBER PRs", async () => {
      const result = await calculateConflictRisk(
        [createOpenPR({ author_association: "MEMBER" })],
        [createMergedPR()]
      );
      expect(result.atRiskPRs).toHaveLength(0);
    });

    it("excludes COLLABORATOR PRs", async () => {
      const result = await calculateConflictRisk(
        [createOpenPR({ author_association: "COLLABORATOR" })],
        [createMergedPR()]
      );
      expect(result.atRiskPRs).toHaveLength(0);
    });

    it("excludes ALL bot types", async () => {
      const bots = [
        { login: "dependabot[bot]", type: "Bot" },
        { login: "renovate[bot]", type: "Bot" },
        { login: "github-actions[bot]", type: "Bot" },
        { login: "some-random-bot", type: "Bot" },
      ];

      for (const bot of bots) {
        const result = await calculateConflictRisk(
          [createOpenPR({ user: bot })],
          [createMergedPR()]
        );
        expect(result.atRiskPRs).toHaveLength(0);
      }
    });

    it("includes CONTRIBUTOR, FIRST_TIME_CONTRIBUTOR, NONE", async () => {
      const associations = ["CONTRIBUTOR", "FIRST_TIME_CONTRIBUTOR", "NONE"];

      for (const assoc of associations) {
        const result = await calculateConflictRisk(
          [createOpenPR({ author_association: assoc })],
          [createMergedPR()]
        );
        expect(result.atRiskPRs).toHaveLength(1);
      }
    });
  });

  // Risk calculations
  describe("risk score calculation", () => {
    it("calculates days correctly for various time spans", async () => {
      const testCases = [3, 7, 15, 30, 90, 365];

      for (const days of testCases) {
        const result = await calculateConflictRisk(
          [createOpenPR({ created_at: daysAgo(days) })],
          [createMergedPR({ merged_at: daysAgo(1) })]
        );
        expect(result.atRiskPRs[0].daysSinceCreated).toBe(days);
      }
    });

    it("counts ONLY PRs merged AFTER open PR was created", async () => {
      const result = await calculateConflictRisk(
        [createOpenPR({ created_at: daysAgo(10) })],
        [
          createMergedPR({ number: 100, merged_at: daysAgo(5) }), // after - counts
          createMergedPR({ number: 101, merged_at: daysAgo(3) }), // after - counts
          createMergedPR({ number: 102, merged_at: daysAgo(15) }), // before - ignored
          createMergedPR({ number: 103, merged_at: daysAgo(20) }), // before - ignored
        ]
      );
      expect(result.atRiskPRs[0].prsMergedAfter).toBe(2);
    });

    it("calculates risk score formula: (days × mergedAfter) / 10", async () => {
      // 20 days × 5 merged = 100 / 10 = 10
      const result = await calculateConflictRisk(
        [createOpenPR({ created_at: daysAgo(20) })],
        Array(5)
          .fill(null)
          .map((_, i) =>
            createMergedPR({ number: 100 + i, merged_at: daysAgo(10) })
          )
      );
      expect(result.atRiskPRs[0].riskScore).toBe(10);
    });

    it("handles extreme risk scores correctly", async () => {
      // 365 days × 100 merged = 36500 / 10 = 3650
      const result = await calculateConflictRisk(
        [createOpenPR({ created_at: daysAgo(365) })],
        Array(100)
          .fill(null)
          .map((_, i) =>
            createMergedPR({ number: 100 + i, merged_at: daysAgo(1) })
          )
      );
      expect(result.atRiskPRs[0].riskScore).toBe(3650);
    });
  });

  // Thresholds (brutal edge cases)
  describe("threshold requirements", () => {
    it("rejects PRs at exactly 2 days (boundary)", async () => {
      const result = await calculateConflictRisk(
        [createOpenPR({ created_at: daysAgo(2) })],
        [createMergedPR({ merged_at: daysAgo(1) })]
      );
      expect(result.atRiskPRs).toHaveLength(0);
    });

    it("accepts PRs at exactly 3 days (boundary)", async () => {
      const result = await calculateConflictRisk(
        [createOpenPR({ created_at: daysAgo(3) })],
        [createMergedPR({ merged_at: daysAgo(1) })]
      );
      expect(result.atRiskPRs).toHaveLength(1);
    });

    it("rejects PRs with 0 merged after (no risk)", async () => {
      const result = await calculateConflictRisk(
        [createOpenPR({ created_at: daysAgo(100) })],
        []
      );
      expect(result.atRiskPRs).toHaveLength(0);
    });

    it("rejects when ALL merged PRs are BEFORE open PR", async () => {
      const result = await calculateConflictRisk(
        [createOpenPR({ created_at: daysAgo(5) })],
        [
          createMergedPR({ merged_at: daysAgo(10) }),
          createMergedPR({ number: 101, merged_at: daysAgo(20) }),
        ]
      );
      expect(result.atRiskPRs).toHaveLength(0);
    });
  });

  // Sorting and limiting
  describe("sorting and limiting", () => {
    it("sorts by riskScore descending (highest risk first)", async () => {
      const result = await calculateConflictRisk(
        [
          createOpenPR({ number: 1, created_at: daysAgo(5) }), // low
          createOpenPR({ number: 2, created_at: daysAgo(100) }), // high
          createOpenPR({ number: 3, created_at: daysAgo(30) }), // medium
        ],
        [createMergedPR({ merged_at: daysAgo(1) })]
      );
      expect(result.atRiskPRs.map((pr) => pr.number)).toEqual([2, 3, 1]);
    });

    it("returns EXACTLY 5 when 10 qualify", async () => {
      const result = await calculateConflictRisk(
        Array(10)
          .fill(null)
          .map((_, i) =>
            createOpenPR({ number: i + 1, created_at: daysAgo(10) })
          ),
        [createMergedPR()]
      );
      expect(result.atRiskPRs).toHaveLength(5);
    });

    it("returns EXACTLY 5 when 100 qualify", async () => {
      const result = await calculateConflictRisk(
        Array(100)
          .fill(null)
          .map((_, i) =>
            createOpenPR({ number: i + 1, created_at: daysAgo(10) })
          ),
        [createMergedPR()]
      );
      expect(result.atRiskPRs).toHaveLength(5);
    });

    it("returns all when fewer than 5 qualify", async () => {
      const result = await calculateConflictRisk(
        [createOpenPR({ number: 1 }), createOpenPR({ number: 2 })],
        [createMergedPR()]
      );
      expect(result.atRiskPRs).toHaveLength(2);
    });
  });

  // Average wait days
  describe("average wait days", () => {
    it("calculates correct average", async () => {
      const result = await calculateConflictRisk(
        [
          createOpenPR({ number: 1, created_at: daysAgo(10) }),
          createOpenPR({ number: 2, created_at: daysAgo(20) }),
          createOpenPR({ number: 3, created_at: daysAgo(30) }),
        ],
        [createMergedPR()]
      );
      expect(result.avgWaitDays).toBe(20); // (10+20+30)/3
    });

    it("rounds to nearest integer", async () => {
      const result = await calculateConflictRisk(
        [
          createOpenPR({ number: 1, created_at: daysAgo(10) }),
          createOpenPR({ number: 2, created_at: daysAgo(11) }),
        ],
        [createMergedPR()]
      );
      expect(result.avgWaitDays).toBe(11); // (10+11)/2 = 10.5 → 11
    });

    it("returns 0 when no PRs at risk", async () => {
      const result = await calculateConflictRisk([], []);
      expect(result.avgWaitDays).toBe(0);
    });
  });

  // Edge cases (brutal)
  describe("edge cases and error handling", () => {
    it("handles empty arrays", async () => {
      const result = await calculateConflictRisk([], []);
      expect(result.atRiskPRs).toHaveLength(0);
      expect(result.avgWaitDays).toBe(0);
    });

    it("handles null user", async () => {
      const result = await calculateConflictRisk(
        [createOpenPR({ user: null })],
        [createMergedPR()]
      );
      expect(result.atRiskPRs[0].author).toBe("unknown");
    });

    it("handles undefined user", async () => {
      const result = await calculateConflictRisk(
        [createOpenPR({ user: undefined })],
        [createMergedPR()]
      );
      expect(result.atRiskPRs[0].author).toBe("unknown");
    });

    it("handles empty user login (falls back to unknown)", async () => {
      const result = await calculateConflictRisk(
        [createOpenPR({ user: { login: "", type: "User" } })],
        [createMergedPR()]
      );
      // Empty string is falsy, so falls back to "unknown"
      expect(result.atRiskPRs[0].author).toBe("unknown");
    });

    it("survives malformed date strings", async () => {
      await expect(
        calculateConflictRisk(
          [createOpenPR({ created_at: "not-a-date" })],
          [createMergedPR()]
        )
      ).resolves.toBeDefined();
    });

    it("handles PRs created in the future (time travel)", async () => {
      const futureDate = new Date(
        FROZEN_TIME.getTime() + 10 * 24 * 60 * 60 * 1000
      ).toISOString();
      const result = await calculateConflictRisk(
        [createOpenPR({ created_at: futureDate })],
        [createMergedPR()]
      );
      // Negative days should fail threshold
      expect(result.atRiskPRs).toHaveLength(0);
    });

    it("handles merged_at being null in merged PRs", async () => {
      await expect(
        calculateConflictRisk(
          [createOpenPR()],
          [createMergedPR({ merged_at: null })]
        )
      ).resolves.toBeDefined();
    });
  });
});
