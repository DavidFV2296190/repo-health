// src/components/Footer.tsx
"use client";

import {
  Box,
  Container,
  Text,
  HStack,
  VStack,
  Link,
  Icon,
} from "@chakra-ui/react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export function Footer() {
  return (
    <Box bg="#010409" borderTop="1px solid #30363d" py={8}>
      <Container maxW="container.xl">
        <VStack gap={6}>
          {/* Top Row: Logo + Tagline */}
          <VStack gap={2}>
            <Text fontSize="2xl" fontWeight="bold" color="#c9d1d9">
              🩺 Repo Health
            </Text>
            <Text fontSize="md" color="#8b949e" textAlign="center">
              Made by Elshad Humbatli for making developers life easier
            </Text>
          </VStack>

          {/* Social Links */}
          <HStack gap={6}>
            <Link href="https://github.com/ElshadHu" target="_blank">
              <Icon
                as={FaGithub}
                boxSize={6}
                color="#8b949e"
                _hover={{ color: "#c9d1d9" }}
              />
            </Link>
            <Link
              href="https://www.linkedin.com/in/elshad-humbatli-56446a372/"
              target="_blank"
            >
              <Icon
                as={FaLinkedin}
                boxSize={6}
                color="#8b949e"
                _hover={{ color: "#0a66c2" }}
              />
            </Link>
            <Link href="mailto:elsadhumbetli079@gmail.com">
              <Icon
                as={FaEnvelope}
                boxSize={6}
                color="#8b949e"
                _hover={{ color: "#c9d1d9" }}
              />
            </Link>
          </HStack>

          {/* Copyright */}
          <Text fontSize="sm" color="#6e7681" suppressHydrationWarning>
            © {new Date().getFullYear()} Repo Health. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
