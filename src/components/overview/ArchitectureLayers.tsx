"use client";

import { Box, Text, VStack, HStack } from "@chakra-ui/react";

type Props = {
  layers: Record<string, string>;
};

export function ArchitectureLayers({ layers }: Props) {
  const entries = Object.entries(layers);
  if (!entries.length) return null;

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={6}>
      <Text fontSize="lg" fontWeight="600" mb={4} color="#c9d1d9">
        📐 Architecture Layers
      </Text>
      <VStack align="stretch" gap={3}>
        {entries.map(([name, paths]) => (
          <HStack key={name} borderBottom="1px solid #21262d" pb={3}>
            <Text
              color="#c9d1d9"
              minW="100px"
              fontWeight="500"
              textTransform="capitalize"
            >
              {name}
            </Text>
            <Text color="#8b949e" fontFamily="mono" fontSize="sm">
              {paths}
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
