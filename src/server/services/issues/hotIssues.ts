import type { IssueInfo, HotIssue } from "@/server/types";

const SECURITY_KEYWORDS = [
  "security",
  "vulnerability",
  "cve",
  "exploit",
  "xss",
  "csrf",
  "injection",
  "auth",
  "authentication",
  "permission",
  "access control",
];

const HOT_WINDOW_HOURS = 48;

function hasSecurityKeyword(issue: IssueInfo): boolean {
  const text = `${issue.title} ${issue.body || ""}`.toLowerCase();
  return SECURITY_KEYWORDS.some((kw) => text.includes(kw));
}

function calculateHotScore(issue: IssueInfo): number {
  const now = Date.now();
  const updated = new Date(issue.updatedAt).getTime();
  const created = new Date(issue.createdAt).getTime();

  // Hours since last update
  const hoursSinceUpdate = (now - updated) / (1000 * 60 * 60);

  // If updated recently, it's hotter
  let recencyBoost = 0;
  if (hoursSinceUpdate < 6) recencyBoost = 40;
  else if (hoursSinceUpdate < 24) recencyBoost = 25;
  else if (hoursSinceUpdate < 48) recencyBoost = 10;

  // Age factor - newer issues are hotter
  const hoursSinceCreated = (now - created) / (1000 * 60 * 60);
  const ageBoost =
    hoursSinceCreated < 24 ? 20 : hoursSinceCreated < 72 ? 10 : 0;

  // Activity metrics
  const commentScore = Math.min(30, issue.commentsCount * 5);
  const reactionScore = Math.min(20, issue.reactions * 2);

  // Security issues are always hot
  const securityBoost = hasSecurityKeyword(issue) ? 30 : 0;

  return recencyBoost + ageBoost + commentScore + reactionScore + securityBoost;
}

export function findHotIssues(issues: IssueInfo[]): HotIssue[] {
  const now = Date.now();
  const hotWindowMs = HOT_WINDOW_HOURS * 60 * 60 * 1000;

  // Filter to recently active issues
  const recentlyActive = issues.filter((issue) => {
    const updated = new Date(issue.updatedAt).getTime();
    return now - updated < hotWindowMs;
  });

  const scored = recentlyActive.map((issue) => ({
    issue,
    hotScore: calculateHotScore(issue),
  }));

  const sortedScored = scored
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, 10);

  const hotIssuesList: HotIssue[] = sortedScored.map((s) => {
    const hotIssue: HotIssue = {
      number: s.issue.number,
      title: s.issue.title,
      url: s.issue.url,
      hotScore: s.hotScore,
      recentComments: s.issue.commentsCount,
      recentReactions: s.issue.reactions,
      hasSecurityKeyword: hasSecurityKeyword(s.issue),
    };
    return hotIssue;
  });

  return hotIssuesList;
}
