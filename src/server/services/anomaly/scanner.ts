import type { CommitWithStats } from "../../types";
import type { PatternAnomaly } from "./patterns";
import { detectChurnAnomalies, detectFileAnomalies } from "./patterns";
import {
  detectVelocityAnomalies,
  detectWeekendActivity,
  detectBurstActivity,
} from "./timeAnalysis";

export type AnomalySummary = {
  critical: number;
  warning: number;
  info: number;
};

export type AnomalyResult = {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  events: PatternAnomaly[];
  summary: AnomalySummary;
  commitsAnalyzed: number;
};

function calculateScore(events: PatternAnomaly[]): number {
  let score = 0;
  for (const event of events) {
    if (event.severity === "critical") score += 20;
    else if (event.severity === "warning") score += 8;
    else score += 2;
  }
  return Math.min(100, score);
}

function getGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score <= 10) return "A";
  if (score <= 30) return "B";
  if (score <= 50) return "C";
  if (score <= 70) return "D";
  return "F";
}

export function analyzeActivity(
  commits: CommitWithStats[],
  owner: string,
  repo: string
): AnomalyResult {
  // Run all detectors
  const allAnomalies: PatternAnomaly[] = [
    ...detectChurnAnomalies(commits, owner, repo),
    ...detectFileAnomalies(commits, owner, repo),
    ...detectVelocityAnomalies(commits, owner, repo),
    ...detectWeekendActivity(commits),
    ...detectBurstActivity(commits, owner, repo),
  ];

  // Sort by timestamp (newest first)
  allAnomalies.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Deduplicate
  const seen = new Set<string>();
  const events = allAnomalies.filter((e) => {
    const key = `${e.type}-${e.commit?.sha || e.timestamp}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const summary: AnomalySummary = {
    critical: events.filter((e) => e.severity === "critical").length,
    warning: events.filter((e) => e.severity === "warning").length,
    info: events.filter((e) => e.severity === "info").length,
  };

  const score = calculateScore(events);

  return {
    score,
    grade: getGrade(score),
    events: events.slice(0, 50), // Limit to 50
    summary,
    commitsAnalyzed: commits.length,
  };
}
