"use client";

import { useParams } from "next/navigation";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import { trpc } from "@/trpc/client";
import { PitfallsPage } from "@/components/contributor/PitfallsPage";

export default function PitfallsRoute() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const { data, isLoading, error } = trpc.contributor.getPitfalls.useQuery({
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
        bg="#0d1117"
      >
        <VStack gap={4}>
          <Spinner size="xl" color="#f0883e" />
          <Text color="#8b949e">Analyzing rejected PRs...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="#0d1117"
      >
        <Text color="#f85149">Error: {error.message}</Text>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="#0d1117"
      >
        <Text color="#8b949e">No pitfall data found</Text>
      </Box>
    );
  }

  return (
    <Box bg="#0d1117" minH="100vh">
      <PitfallsPage
        analyses={data.analyses}
        patterns={data.patterns}
        spammers={data.spammers}
        owner={owner}
        repo={repo}
      />
    </Box>
  );
}
