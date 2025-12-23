"use client";

import { Box, Text, VStack, Flex } from "@chakra-ui/react";
import { FaExternalLinkAlt, FaArrowRight } from "react-icons/fa";

type KeyFile = {
  path: string;
  purpose: string;
};

type Props = {
  keyFiles: KeyFile[];
  owner: string;
  repo: string;
};

export function KeyFilesList({ keyFiles, owner, repo }: Props) {
  if (!keyFiles.length) return null;

  const githubUrl = (path: string) =>
    `https://github.com/${owner}/${repo}/blob/main/${path}`;

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={6}>
      <Text fontSize="lg" fontWeight="600" mb={4} color="#c9d1d9">
        📄 Key Files
      </Text>
      <VStack align="stretch" gap={3}>
        {keyFiles.map((kf) => (
          <Flex
            key={kf.path}
            justify="space-between"
            align="flex-start"
            borderBottom="1px solid #21262d"
            pb={3}
          >
            <Box>
              <a
                href={githubUrl(kf.path)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Text color="#58a6ff" fontFamily="mono" fontSize="sm">
                  {kf.path}
                </Text>
                <FaExternalLinkAlt size={10} color="#8b949e" />
              </a>
              <Text color="#8b949e" fontSize="xs" mt={1}>
                {kf.purpose}
              </Text>
            </Box>
            <FaArrowRight color="#8b949e" size={12} />
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}
