"use client";

import { useState } from "react";
import { Box, Input, Button, HStack, VStack, Text } from "@chakra-ui/react";

interface RepoSearchInputProps {
  onSearch: (owner: string, repo: string) => void;
  isLoading?: boolean;
}

export function RepoSearchInput({ onSearch, isLoading }: RepoSearchInputProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const parseGitHubUrl = (url: string) => {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\s]+)/, // https://github.com/owner/repo
      /^([^\/\s]+)\/([^\/\s]+)$/, // owner/repo
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return { owner: match[1], repo: match[2].replace(/\/git$/, "") };
      }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      setError("Please enter a valid GitHub URL or owner/repo format");
      return;
    }
    onSearch(parsed.owner, parsed.repo);
  };
  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack gap={4} align="stretch">
        <VStack align="start" gap={2}>
          <Text fontSize="lg" fontWeight="semibold">
            Repository to Analyze
          </Text>
          <Text fontSize="sm" color="gray.600">
            Enter GitHub URL or owner/repo (e.g., "facebook/react")
          </Text>
        </VStack>

        <HStack>
          <Input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="facebook/react or https://github.com/facebook/react"
            size="lg"
            disabled={isLoading}
          />
          <Button
            type="submit"
            colorPalette="blue"
            size="lg"
            loading={isLoading}
            px={8}
          >
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </HStack>

        {error && (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        )}
      </VStack>
    </Box>
  );
}
