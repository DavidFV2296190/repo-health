"use client";

import { useParams } from "next/navigation";
import { Box, Spinner, Text, VStack } from "@chakra-ui/react";
import { trpc } from "@/trpc/client";
import { PRDetailsPage } from "@/components/prs/PRDetailsPage";

export default function PRsPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const { data, isLoading, error } = trpc.pr.getStats.useQuery({ owner, repo });

  if (isLoading) {
    return (
      <Box
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={4}>
          <Spinner size="xl" color="#58a6ff" />
          <Text color="#8b949e">Analyzing pull requests...</Text>
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
      >
        <Text color="#8b949e">No PR data found</Text>
      </Box>
    );
  }

  return <PRDetailsPage stats={data} owner={owner} repo={repo} />;
}
