"use client";

import { Box, Text, VStack, HStack, Flex, Badge } from "@chakra-ui/react";
import {
  FaArrowDown,
  FaArrowUp,
  FaCheck,
  FaHistory,
  FaWrench,
  FaUsers,
  FaBook,
  FaChartBar,
} from "react-icons/fa";
import type { ScoreInsights } from "@/server/types";

type ScoreBreakdown = {
  activityScore: number;
  maintenanceScore: number;
  communityScore: number;
  documentationScore: number;
};

type CombinedScorePanelProps = {
  score: number;
  breakdown?: ScoreBreakdown;
  insights?: ScoreInsights;
  finalScore?: number;
};

const WEIGHTS = {
  activity: {
    weight: 30,
    label: "Activity",
    icon: FaHistory,
    color: "#58a6ff",
    desc: "Commit frequency, recency & unique contributors",
  },
  maintenance: {
    weight: 25,
    label: "Maintenance",
    icon: FaWrench,
    color: "#d29922",
    desc: "Issue ratio, project maturity & update frequency",
  },
  community: {
    weight: 20,
    label: "Community",
    icon: FaUsers,
    color: "#a371f7",
    desc: "Stars, forks & contributor engagement",
  },
  documentation: {
    weight: 25,
    label: "Docs",
    icon: FaBook,
    color: "#238636",
    desc: "README, LICENSE, CONTRIBUTING & CODE_OF_CONDUCT",
  },
};

const SCORE_THRESHOLDS = [
  { min: 80, color: "#238636", label: "Excellent" },
  { min: 60, color: "#d29922", label: "Good" },
  { min: 40, color: "#db6d28", label: "Fair" },
  { min: 0, color: "#f85149", label: "Poor" },
];

const getColor = (score: number) => {
  const threshold = SCORE_THRESHOLDS.find((t) => score >= t.min);
  return threshold?.color ?? "#f85149";
};

const getLabel = (score: number) => {
  const threshold = SCORE_THRESHOLDS.find((t) => score >= t.min);
  return threshold?.label ?? "Poor";
};

function ScoreBar({
  label,
  score,
  weight,
  icon: Icon,
  iconColor,
  desc,
}: {
  label: string;
  score: number;
  weight: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  desc: string;
}) {
  return (
    <Box>
      <HStack justify="space-between" mb={1}>
        <HStack gap={1}>
          <Icon size={12} color={iconColor} />
          <Text fontSize="xs" color="#c9d1d9" fontWeight="medium">
            {label}
          </Text>
        </HStack>
        <HStack gap={1}>
          <Text fontSize="xs" color={getColor(score)} fontWeight="bold">
            {score}
          </Text>
          <Text fontSize="2xs" color="#6e7681">
            ({weight}%)
          </Text>
        </HStack>
      </HStack>
      <Box bg="#21262d" borderRadius="full" h="4px" overflow="hidden" mb={1}>
        <Box
          bg={getColor(score)}
          h="100%"
          w={`${score}%`}
          borderRadius="full"
          transition="width 0.5s ease"
        />
      </Box>
      <Text fontSize="2xs" color="#6e7681" lineHeight="1.3">
        {desc}
      </Text>
    </Box>
  );
}

export function CombinedScorePanel({
  score,
  breakdown,
  insights,
  finalScore,
}: CombinedScorePanelProps) {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const displayScore = finalScore ?? score;
  const progress = ((100 - displayScore) / 100) * circumference;

  const adjustment = insights?.adjustment;
  const hasAdjustment = adjustment && adjustment.amount !== 0;

  return (
    <Box bg="#161b22" border="1px solid #30363d" borderRadius="lg" p={5}>
      <Flex direction={{ base: "column", lg: "row" }} gap={6} align="stretch">
        {/* LEFT: Circle Score */}
        <VStack
          gap={2}
          flexShrink={0}
          pr={{ base: 0, lg: 6 }}
          borderRight={{ base: "none", lg: "1px solid #30363d" }}
          pb={{ base: 4, lg: 0 }}
          borderBottom={{ base: "1px solid #30363d", lg: "none" }}
          align="center"
          justify="center"
        >
          <Box position="relative" width={size} height={size}>
            <svg width={size} height={size}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#30363d"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={getColor(displayScore)}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <VStack
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              gap={0}
            >
              <Text fontSize="2xl" fontWeight="bold" color="#c9d1d9">
                {displayScore}
              </Text>
              <Text
                fontSize="xs"
                color={getColor(displayScore)}
                fontWeight="medium"
              >
                {getLabel(displayScore)}
              </Text>
            </VStack>
          </Box>

          {/* Legend */}
          <HStack gap={2} flexWrap="wrap" justify="center">
            {SCORE_THRESHOLDS.map((t) => (
              <HStack key={t.label} gap={1}>
                <Box w="8px" h="8px" borderRadius="full" bg={t.color} />
                <Text fontSize="2xs" color={t.color} fontWeight="medium">
                  {t.min}+ {t.label}
                </Text>
              </HStack>
            ))}
          </HStack>
        </VStack>

        {/* MIDDLE: Score Breakdown */}
        <VStack
          align="stretch"
          flex={1}
          gap={2}
          pr={{ base: 0, lg: 6 }}
          borderRight={{ base: "none", lg: "1px solid #30363d" }}
          pb={{ base: 4, lg: 0 }}
          borderBottom={{ base: "1px solid #30363d", lg: "none" }}
        >
          <HStack gap={2} mb={2}>
            <FaChartBar color="#58a6ff" size={16} />
            <Text fontSize="sm" color="#c9d1d9" fontWeight="semibold">
              Score Breakdown
            </Text>
          </HStack>

          {breakdown && (
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={4}
            >
              <ScoreBar
                label={WEIGHTS.activity.label}
                score={breakdown.activityScore}
                weight={WEIGHTS.activity.weight}
                icon={WEIGHTS.activity.icon}
                iconColor={WEIGHTS.activity.color}
                desc={WEIGHTS.activity.desc}
              />
              <ScoreBar
                label={WEIGHTS.maintenance.label}
                score={breakdown.maintenanceScore}
                weight={WEIGHTS.maintenance.weight}
                icon={WEIGHTS.maintenance.icon}
                iconColor={WEIGHTS.maintenance.color}
                desc={WEIGHTS.maintenance.desc}
              />
              <ScoreBar
                label={WEIGHTS.community.label}
                score={breakdown.communityScore}
                weight={WEIGHTS.community.weight}
                icon={WEIGHTS.community.icon}
                iconColor={WEIGHTS.community.color}
                desc={WEIGHTS.community.desc}
              />
              <ScoreBar
                label={WEIGHTS.documentation.label}
                score={breakdown.documentationScore}
                weight={WEIGHTS.documentation.weight}
                icon={WEIGHTS.documentation.icon}
                iconColor={WEIGHTS.documentation.color}
                desc={WEIGHTS.documentation.desc}
              />
            </Box>
          )}
        </VStack>

        {/* RIGHT: AI Analysis */}
        <VStack align="stretch" flex={1} gap={2}>
          <HStack gap={2}>
            <FaChartBar color="#a371f7" size={16} />
            <Text fontSize="sm" color="#c9d1d9" fontWeight="semibold">
              AI Analysis
            </Text>
          </HStack>

          <Text fontSize="xs" color="#8b949e" lineHeight="1.5">
            Score calculated using community health metrics formula. AI reviews
            project context and may adjust by ±20 points.
          </Text>

          {/* AI Adjustment */}
          {hasAdjustment ? (
            <Box
              bg={
                adjustment.amount > 0
                  ? "rgba(35,134,54,0.1)"
                  : "rgba(248,81,73,0.1)"
              }
              border="1px solid"
              borderColor={adjustment.amount > 0 ? "#238636" : "#f85149"}
              borderRadius="md"
              p={2}
            >
              <HStack gap={2} align="center">
                {adjustment.amount > 0 ? (
                  <FaArrowUp color="#238636" size={12} />
                ) : (
                  <FaArrowDown color="#f85149" size={12} />
                )}
                <Text fontSize="xs" color="#c9d1d9" flex={1}>
                  <Text as="span" fontWeight="bold">
                    {adjustment.amount > 0 ? "+" : ""}
                    {adjustment.amount} pts
                  </Text>
                  {" — "}
                  {adjustment.reason}
                </Text>
                <Badge
                  bg="rgba(210,153,34,0.2)"
                  color="#d29922"
                  px={1.5}
                  py={0.5}
                  borderRadius="sm"
                  fontSize="2xs"
                >
                  {adjustment.confidence}
                </Badge>
              </HStack>
            </Box>
          ) : (
            <Box
              bg="rgba(35,134,54,0.1)"
              border="1px solid #238636"
              borderRadius="md"
              p={2}
            >
              <HStack gap={2} align="center">
                <FaCheck color="#238636" size={12} />
                <Text fontSize="xs" color="#c9d1d9">
                  No adjustment needed — Formula score is accurate
                </Text>
                <Badge
                  bg="rgba(35,134,54,0.2)"
                  color="#238636"
                  px={1.5}
                  py={0.5}
                  borderRadius="sm"
                  fontSize="2xs"
                >
                  high
                </Badge>
              </HStack>
            </Box>
          )}
        </VStack>
      </Flex>
    </Box>
  );
}
