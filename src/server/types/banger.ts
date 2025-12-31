export type Commit = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
};

export type CommitWithStats = Commit & {
  additions: number;
  deletions: number;
  files: string[];
};

export type BangerType =
  | "breaking"
  | "security"
  | "feature"
  | "fix"
  | "refactor"
  | "perf"
  | "other";

export type ScoredCommit = {
  commit: Commit;
  type: BangerType;
  score: number;
};

export type BangerCommit = {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
  type: BangerType;
  score: number;
  explanation: string;
};
