import { Box, Text, VStack, HStack, Flex } from "@chakra-ui/react";

type ScoreBreakdown = {
  activityScore: number;
  maintenanceScore: number;
  communityScore: number;
  documentationScore: number;
};

type HealthScoreCircleProps = {
  score: number;
  breakdown?: ScoreBreakdown;
  size?: number;
  strokeWidth?: number;
};

const WEIGHTS = {
  activity: {
    weight: 30,
    label: "Activity",
    description: "Commits, recency, authors",
  },
  maintenance: {
    weight: 25,
    label: "Maintenance",
    description: "Issues, age, updates",
  },
  community: {
    weight: 20,
    label: "Community",
    description: "Stars, forks, contributors",
  },
  documentation: {
    weight: 25,
    label: "Docs",
    description: "README, LICENSE, etc.",
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
}: {
  label: string;
  score: number;
  weight: number;
}) {
  return (
    <Box>
      <HStack justify="space-between" mb={1}>
        <Text fontSize="sm" color="#c9d1d9" fontWeight="medium">
          {label}
        </Text>
        <HStack gap={2}>
          <Text fontSize="xs" color="#6e7681">
            {weight}%
          </Text>
          <Text fontSize="sm" color={getColor(score)} fontWeight="bold">
            {score}
          </Text>
        </HStack>
      </HStack>
      <Box bg="#30363d" borderRadius="full" h="8px" overflow="hidden">
        <Box
          bg={getColor(score)}
          h="100%"
          w={`${score}%`}
          borderRadius="full"
          transition="width 0.5s ease"
        />
      </Box>
    </Box>
  );
}

export function HealthScoreCircle({
  score,
  breakdown,
  size = 180,
  strokeWidth = 14,
}: HealthScoreCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      gap={8}
      align={{ base: "center", md: "center" }}
      width="100%"
    >
      {/* Left: Circle */}
      <VStack gap={3} flexShrink={0}>
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
              stroke={getColor(score)}
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
            <Text fontSize="4xl" fontWeight="bold" color="#c9d1d9">
              {score}
            </Text>
            <Text fontSize="sm" color={getColor(score)} fontWeight="medium">
              {getLabel(score)}
            </Text>
          </VStack>
        </Box>

        {/* Legend under circle */}
        <HStack gap={2} flexWrap="wrap" justify="center">
          {SCORE_THRESHOLDS.map((t) => (
            <HStack key={t.label} gap={1}>
              <Box w="8px" h="8px" borderRadius="full" bg={t.color} />
              <Text fontSize="xs" color="#6e7681">
                {t.min}+
              </Text>
            </HStack>
          ))}
        </HStack>
      </VStack>

      {/* Right: Breakdown Bars */}
      {breakdown && (
        <VStack align="stretch" flex={1} gap={3} width="100%">
          <Text fontSize="lg" color="#c9d1d9" fontWeight="semibold">
            Score Breakdown
          </Text>
          <ScoreBar
            label={WEIGHTS.activity.label}
            score={breakdown.activityScore}
            weight={WEIGHTS.activity.weight}
          />
          <ScoreBar
            label={WEIGHTS.maintenance.label}
            score={breakdown.maintenanceScore}
            weight={WEIGHTS.maintenance.weight}
          />
          <ScoreBar
            label={WEIGHTS.community.label}
            score={breakdown.communityScore}
            weight={WEIGHTS.community.weight}
          />
          <ScoreBar
            label={WEIGHTS.documentation.label}
            score={breakdown.documentationScore}
            weight={WEIGHTS.documentation.weight}
          />
        </VStack>
      )}
    </Flex>
  );
}
