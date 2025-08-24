"use client";

import { 
  Box, 
  Grid, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  StatArrow,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Flex,
  Icon,
  SimpleGrid
} from "@chakra-ui/react";
import { 
  FaMapMarkedAlt,
  FaDatabase,
  FaBell,
  FaStripe,
  FaServer
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

interface AdminDashboardProps {
  data: {
    todayRevenue: number;
    activeJobs: number;
    avgEta: string;
    firstResponseTime: string;
    openIncidents: number;
    jobsInProgress: any[];
    newApplications: number;
    pendingRefunds: number;
    systemHealth: {
      db: string;
      queue: string;
      pusher: string;
      stripe: string;
    };
  };
}

export default function AdminDashboard({ data }: AdminDashboardProps) {
  return (
    <Box>
      {/* KPI Row */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6} mb={8}>
        <Card variant="elevated" _hover={{ transform: "translateY(-2px)", shadow: "neon.glow" }} transition="all 0.3s ease">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Today Revenue</StatLabel>
              <StatNumber color="neon.500" fontSize="2xl">£{(data.todayRevenue / 100).toFixed(2)}</StatNumber>
              <StatHelpText color="success.500">
                <StatArrow type="increase" />
                12.5%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card variant="elevated" _hover={{ transform: "translateY(-2px)", shadow: "neon.glow" }} transition="all 0.3s ease">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Active Jobs</StatLabel>
              <StatNumber color="neon.500" fontSize="2xl">{data.activeJobs}</StatNumber>
              <StatHelpText color="success.500">
                <StatArrow type="increase" />
                3 new
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card variant="elevated" _hover={{ transform: "translateY(-2px)", shadow: "neon.glow" }} transition="all 0.3s ease">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Avg ETA</StatLabel>
              <StatNumber color="neon.500" fontSize="2xl">{data.avgEta}</StatNumber>
              <StatHelpText color="success.500">
                <StatArrow type="decrease" />
                2 min faster
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card variant="elevated" _hover={{ transform: "translateY(-2px)", shadow: "neon.glow" }} transition="all 0.3s ease">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">First Response</StatLabel>
              <StatNumber color="neon.500" fontSize="2xl">{data.firstResponseTime}</StatNumber>
              <StatHelpText color="success.500">
                <StatArrow type="decrease" />
                0.8 min faster
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card variant="elevated" _hover={{ transform: "translateY(-2px)", shadow: "neon.glow" }} transition="all 0.3s ease">
          <CardBody>
            <Stat>
              <StatLabel color="text.secondary">Open Incidents</StatLabel>
              <StatNumber color="neon.500" fontSize="2xl">{data.openIncidents}</StatNumber>
              <StatHelpText color="success.500">
                <StatArrow type="decrease" />
                2 resolved
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
        {/* Live Ops Panel */}
        <Card variant="elevated" _hover={{ transform: "translateY(-2px)", shadow: "neon.glow" }} transition="all 0.3s ease">
          <CardHeader>
            <Heading size="md" color="text.primary">Live Operations</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {data.jobsInProgress.map((job) => (
                <Box 
                  key={job.id} 
                  p={4} 
                  border="1px" 
                  borderColor="border.primary" 
                  borderRadius="lg"
                  bg="bg.surface.elevated"
                  _hover={{ borderColor: "neon.500", bg: "bg.surface.hover" }}
                  transition="all 0.2s ease"
                >
                  <Flex align="center" justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" color="text.primary">#{job.reference}</Text>
                      <Text fontSize="sm" color="text.secondary">
                        {job.pickupAddress} → {job.dropoffAddress}
                      </Text>
                      <Text fontSize="sm" color="text.tertiary">
                        Driver: {job.driver?.user.name || "Unassigned"}
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Badge 
                        colorScheme={
                          job.status === "assigned" ? "blue" :
                          job.status === "in_progress" ? "yellow" :
                          job.status === "picked_up" ? "green" : "gray"
                        }
                        variant="solid"
                      >
                        {job.status.replace("_", " ")}
                      </Badge>
                      <Text fontSize="sm" color="text.tertiary">
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </Text>
                    </VStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Queue & Health */}
        <VStack spacing={6} align="stretch">
          {/* Queue */}
          <Card variant="elevated" _hover={{ transform: "translateY(-2px)", shadow: "neon.glow" }} transition="all 0.3s ease">
            <CardHeader>
              <Heading size="md" color="text.primary">Queue</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text color="text.secondary">Driver Applications</Text>
                  <Badge colorScheme="blue" variant="solid">{data.newApplications}</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text color="text.secondary">Pending Refunds</Text>
                  <Badge colorScheme="orange" variant="solid">{data.pendingRefunds}</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text color="text.secondary">Disputed Payouts</Text>
                  <Badge colorScheme="red" variant="solid">0</Badge>
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* Map Snapshot */}
          <Card variant="elevated" _hover={{ transform: "translateY(-2px)", shadow: "neon.glow" }} transition="all 0.3s ease">
            <CardHeader>
              <Heading size="md" color="text.primary">Map Snapshot</Heading>
            </CardHeader>
            <CardBody>
              <Box 
                bg="bg.surface.elevated" 
                h="200px" 
                borderRadius="lg" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                border="1px"
                borderColor="border.primary"
                _hover={{ borderColor: "neon.500" }}
                transition="all 0.2s ease"
              >
                <VStack>
                  <Icon as={FaMapMarkedAlt} boxSize={8} color="neon.500" />
                  <Text color="text.secondary">Live Map View</Text>
                  <Text fontSize="sm" color="text.tertiary">{data.activeJobs} active crews</Text>
                </VStack>
              </Box>
            </CardBody>
          </Card>

          {/* System Health */}
          <Card variant="elevated" _hover={{ transform: "translateY(-2px)", shadow: "neon.glow" }} transition="all 0.3s ease">
            <CardHeader>
              <Heading size="md" color="text.primary">System Health</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={FaDatabase} color="success.500" />
                    <Text color="text.secondary">Database</Text>
                  </HStack>
                  <Badge colorScheme="green" variant="solid">{data.systemHealth.db}</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={FaServer} color="success.500" />
                    <Text color="text.secondary">Queue</Text>
                  </HStack>
                  <Badge colorScheme="green" variant="solid">{data.systemHealth.queue}</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={FaBell} color="success.500" />
                    <Text color="text.secondary">Pusher</Text>
                  </HStack>
                  <Badge colorScheme="green" variant="solid">{data.systemHealth.pusher}</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={FaStripe} color="success.500" />
                    <Text color="text.secondary">Stripe Webhooks</Text>
                  </HStack>
                  <Badge colorScheme="green" variant="solid">{data.systemHealth.stripe}</Badge>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </Box>
  );
}
