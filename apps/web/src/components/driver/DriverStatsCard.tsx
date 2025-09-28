'use client';

import React from 'react';
import {
  Box as Card,
  Box as CardBody,
  VStack,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  useColorModeValue,
  Badge,
  Flex,
} from '@chakra-ui/react';
import {
  FaTruck,
  FaCheckCircle,
  FaMoneyBillWave,
  FaStar,
  FaClock,
  FaChartLine,
} from 'react-icons/fa';

interface DriverStats {
  assignedJobs: number;
  availableJobs: number;
  completedToday: number;
  totalCompleted: number;
  earningsToday: number;
  totalEarnings: number;
  averageRating: number;
}

interface DriverStatsCardProps {
  stats: DriverStats;
  title: string;
  description?: string;
}

export function DriverStatsCard({ stats, title, description }: DriverStatsCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Card
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow="md"
      overflow="hidden"
    >
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack align="start" spacing={2}>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={textColor}
            >
              {title}
            </Text>
            {description && (
              <Text
                fontSize="sm"
                color="gray.600"
                opacity={0.8}
              >
                {description}
              </Text>
            )}
          </VStack>

          {/* Stats Grid */}
          <VStack spacing={4} align="stretch">
            {/* Top Row - Jobs */}
            <HStack spacing={4} align="stretch">
              <Stat flex={1}>
                <StatLabel fontSize="sm" color="gray.600" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaTruck} color="blue.500" boxSize={4} />
                  Assigned Jobs
                </StatLabel>
                <StatNumber fontSize="2xl" color="blue.600" fontWeight="bold">
                  {stats.assignedJobs}
                </StatNumber>
                <StatHelpText fontSize="xs" color="gray.500">
                  Currently assigned
                </StatHelpText>
              </Stat>

              <Stat flex={1}>
                <StatLabel fontSize="sm" color="gray.600" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
                  Available Jobs
                </StatLabel>
                <StatNumber fontSize="2xl" color="green.600" fontWeight="bold">
                  {stats.availableJobs}
                </StatNumber>
                <StatHelpText fontSize="xs" color="gray.500">
                  Ready to accept
                </StatHelpText>
              </Stat>
            </HStack>

            {/* Middle Row - Completed */}
            <HStack spacing={4} align="stretch">
              <Stat flex={1}>
                <StatLabel fontSize="sm" color="gray.600" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaClock} color="orange.500" boxSize={4} />
                  Completed Today
                </StatLabel>
                <StatNumber fontSize="2xl" color="orange.600" fontWeight="bold">
                  {stats.completedToday}
                </StatNumber>
                <StatHelpText fontSize="xs" color="gray.500">
                  <StatArrow type="increase" />
                  Today's work
                </StatHelpText>
              </Stat>

              <Stat flex={1}>
                <StatLabel fontSize="sm" color="gray.600" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaChartLine} color="purple.500" boxSize={4} />
                  Total Completed
                </StatLabel>
                <StatNumber fontSize="2xl" color="purple.600" fontWeight="bold">
                  {stats.totalCompleted}
                </StatNumber>
                <StatHelpText fontSize="xs" color="gray.500">
                  All time
                </StatHelpText>
              </Stat>
            </HStack>

            {/* Bottom Row - Earnings */}
            <HStack spacing={4} align="stretch">
              <Stat flex={1}>
                <StatLabel fontSize="sm" color="gray.600" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaMoneyBillWave} color="green.500" boxSize={4} />
                  Today's Earnings
                </StatLabel>
                <StatNumber fontSize="2xl" color="green.600" fontWeight="bold">
                  £{stats.earningsToday.toFixed(2)}
                </StatNumber>
                <StatHelpText fontSize="xs" color="gray.500">
                  Today's income
                </StatHelpText>
              </Stat>

              <Stat flex={1}>
                <StatLabel fontSize="sm" color="gray.600" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaStar} color="yellow.500" boxSize={4} />
                  Average Rating
                </StatLabel>
                <StatNumber fontSize="2xl" color="yellow.600" fontWeight="bold">
                  {stats.averageRating.toFixed(1)}
                </StatNumber>
                <StatHelpText fontSize="xs" color="gray.500">
                  Customer satisfaction
                </StatHelpText>
              </Stat>
            </HStack>
          </VStack>

          {/* Total Earnings Badge */}
          <Flex justify="center" pt={4}>
            <Badge
              colorScheme="green"
              size="lg"
              borderRadius="full"
              px={6}
              py={3}
              fontSize="lg"
              fontWeight="bold"
            >
              Total Earnings: £{stats.totalEarnings.toFixed(2)}
            </Badge>
          </Flex>
        </VStack>
      </CardBody>
    </Card>
  );
}
