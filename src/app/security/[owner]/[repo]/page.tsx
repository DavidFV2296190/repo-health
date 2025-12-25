"use client";

import { useParams } from "next/navigation";
import {
  Box,
  Text,
  VStack,
  HStack,
  Grid,
  Badge,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { FaShieldAlt, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { Button } from "@chakra-ui/react";
import { trpc } from "@/trpc/client";

const SEVERITY_COLORS: Record<string, { bg: string; color: string }> = {
  critical: { bg: "#f8514926", color: "#f85149" },
  high: { bg: "#d2992226", color: "#d29922" },
  medium: { bg: "#58a6ff26", color: "#58a6ff" },
  low: { bg: "#8b949e26", color: "#8b949e" },
};

export default function SecurityPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const { data, isLoading, error } = trpc.security.scan.useQuery({
    owner,
    repo,
  });

  if (isLoading) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={4}>
          <Spinner size="xl" color="#f85149" />
          <Text color="#8b949e">Scanning for secrets...</Text>
        </VStack>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="#f85149">Error: {error?.message || "Failed to scan"}</Text>
      </Box>
    );
  }

  const gradeColor =
    data.grade === "A" ? "#238636" : data.grade === "F" ? "#f85149" : "#d29922";

  return (
    <Box maxW="1200px" mx="auto" p={{ base: 4, md: 8 }}>
      <Link
        href={`/?owner=${owner}&repo=${repo}`}
        style={{ width: "fit-content" }}
      >
        <Button
          variant="ghost"
          color="#8b949e"
          _hover={{ color: "#c9d1d9", bg: "#21262d" }}
        >
          <FaArrowLeft />
          <Text ml={2}>Back to Analysis</Text>
        </Button>
      </Link>
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        mb={8}
        flexWrap="wrap"
        gap={4}
      >
        <HStack gap={3}>
          <FaShieldAlt size={28} color="#f85149" />
          <VStack align="start" gap={0}>
            <Text fontSize="2xl" fontWeight="bold" color="#c9d1d9">
              Security Scan
            </Text>
            <Text fontSize="sm" color="#8b949e">
              {owner}/{repo}
            </Text>
          </VStack>
        </HStack>
        <Badge
          fontSize="2xl"
          px={4}
          py={2}
          bg={`${gradeColor}26`}
          color={gradeColor}
        >
          {data.grade}
        </Badge>
      </Flex>

      {/* Summary Stats */}
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={4}
        mb={8}
      >
        <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
          <Text color="#8b949e" fontSize="sm">
            Score
          </Text>
          <Text color="#c9d1d9" fontSize="2xl" fontWeight="bold">
            {data.score}/100
          </Text>
        </Box>
        <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
          <Text color="#8b949e" fontSize="sm">
            Files Scanned
          </Text>
          <Text color="#c9d1d9" fontSize="2xl" fontWeight="bold">
            {data.filesScanned}
          </Text>
        </Box>
        <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
          <Text color="#8b949e" fontSize="sm">
            Findings
          </Text>
          <Text color="#c9d1d9" fontSize="2xl" fontWeight="bold">
            {data.summary.total}
          </Text>
        </Box>
        <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
          <Text color="#8b949e" fontSize="sm">
            Critical
          </Text>
          <Text color="#f85149" fontSize="2xl" fontWeight="bold">
            {data.summary.critical}
          </Text>
        </Box>
      </Grid>

      {/* Findings List */}
      {data.findings.length === 0 ? (
        <Box
          bg="#161b22"
          border="1px solid #238636"
          borderRadius="lg"
          p={8}
          textAlign="center"
        >
          <FaCheckCircle
            color="#238636"
            size={48}
            style={{ margin: "0 auto 16px" }}
          />
          <Text color="#238636" fontSize="xl" fontWeight="bold">
            No secrets detected!
          </Text>
          <Text color="#8b949e" mt={2}>
            Your repository looks clean.
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={3}>
          {data.findings.map((finding, i) => (
            <Box
              key={i}
              bg="#161b22"
              border="1px solid #30363d"
              borderRadius="lg"
              p={4}
            >
              <HStack justify="space-between" mb={2}>
                <HStack>
                  <Badge
                    bg={SEVERITY_COLORS[finding.severity].bg}
                    color={SEVERITY_COLORS[finding.severity].color}
                  >
                    {finding.severity.toUpperCase()}
                  </Badge>
                  <Text color="#c9d1d9" fontWeight="bold">
                    {finding.patternName}
                  </Text>
                </HStack>
                <Text color="#6e7681" fontSize="sm">
                  {finding.file}:{finding.line}
                </Text>
              </HStack>
              <Text
                color="#8b949e"
                fontSize="sm"
                fontFamily="mono"
                bg="#0d1117"
                p={2}
                borderRadius="md"
              >
                {finding.preview}
              </Text>
              <Text color="#58a6ff" fontSize="xs" mt={2}>
                💡 {finding.remediation}
              </Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
