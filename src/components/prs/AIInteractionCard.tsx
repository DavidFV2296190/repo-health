"use client";

import { Box, Text, HStack, VStack, Badge, Flex } from "@chakra-ui/react";
import { FaRobot, FaCommentDots, FaCodeBranch } from "react-icons/fa";
import type { AIInteractionStats } from "@/server/types";

type Props = {
  stats: AIInteractionStats;
};

export function AIInteractionCard({ stats }: Props) {
  const { totalAIComments, prsWithAIReviews, bots } = stats;

  if (totalAIComments === 0) {
    return (
      <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
        <HStack gap={3} mb={3}>
          <FaRobot color="#8b949e" size={20} />
          <Text color="#c9d1d9" fontWeight="bold">
            AI Code Review
          </Text>
        </HStack>
        <Text color="#6e7681" fontSize="sm">
          No AI reviewers detected on recent PRs
        </Text>
      </Box>
    );
  }

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
      {/* Header */}
      <HStack gap={3} mb={4}>
        <FaRobot color="#a371f7" size={20} />
        <Text color="#c9d1d9" fontWeight="bold">
          Community Wrestling with AI Reviews
        </Text>
      </HStack>

      {/* Summary Stats */}
      <HStack gap={4} mb={4} flexWrap="wrap">
        <Badge bg="#a371f7" color="white" px={3} py={1} borderRadius="md">
          <HStack gap={1}>
            <FaCommentDots size={12} />
            <Text>{totalAIComments} AI Comments</Text>
          </HStack>
        </Badge>
        <Badge bg="#58a6ff" color="white" px={3} py={1} borderRadius="md">
          <HStack gap={1}>
            <FaCodeBranch size={12} />
            <Text>{prsWithAIReviews} PRs Reviewed</Text>
          </HStack>
        </Badge>
      </HStack>

      {/* Bot Breakdown */}
      <VStack align="stretch" gap={3}>
        <Text color="#8b949e" fontSize="sm" fontWeight="medium">
          Bots Activity
        </Text>
        {bots.map((bot) => (
          <Box key={bot.name}>
            <Flex justify="space-between" mb={1}>
              <HStack gap={2}>
                <Text color="#c9d1d9" fontSize="sm">
                  {bot.name}
                </Text>
              </HStack>
              <Text color="#6e7681" fontSize="xs">
                {bot.commentCount} comments on {bot.prsReviewedCount} PRs
              </Text>
            </Flex>
            {/* Custom progress bar */}
            <Box bg="#21262d" h="8px" borderRadius="full" overflow="hidden">
              <Box
                bg="#a371f7"
                h="100%"
                w={`${(bot.commentCount / totalAIComments) * 100}%`}
                borderRadius="full"
              />
            </Box>
          </Box>
        ))}
      </VStack>

      {/* Insight */}
      <Box mt={4} p={3} bg="#0d1117" borderRadius="md">
        <Text color="#8b949e" fontSize="xs">
          ⚠️ Based on {totalAIComments} AI comments across {prsWithAIReviews}{" "}
          community PRs, contributors may need ~
          {Math.round(totalAIComments / Math.max(prsWithAIReviews, 1))} review
          iterations to address AI feedback. High comment counts can indicate
          complex code changes or contributors learning project standards.
        </Text>
      </Box>
    </Box>
  );
}
