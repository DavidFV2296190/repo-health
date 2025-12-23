"use client";

import { Box, Text, HStack, Flex } from "@chakra-ui/react";
import { FaProjectDiagram, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

type Props = { owner: string; repo: string };

export function OverviewCard({ owner, repo }: Props) {
  return (
    <Link href={`/overview/${owner}/${repo}`}>
      <Box
        bg="#161b22"
        border="1px solid #30363d"
        borderRadius="lg"
        p={5}
        minH="180px"
        cursor="pointer"
        _hover={{ borderColor: "#a371f7", transform: "translateY(-2px)" }}
        transition="all 0.2s"
      >
        <Flex justify="space-between" align="flex-start">
          <HStack gap={2} mb={2}>
            <FaProjectDiagram color="#a371f7" />
            <Text color="#c9d1d9" fontWeight="bold">
              Project Overview
            </Text>
          </HStack>
          <FaArrowRight color="#8b949e" />
        </Flex>
        <Text color="#8b949e" fontSize="sm">
          AI architecture analysis
        </Text>
      </Box>
    </Link>
  );
}
