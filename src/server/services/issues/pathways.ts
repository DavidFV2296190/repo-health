import type {
  IssueInfo,
  IssuePathway,
  CrackabilityScore,
} from "@/server/types";

const TOPIC_KEYWORDS: Record<string, string[]> = {
  Documentation: ["docs", "documentation", "readme", "typo", "comment"],
  Testing: ["test", "testing", "coverage", "spec", "e2e", "unit"],
  "UI/UX": ["ui", "ux", "design", "style", "css", "layout", "responsive"],
  Performance: ["performance", "optimization", "speed", "memory", "slow"],
  Security: ["security", "auth", "permission", "vulnerability"],
  "Bug Fixes": ["bug", "fix", "issue", "error", "crash"],
  Features: ["feature", "enhancement", "improvement", "add"],
  Refactoring: ["refactor", "cleanup", "deprecate", "technical debt"],
  "Build/CI": ["build", "ci", "cd", "deploy", "docker", "github actions"],
  Dependencies: ["dependency", "upgrade", "update", "package"],
};

function detectTopic(issue: IssueInfo): string {
  const text = `${issue.title} ${issue.labels.join(" ")}`.toLowerCase();

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return topic;
    }
  }

  return "General";
}

function mapDifficultyToLevel(
  difficulty: CrackabilityScore["difficulty"]
): "beginner" | "intermediate" | "advanced" {
  switch (difficulty) {
    case "easy":
      return "beginner";
    case "medium":
      return "intermediate";
    case "hard":
    case "expert":
      return "advanced";
    default:
      return "intermediate";
  }
}

export function buildPathways(
  issues: IssueInfo[],
  crackabilityScores: Record<number, CrackabilityScore>
): IssuePathway[] {
  const openIssues = issues.filter((i) => i.state === "open");

  // Group issues by level and topic
  const grouped: Record<string, Record<string, IssueInfo[]>> = {
    beginner: {},
    intermediate: {},
    advanced: {},
  };

  for (const issue of openIssues) {
    const score = crackabilityScores[issue.number];
    if (!score) continue;

    const level = mapDifficultyToLevel(score.difficulty);
    const topic = detectTopic(issue);

    if (!grouped[level][topic]) {
      grouped[level][topic] = [];
    }
    grouped[level][topic].push(issue);
  }

  // Build pathways
  const pathways: IssuePathway[] = [];

  for (const [level, topics] of Object.entries(grouped)) {
    for (const [topic, topicIssues] of Object.entries(topics)) {
      if (topicIssues.length > 0) {
        const issueList = topicIssues.slice(0, 5).map((i) => {
          const issueRef = {
            number: i.number,
            title: i.title,
            url: i.url,
          };
          return issueRef;
        });

        const pathway: IssuePathway = {
          level: level as IssuePathway["level"],
          topic,
          issues: issueList,
        };

        pathways.push(pathway);
      }
    }
  }

  // Sort: beginner first, then by number of issues
  return pathways.sort((a, b) => {
    const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    const levelDiff = levelOrder[a.level] - levelOrder[b.level];
    if (levelDiff !== 0) return levelDiff;
    return b.issues.length - a.issues.length;
  });
}
