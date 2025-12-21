"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { VulnerabilityTable } from "@/components/dependencies/VulnerabilityTable";
import { SolutionSection } from "@/components/dependencies/SolutionSection";
import { RelatedPRsSection } from "@/components/dependencies/RelatedPRsSection";

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      bg="#21262d"
      border="1px solid #30363d"
      borderRadius="lg"
      p={4}
      textAlign="center"
      transition="all 0.2s ease"
      _hover={{ borderColor: color }}
    >
      <Text fontSize="3xl" fontWeight="bold" color={color}>
        {value}
      </Text>
      <Text fontSize="sm" color="#8b949e">
        {label}
      </Text>
    </Box>
  );
}

export default function DependencyDashboard() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [selectedVuln, setSelectedVuln] = useState<{
    id: string;
    packageName: string;
    packageVersion: string;
    summary: string;
  } | null>(null);

  const { data, isLoading, error } = trpc.dependency.analyze.useQuery(
    { owner, repo },
    { staleTime: 1000 * 60 * 5 }
  );

  // Fetch related PRs when a vulnerability is selected
  const { data: relatedPRs, isLoading: isPRsLoading } =
    trpc.dependency.getRelatedPRs.useQuery(
      { vulnId: selectedVuln?.id || "" },
      { enabled: !!selectedVuln }
    );

  // Check if issue exists for selected vulnerability
  const { data: issueStatus } = trpc.dependency.checkIssueExists.useQuery(
    {
      owner,
      repo,
      vulnId: selectedVuln?.id || "",
    },
    { enabled: !!selectedVuln }
  );

  if (isLoading) {
    return (
      <Box bg="#0d1117" minH="100vh" py={12}>
        <Container maxW="container.xl">
          <VStack gap={8}>
            <Text color="#8b949e" fontSize="lg">
              Scanning dependencies for {owner}/{repo}...
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box bg="#0d1117" minH="100vh" py={12}>
        <Container maxW="container.xl">
          <VStack gap={8}>
            <Text color="#f85149" fontSize="lg">
              Error loading dependencies
            </Text>
            <Link href="/">
              <Button variant="outline" borderColor="#30363d" color="#c9d1d9">
                <FaArrowLeft />
                <Text ml={2}>Back to Home</Text>
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Flatten vulnerabilities with package info
  const allVulnerabilities = [
    ...data.dependencies,
    ...data.devDependencies,
  ].flatMap((dep) =>
    dep.vulnerabilities.map((v) => ({
      ...v,
      packageName: dep.name,
      packageVersion: dep.version,
    }))
  );

  const hasVulnerabilities = allVulnerabilities.length > 0;

  return (
    <Box bg="#0d1117" minH="100vh" py={12}>
      <Container maxW="container.xl">
        <VStack gap={8} align="stretch">
          {/* Back Button */}
          <Link href="/" style={{ width: "fit-content" }}>
            <Button
              variant="ghost"
              color="#8b949e"
              _hover={{ color: "#c9d1d9", bg: "#21262d" }}
              size="sm"
            >
              <FaArrowLeft />
              <Text ml={2}>Back to Analysis</Text>
            </Button>
          </Link>

          {/* Header */}
          <Box>
            <Text fontSize="3xl" fontWeight="bold" color="#c9d1d9">
              Dependency Security
            </Text>
            <Text fontSize="lg" color="#8b949e" mb={2}>
              {owner}/{repo}
            </Text>
            <Text fontSize="md" color="#6e7681" maxW="700px">
              View security vulnerabilities in your dependencies with
              recommended fixes, official documentation, and related pull
              requests from across GitHub. No existing issue? Create one to
              notify maintainers.
            </Text>
          </Box>

          {/* Summary Stats */}
          <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap={4}>
            <SummaryCard
              label="Total Packages"
              value={data.summary.total}
              color="#c9d1d9"
            />
            <SummaryCard
              label="Vulnerabilities"
              value={data.summary.vulnerable}
              color={hasVulnerabilities ? "#f85149" : "#238636"}
            />
            <SummaryCard
              label="Critical"
              value={data.summary.critical}
              color="#f85149"
            />
            <SummaryCard
              label="High"
              value={data.summary.high}
              color="#db6d28"
            />
            <SummaryCard
              label="Moderate"
              value={data.summary.moderate}
              color="#d29922"
            />
            <SummaryCard label="Low" value={data.summary.low} color="#238636" />
          </SimpleGrid>

          {/* Alert Banner */}
          {hasVulnerabilities && (
            <Box
              bg="rgba(248,81,73,0.1)"
              border="1px solid rgba(248,81,73,0.3)"
              borderRadius="lg"
              p={4}
            >
              <HStack gap={3}>
                <FaExclamationTriangle color="#f85149" size={20} />
                <VStack align="start" gap={0}>
                  <Text color="#f85149" fontWeight="bold">
                    Action Required
                  </Text>
                  <Text color="#8b949e" fontSize="sm">
                    Select a vulnerability to view fixes, documentation, and
                    community PRs. Create an issue if none exists.
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Main Content */}
          {hasVulnerabilities ? (
            <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
              {/* Vulnerability Table - Takes 2 columns */}
              <Box gridColumn={{ lg: "span 2" }}>
                <VulnerabilityTable
                  vulnerabilities={allVulnerabilities}
                  selectedId={selectedVuln?.id}
                  onSelect={(vuln) => setSelectedVuln(vuln)}
                />
              </Box>

              {/* Side Panel - Solution & PRs */}
              <VStack gap={4} align="stretch">
                {selectedVuln ? (
                  <>
                    <SolutionSection
                      vulnId={selectedVuln.id}
                      osvUrl={`https://osv.dev/vulnerability/${selectedVuln.id}`}
                      issueStatus={issueStatus || { exists: false }}
                      owner={owner}
                      repo={repo}
                      packageName={selectedVuln.packageName}
                      packageVersion={selectedVuln.packageVersion}
                      summary={selectedVuln.summary}
                    />
                    <RelatedPRsSection
                      prs={relatedPRs || []}
                      isLoading={isPRsLoading}
                    />
                  </>
                ) : (
                  <Box
                    bg="#161b22"
                    border="1px solid #30363d"
                    borderRadius="lg"
                    p={6}
                    textAlign="center"
                  >
                    <Text color="#8b949e">
                      Select a vulnerability to see details
                    </Text>
                  </Box>
                )}
              </VStack>
            </SimpleGrid>
          ) : (
            <Box
              bg="#161b22"
              border="1px solid #238636"
              borderRadius="lg"
              p={8}
              textAlign="center"
            >
              <VStack gap={3}>
                <FaCheckCircle color="#238636" size={48} />
                <Text fontSize="xl" fontWeight="bold" color="#238636">
                  All Clear!
                </Text>
                <Text color="#8b949e">
                  No known vulnerabilities found in your dependencies.
                </Text>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
