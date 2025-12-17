"use client";

import { Box, Container, Text, HStack } from "@chakra-ui/react";

export function Footer() {
  return (
    <Box
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      py={8}
      color="white"
    >
      <Container maxW="container.xl">
        <HStack justify="center" gap={2}>
          <Text textAlign="center" opacity={0.9}>
            That is the current state of the project
          </Text>
        </HStack>
      </Container>
    </Box>
  );
}
