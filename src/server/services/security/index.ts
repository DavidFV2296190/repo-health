export { PATTERNS, getSeverityWeight } from "./patterns";
export type { SecretPattern, Severity } from "./patterns";

export {
  calculateEntropy,
  isHighEntropy,
  findHighEntropyStrings,
} from "./entropy";

export { maskSecret, maskLine, getPreview } from "./masker";

export {
  scanContent,
  calculateScore,
  getGrade,
  summarizeFindings,
  createScanResult,
} from "./scanner";
export type { Finding, ScanResult } from "./scanner";
