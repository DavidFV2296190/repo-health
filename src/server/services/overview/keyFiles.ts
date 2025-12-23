import { Octokit } from "@octokit/rest";

const KEY_FILES = [
  "package.json",
  "README.md",
  "tsconfig.json",
  "next.config.js",
  "next.config.ts",
  ".env.example",
  "docker-compose.yml",
  "Dockerfile",
];

export async function fetchKeyFiles(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<Record<string, string>> {
  const contents: Record<string, string> = {};

  for (const file of KEY_FILES) {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: file,
      });

      if ("content" in data && data.content) {
        contents[file] = Buffer.from(data.content, "base64").toString("utf-8");
      }
    } catch {
      // File doesn't exist, skip
    }
  }

  return contents;
}
