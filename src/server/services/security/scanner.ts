import { PATTERNS, getSeverityWeight, type Severity } from "./patterns";
import { findHighEntropyStrings } from "./entropy";
import { getPreview } from "./masker";

export type Finding = {
  patternId: string;
  patternName: string;
  severity: Severity;
  file: string;
  line: number;
  preview: string;
  remediation: string;
};

export type ScanResult = {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  findings: Finding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  filesScanned: number;
};

const SKIP_PATTERNS = [
  /node_modules\//,
  /vendor\//,
  /\.min\.js$/,
  /\.map$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /\.git\//,
];

function shouldSkip(filePath: string): boolean {
  return SKIP_PATTERNS.some((pattern) => pattern.test(filePath));
}

export function scanContent(content: string, filePath: string): Finding[] {
  if (shouldSkip(filePath)) return [];

  const findings: Finding[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    for (const pattern of PATTERNS) {
      const match = line.match(pattern.regex);
      if (match) {
        const secret = match[1] || match[0];
        findings.push({
          patternId: pattern.id,
          patternName: pattern.name,
          severity: pattern.severity,
          file: filePath,
          line: lineNumber,
          preview: getPreview(line, secret),
          remediation: pattern.remediation,
        });
      }
    }

    const entropySecrets = findHighEntropyStrings(line);
    for (const secret of entropySecrets) {
      const alreadyFound = findings.some(
        (f) => f.file === filePath && f.line === lineNumber
      );
      if (!alreadyFound) {
        findings.push({
          patternId: "high-entropy",
          patternName: "High Entropy String",
          severity: "medium",
          file: filePath,
          line: lineNumber,
          preview: getPreview(line, secret),
          remediation: "High randomness detected. Verify if this is a secret.",
        });
      }
    }
  }

  return findings;
}

export function calculateScore(findings: Finding[]): number {
  if (findings.length === 0) return 100;

  let penalty = 0;
  for (const finding of findings) {
    penalty += getSeverityWeight(finding.severity);
  }

  return Math.max(0, 100 - penalty);
}

export function getGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function summarizeFindings(findings: Finding[]): ScanResult["summary"] {
  const summary = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };

  for (const finding of findings) {
    summary.total++;
    summary[finding.severity]++;
  }

  return summary;
}

export function createScanResult(
  findings: Finding[],
  filesScanned: number
): ScanResult {
  const score = calculateScore(findings);
  return {
    score,
    grade: getGrade(score),
    findings,
    summary: summarizeFindings(findings),
    filesScanned,
  };
}
