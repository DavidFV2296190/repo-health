import type { IssueInfo, HiddenGem } from "@/server/types";

const HIGH_IMPACT_LABELS = [
  "enhancement",
  "feature",
  "feature request",
  "improvement",
  "performance",
  "ux",
  "dx",
  "accessibility",
  "a11y",
];

const STALE_DAYS_THRESHOLD = 30;

function calculateImpactScore(issue: IssueInfo): number {
  let score = 0;

  // Reactions indicate community interest
  score += Math.min(30, issue.reactions * 3);

  // High-impact labels
  const hasImpactLabel = issue.labels.some((l) =>
    HIGH_IMPACT_LABELS.includes(l.toLowerCase())
  );
  if (hasImpactLabel) score += 20;

  // Body length indicates effort put into describing
  const bodyLength = (issue.body || "").length;
  if (bodyLength > 500) score += 10;
  if (bodyLength > 1000) score += 10;

  return Math.min(100, score);
}

function calculateEngagementScore(issue: IssueInfo): number {
  let score = 0;

  // Comments show discussion
  score += Math.min(30, issue.commentsCount * 5);

  // Reactions show interest without commenting
  score += Math.min(30, issue.reactions * 2);

  // Multiple assignees show it's getting attention
  score += issue.assignees.length * 10;

  return Math.min(100, score);
}

function calculateStaleDays(issue: IssueInfo): number {
  const now = Date.now();
  const updated = new Date(issue.updatedAt).getTime();
  return Math.floor((now - updated) / (1000 * 60 * 60 * 24));
}

function buildReason(issue: IssueInfo, staleDays: number): string {
  const reasons: string[] = [];

  if (issue.reactions >= 5) {
    reasons.push(`${issue.reactions} reactions`);
  }

  if (staleDays >= 90) {
    reasons.push("Stale for 90+ days");
  } else if (staleDays >= 30) {
    reasons.push("Stale for 30+ days");
  }

  const hasImpactLabel = issue.labels.some((l) =>
    HIGH_IMPACT_LABELS.includes(l.toLowerCase())
  );
  if (hasImpactLabel) {
    reasons.push("High-impact label");
  }

  if (issue.commentsCount >= 5) {
    reasons.push(`${issue.commentsCount} comments`);
  }

  return reasons.join("; ") || "Needs attention";
}

export function findHiddenGems(issues: IssueInfo[]): HiddenGem[] {
  const openIssues = issues.filter((i) => i.state === "open");

  const scored = openIssues.map((issue) => {
    const staleDays = calculateStaleDays(issue);
    const impactScore = calculateImpactScore(issue);
    const engagementScore = calculateEngagementScore(issue);

    // Combined score: high impact + some engagement + stale = hidden gem
    const gemScore =
      impactScore * 0.4 + engagementScore * 0.3 + Math.min(30, staleDays * 0.3);

    return {
      issue,
      gemScore,
      impactScore,
      engagementScore,
      staleDays,
    };
  });

  // Filter: Must be stale (30+ days) and have some impact
  const filtered = scored
    .filter((s) => s.staleDays >= STALE_DAYS_THRESHOLD && s.impactScore >= 20)
    .sort((a, b) => b.gemScore - a.gemScore)
    .slice(0, 10);

  const gems: HiddenGem[] = filtered.map((s) => {
    const gem: HiddenGem = {
      number: s.issue.number,
      title: s.issue.title,
      url: s.issue.url,
      reason: buildReason(s.issue, s.staleDays),
      impactScore: s.impactScore,
      engagementScore: s.engagementScore,
      staleDays: s.staleDays,
    };
    return gem;
  });

  return gems;
}
