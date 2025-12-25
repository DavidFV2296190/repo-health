import { Box, Heading, SimpleGrid, Text, HStack } from "@chakra-ui/react";
import { FaUsers, FaExternalLinkAlt } from "react-icons/fa";
import Link from "next/link";

interface Contributor {
  username?: string;
  contributions: number;
  url?: string;
}

export function ContributorCard({
  contributors,
  maxDisplay = 6,
}: {
  contributors: Contributor[];
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
      <HStack gap={2} mb={6}>
        <FaUsers color="#58a6ff" size={24} />
        <Heading size="xl" color="#c9d1d9">
          Top Contributors
        </Heading>
      </HStack>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {contributors.slice(0, maxDisplay).map((contributor) => (
          <Box
            key={contributor.username}
            p={4}
            bg="#0d1117"
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="#58a6ff"
            transition="all 0.2s ease"
            _hover={{ bg: "#161b22" }}
          >
            {contributor.url ? (
              <Link
                href={contributor.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <HStack justify="space-between" align="center">
                  <Text
                    fontWeight="bold"
                    color="#c9d1d9"
                    _hover={{ color: "#58a6ff" }}
                    transition="color 0.2s ease"
                  >
                    {contributor.username}
                  </Text>
                  <Box color="#8b949e" _hover={{ color: "#58a6ff" }}>
                    <FaExternalLinkAlt size={10} />
                  </Box>
                </HStack>
              </Link>
            ) : (
              <Text fontWeight="bold" color="#c9d1d9">
                {contributor.username}
              </Text>
            )}
            <Text fontSize="sm" color="#8b949e">
              {contributor.contributions} contributions
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
