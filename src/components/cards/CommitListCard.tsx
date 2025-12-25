import { Box, Heading, VStack, Text, HStack } from "@chakra-ui/react";
import {
  FaUser,
  FaCalendarAlt,
  FaGitAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import Link from "next/link";

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export function CommitListCard({
  commits,
  maxDisplay = 5,
}: {
  commits: Commit[];
  maxDisplay?: number;
}) {
  return (
    <Box
      bg="#161b22"
      border="1px solid #30363d"
      p={8}
      borderRadius="lg"
      boxShadow="0 8px 24px rgba(0, 0, 0, 0.5)"
    >
      <HStack gap={3} mb={4}>
        <Box bg="rgba(88, 166, 255, 0.15)" p={2} borderRadius="md">
          <FaGitAlt color="#58a6ff" size={20} />
        </Box>
        <Heading size="xl" color="#c9d1d9">
          Recent Commits (Last 90 Days)
        </Heading>
      </HStack>
      <VStack gap={3} align="stretch">
        {commits.slice(0, maxDisplay).map((commit) => (
          <Box
            key={commit.sha}
            p={4}
            bg="#0d1117"
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="#58a6ff"
            transition="all 0.2s ease"
            _hover={{ bg: "#161b22" }}
          >
            <Link href={commit.url} target="_blank" rel="noopener noreferrer">
              <HStack justify="space-between" align="start" mb={1}>
                <Text
                  fontWeight="bold"
                  color="#c9d1d9"
                  fontSize="sm"
                  _hover={{ color: "#58a6ff" }}
                  transition="color 0.2s ease"
                >
                  {commit.message.split("\n")[0]}
                </Text>
                <Box color="#8b949e" _hover={{ color: "#58a6ff" }}>
                  <FaExternalLinkAlt size={12} />
                </Box>
              </HStack>
            </Link>
            <HStack gap={4} fontSize="xs" color="#8b949e">
              <HStack gap={1}>
                <FaUser size={10} />
                <Text>{commit.author}</Text>
              </HStack>
              <HStack gap={1}>
                <FaCalendarAlt size={10} />
                <Text>{new Date(commit.date).toLocaleDateString()}</Text>
              </HStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
