"use client";

import { Box, Text, VStack, HStack } from "@chakra-ui/react";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import type { RelatedPRs } from "@/server/types";

type Props = {
  prs: RelatedPRs[];
  isLoading?: boolean;
};

export function RelatedPRsSection({ prs, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={4}>
        <Text color="#8b949e">Loading related PRs...</Text>
      </Box>
    );
  }

  if (prs.length === 0) {
    return (
      <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={4}>
        <HStack mb={2} gap={2}>
          <FaGithub color="#8b949e" />
          <Text fontSize="md" fontWeight="bold" color="#c9d1d9">
            Related PRs
          </Text>
        </HStack>
        <Text color="#8b949e" fontSize="sm">
          No merged PRs found for this vulnerability.
        </Text>
      </Box>
    );
  }

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={4}>
      <HStack mb={3} gap={2}>
        <FaGithub color="#8b949e" />
        <Text fontSize="md" fontWeight="bold" color="#c9d1d9">
          Related PRs ({prs.length})
        </Text>
      </HStack>

      <Text color="#6e7681" fontSize="xs" mb={3}>
        Click any PR to view on GitHub
      </Text>

      <VStack align="stretch" gap={2} maxH="300px" overflowY="auto">
        {prs.map((pr, idx) => (
          <a
            key={`${pr.repo}-${pr.prNumber}-${idx}`}
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <HStack
              bg="#0d1117"
              border="1px solid #30363d"
              borderRadius="md"
              p={2}
              gap={2}
              _hover={{ bg: "#21262d", borderColor: "#58a6ff" }}
              transition="all 0.2s"
              cursor="pointer"
            >
              <Text
                color="#58a6ff"
                fontSize="sm"
                fontWeight="medium"
                flexShrink={0}
              >
                #{pr.prNumber}
              </Text>
              <Text
                color="#c9d1d9"
                fontSize="sm"
                flex={1}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {pr.title}
              </Text>
              <FaExternalLinkAlt color="#6e7681" size={10} />
            </HStack>
          </a>
        ))}
      </VStack>

      <Text color="#6e7681" fontSize="xs" mt={3} textAlign="center">
        {prs.length} PR{prs.length !== 1 ? "s" : ""} across GitHub repositories
      </Text>
    </Box>
  );
}
