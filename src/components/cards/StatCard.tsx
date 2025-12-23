import { Box, Text, HStack } from "@chakra-ui/react";

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Box
      bg="#161b22"
      border="1px solid #30363d"
      p={4}
      borderRadius="lg"
      transition="all 0.2s"
      _hover={{
        borderColor: "#58a6ff",
      }}
    >
      <HStack justify="space-between" align="center">
        <Text fontSize="lg">{icon}</Text>
        <Text fontSize="2xl" fontWeight="bold" color="#c9d1d9">
          {value}
        </Text>
      </HStack>
      <Text fontSize="xs" color="#8b949e" textTransform="uppercase" mt={1}>
        {label}
      </Text>
    </Box>
  );
}
