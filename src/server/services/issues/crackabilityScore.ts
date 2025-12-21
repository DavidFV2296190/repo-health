import type { IssueInfo, CrackabilityScore } from "@/server/types";

const EASY_LABELS = [
  "good first issue",
  "beginner",
  "easy",
  "starter",
  "first-timers-only",
  "help wanted",
  "documentation",
  "docs",
  "typo",
];

const HARD_LABELS = [
  "complex",
  "breaking change",
  "architecture",
  "performance",
  "security",
  "critical",
  "major",
];

const EXPERT_LABELS = [
  "core",
  "internals",
  "compiler",
  "runtime",
  "low-level",
  "kernel",
];

function scoreDocumentationQuality(issue: IssueInfo): number {
  let score = 0;
  const body = issue.body || "";

  // Has code blocks
  if (body.includes("```")) score += 8;

  // Has reproduction steps
  if (
    body.toLowerCase().includes("reproduce") ||
    body.toLowerCase().includes("steps")
  )
    score += 6;

  // Has expected vs actual
  if (
    body.toLowerCase().includes("expected") ||
    body.toLowerCase().includes("actual")
  )
    score += 5;

  // Has images/screenshots
  if (body.includes("![") || body.includes("img")) score += 4;

  // Body length (longer = better documented)
  if (body.length > 500) score += 2;

  return Math.min(25, score);
}

function scoreCodebaseScope(issue: IssueInfo): number {
  const body = (issue.body || "").toLowerCase();
  const title = issue.title.toLowerCase();
  const combined = body + " " + title;

  // Count file references
  const fileRefs = (
    combined.match(/\.(ts|tsx|js|jsx|py|go|rs|java|cpp|c)/g) || []
  ).length;

  // Count folder/path references
  const pathRefs = (combined.match(/src\/|lib\/|components\/|pages\//g) || [])
    .length;

  // More refs = larger scope = harder
  const scopeIndicator = fileRefs + pathRefs;

  if (scopeIndicator === 0) return 20; // Unknown scope, assume medium-easy
  if (scopeIndicator <= 2) return 22;
  if (scopeIndicator <= 5) return 15;
  if (scopeIndicator <= 10) return 8;
  return 5; // Many files = complex
}

function scoreTestingRequired(issue: IssueInfo): number {
  const labels = issue.labels.map((l) => l.toLowerCase()).join(" ");
  const body = (issue.body || "").toLowerCase();

  let score = 15; // Default medium

  if (labels.includes("test") || body.includes("test")) score -= 5;
  if (labels.includes("breaking") || body.includes("breaking")) score -= 8;
  if (labels.includes("regression")) score -= 5;
  if (labels.includes("docs") || labels.includes("documentation")) score += 8;

  return Math.max(0, Math.min(25, score));
}

function scoreDependencyComplexity(issue: IssueInfo): number {
  const body = (issue.body || "").toLowerCase();

  let score = 20; // Default easy

  // Linked issues/PRs indicate complexity
  const linkedRefs = (body.match(/#\d+/g) || []).length;
  score -= linkedRefs * 3;

  // Dependency mentions
  if (body.includes("dependency") || body.includes("package")) score -= 5;
  if (body.includes("upgrade") || body.includes("migration")) score -= 8;

  return Math.max(0, Math.min(25, score));
}

function getDifficulty(score: number): "easy" | "medium" | "hard" | "expert" {
  if (score >= 75) return "easy";
  if (score >= 50) return "medium";
  if (score >= 25) return "hard";
  return "expert";
}

function estimateHours(difficulty: string): number {
  switch (difficulty) {
    case "easy":
      return 2;
    case "medium":
      return 8;
    case "hard":
      return 24;
    case "expert":
      return 80;
    default:
      return 8;
  }
}

function extractFilesLikelyTouched(issue: IssueInfo): string[] {
  const body = issue.body || "";
  const matches =
    body.match(/[\w/]+\.(ts|tsx|js|jsx|py|go|rs|java|cpp|c|md)/g) || [];
  return [...new Set(matches)].slice(0, 5);
}

function buildReasoning(
  factors: CrackabilityScore["factors"],
  labels: string[]
): string {
  const reasons: string[] = [];

  if (factors.documentationQuality >= 20) reasons.push("Well documented issue");
  else if (factors.documentationQuality < 10)
    reasons.push("Needs more context");

  if (factors.codebaseScope >= 20) reasons.push("Limited scope");
  else if (factors.codebaseScope < 10) reasons.push("Touches many files");

  if (factors.testingRequired >= 20) reasons.push("Minimal testing needed");
  else if (factors.testingRequired < 10)
    reasons.push("Extensive testing required");

  const hasEasyLabel = labels.some((l) =>
    EASY_LABELS.includes(l.toLowerCase())
  );
  if (hasEasyLabel) reasons.push("Marked as beginner-friendly");

  return reasons.join("; ") || "Standard complexity";
}

export function calculateCrackability(issue: IssueInfo): CrackabilityScore {
  const labelsLower = issue.labels.map((l) => l.toLowerCase());

  // Quick check for labeled difficulty
  const hasEasyLabel = labelsLower.some((l) => EASY_LABELS.includes(l));
  const hasHardLabel = labelsLower.some((l) => HARD_LABELS.includes(l));
  const hasExpertLabel = labelsLower.some((l) => EXPERT_LABELS.includes(l));

  // Calculate factor scores
  const factors = {
    documentationQuality: scoreDocumentationQuality(issue),
    codebaseScope: scoreCodebaseScope(issue),
    testingRequired: scoreTestingRequired(issue),
    dependencyComplexity: scoreDependencyComplexity(issue),
  };

  // Calculate overall (0-100)
  let overall =
    factors.documentationQuality +
    factors.codebaseScope +
    factors.testingRequired +
    factors.dependencyComplexity;

  // Adjust based on labels
  if (hasEasyLabel) overall = Math.min(100, overall + 20);
  if (hasHardLabel) overall = Math.max(0, overall - 25);
  if (hasExpertLabel) overall = Math.max(0, overall - 40);

  const difficulty = getDifficulty(overall);

  const score: CrackabilityScore = {
    overall,
    difficulty,
    estimatedHours: estimateHours(difficulty),
    factors,
    filesLikelyTouched: extractFilesLikelyTouched(issue),
    reasoning: buildReasoning(factors, issue.labels),
  };

  return score;
}

export function calculateAllCrackability(
  issues: IssueInfo[]
): Record<number, CrackabilityScore> {
  const scores: Record<number, CrackabilityScore> = {};
  for (const issue of issues) {
    if (issue.state === "open") {
      scores[issue.number] = calculateCrackability(issue);
    }
  }
  return scores;
}
