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
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Today Revenue</StatLabel>
              <StatNumber>£{(data.todayRevenue / 100).toFixed(2)}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                12.5%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Active Jobs</StatLabel>
              <StatNumber>{data.activeJobs}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                3 new
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Avg ETA</StatLabel>
              <StatNumber>{data.avgEta}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                2 min faster
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>First Response</StatLabel>
              <StatNumber>{data.firstResponseTime}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                0.8 min faster
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Open Incidents</StatLabel>
              <StatNumber>{data.openIncidents}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                2 resolved
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
        {/* Live Ops Panel */}
        <Card>
          <CardHeader>
            <Heading size="md">Live Operations</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {data.jobsInProgress.map((job) => (
                <Box key={job.id} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                  <Flex align="center" justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">#{job.reference}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {job.pickupAddress} → {job.dropoffAddress}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Driver: {job.driver?.user.name || "Unassigned"}
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Badge colorScheme={
                        job.status === "assigned" ? "blue" :
                        job.status === "in_progress" ? "yellow" :
                        job.status === "picked_up" ? "green" : "gray"
                      }>
                        {job.status.replace("_", " ")}
                      </Badge>
                      <Text fontSize="sm" color="gray.500">
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
          <Card>
            <CardHeader>
              <Heading size="md">Queue</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text>Driver Applications</Text>
                  <Badge colorScheme="blue">{data.newApplications}</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text>Pending Refunds</Text>
                  <Badge colorScheme="orange">{data.pendingRefunds}</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <Text>Disputed Payouts</Text>
                  <Badge colorScheme="red">0</Badge>
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* Map Snapshot */}
          <Card>
            <CardHeader>
              <Heading size="md">Map Snapshot</Heading>
            </CardHeader>
            <CardBody>
              <Box 
                bg="gray.100" 
                h="200px" 
                borderRadius="md" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <VStack>
                  <Icon as={FaMapMarkedAlt} boxSize={8} color="gray.400" />
                  <Text color="gray.500">Live Map View</Text>
                  <Text fontSize="sm" color="gray.400">{data.activeJobs} active crews</Text>
                </VStack>
              </Box>
            </CardBody>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <Heading size="md">System Health</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={FaDatabase} color="green.500" />
                    <Text>Database</Text>
                  </HStack>
                  <Badge colorScheme="green">{data.systemHealth.db}</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={FaServer} color="green.500" />
                    <Text>Queue</Text>
                  </HStack>
                  <Badge colorScheme="green">{data.systemHealth.queue}</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={FaBell} color="green.500" />
                    <Text>Pusher</Text>
                  </HStack>
                  <Badge colorScheme="green">{data.systemHealth.pusher}</Badge>
                </Flex>
                <Flex justify="space-between" align="center">
                  <HStack>
                    <Icon as={FaStripe} color="green.500" />
                    <Text>Stripe Webhooks</Text>
                  </HStack>
                  <Badge colorScheme="green">{data.systemHealth.stripe}</Badge>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </Box>
  );
}
