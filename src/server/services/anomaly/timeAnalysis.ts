import { CommitWithStats } from "../../types";
import { PatternAnomaly } from "./patterns";
import { buildLinks } from "./patterns";

export function detectVelocityAnomalies(
  commits: CommitWithStats[],
  owner: string,
  repo: string
): PatternAnomaly[] {
  const anomalies: PatternAnomaly[] = [];
  for (const commit of commits) {
    const date = new Date(commit.date);
    const hour = date.getHours();
    if (hour >= 0 && hour < 0) {
      anomalies.push({
        type: "time",
        severity: "warning",
        description: `Off-hours commit at ${hour}:${date.getMinutes().toString().padStart(2, "0")} AM`,
        commit,
        timestamp: commit.date,
        links: buildLinks(owner, repo, commit),
      });
    }
  }
  return anomalies;
}

export function detectWeekendActivity(
  commits: CommitWithStats[]
): PatternAnomaly[] {
  const anomalies: PatternAnomaly[] = [];

  const weekendCommits = commits.filter((c) => {
    const day = new Date(c.date).getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  });

  const weekendRatio = weekendCommits.length / commits.length;

  if (weekendRatio > 0.3 && weekendCommits.length > 10) {
    anomalies.push({
      type: "pattern",
      severity: "info",
      description: `High weekend activity: ${Math.round(weekendRatio * 100)}% of commits`,
      timestamp: new Date().toISOString(),
    });
  }
  return anomalies;
}

export function detectBurstActivity(
  commits: CommitWithStats[],
  owner: string,
  repo: string
): PatternAnomaly[] {
  const anomalies: PatternAnomaly[] = [];

  // Sort by date
  const sorted = [...commits].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (let i = 0; i < sorted.length - 4; i++) {
    const windowStart = new Date(sorted[i].date).getTime();
    const windowEnd = new Date(sorted[i + 4].date).getTime();
    const diffMinutes = (windowEnd - windowStart) / (1000 * 60);

    if (diffMinutes <= 10) {
      // Count total in this window
      let count = 5;
      for (let j = i + 5; j < sorted.length; j++) {
        const t = new Date(sorted[j].date).getTime();
        if (t - windowStart <= 10 * 60 * 1000) count++;
        else break;
      }

      anomalies.push({
        type: "velocity",
        severity: count > 10 ? "critical" : "warning",
        description: `Burst: ${count} commits in ${Math.round(diffMinutes)} minutes`,
        timestamp: sorted[i].date,
        links: buildLinks(owner, repo, sorted[i]),
      });

      i += count - 1; // Skip processed commits
    }
  }
  return anomalies;
}
