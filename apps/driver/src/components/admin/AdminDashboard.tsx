'use client';

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
  SimpleGrid,
  useColorModeValue,
  Progress,
  Divider,
} from '@chakra-ui/react';
import {
  FaMapMarkedAlt,
  FaDatabase,
  FaBell,
  FaStripe,
  FaServer,
  FaChartLine,
  FaUsers,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTruck,
  FaPoundSign,
  FaCalendarAlt,
  FaShieldAlt,
  FaCog,
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

interface AdminDashboardProps {
  data: {
    todayRevenue: number;
    activeJobs: number;
    avgEta: string;
    firstResponseTime: string;
    openIncidents: number;
    jobsInProgress: any[];
    newApplications: number;
    recentDriverApplications: any[];
    unreadNotifications: number;
    highPriorityNotifications: number;
    pendingRefunds: number;
    dbHealth: string;
    queueHealth: string;
    pusherHealth: string;
    stripeHealth: string;
  };
}

export default function AdminDashboard({ data }: AdminDashboardProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');

  return (
    <Box position="relative" zIndex={1}>
      {/* Background Pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        opacity={0.02}
        background="radial-gradient(circle at 20% 80%, rgba(0,194,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,209,143,0.1) 0%, transparent 50%)"
        pointerEvents="none"
      />

      {/* Header Section */}
      <Box textAlign="center" mb={8} position="relative" zIndex={1}>
        <VStack spacing={4}>
          <Box
            p={4}
            borderRadius="2xl"
            bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
            borderWidth="2px"
            borderColor="neon.400"
            display="inline-block"
          >
            <Icon as={FaCog} color="neon.500" boxSize={10} />
          </Box>
          <Heading
            size={{ base: 'xl', md: '2xl' }}
            color="neon.500"
            fontWeight="extrabold"
          >
            🛠️ Admin Dashboard
          </Heading>
          <Text
            color="text.secondary"
            fontSize={{ base: 'md', md: 'lg' }}
            maxW="3xl"
            mx="auto"
          >
            Monitor operations, track performance, and manage your Speedy Van
            platform
          </Text>
        </VStack>
      </Box>

      {/* KPI Row */}
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 5 }}
        spacing={6}
        mb={8}
        position="relative"
        zIndex={1}
      >
        <Card
          variant="elevated"
          borderRadius="2xl"
          borderWidth="2px"
          borderColor="border.primary"
          bg={cardBg}
          boxShadow="xl"
          overflow="hidden"
          position="relative"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0,194,255,0.15)',
            borderColor: 'neon.400',
          }}
          transition="all 0.3s ease"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))',
            pointerEvents: 'none',
          }}
        >
          <CardBody p={6} position="relative" zIndex={1}>
            <VStack spacing={3} align="center">
              <Box
                p={3}
                borderRadius="xl"
                bg="green.500"
                color="white"
                boxSize="50px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 4px 15px rgba(0,209,143,0.3)"
              >
                <Icon as={FaPoundSign} boxSize={5} />
              </Box>
              <Stat textAlign="center">
                <StatLabel
                  color="text.secondary"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  Today Revenue
                </StatLabel>
                <StatNumber color="green.500" fontSize="3xl" fontWeight="bold">
                  £{(data.todayRevenue / 100).toFixed(2)}
                </StatNumber>
                <StatHelpText color="success.500" fontSize="sm">
                  <StatArrow type="increase" />
                  12.5%
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card
          variant="elevated"
          borderRadius="2xl"
          borderWidth="2px"
          borderColor="border.primary"
          bg={cardBg}
          boxShadow="xl"
          overflow="hidden"
          position="relative"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0,194,255,0.15)',
            borderColor: 'neon.400',
          }}
          transition="all 0.3s ease"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))',
            pointerEvents: 'none',
          }}
        >
          <CardBody p={6} position="relative" zIndex={1}>
            <VStack spacing={3} align="center">
              <Box
                p={3}
                borderRadius="xl"
                bg="blue.500"
                color="white"
                boxSize="50px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 4px 15px rgba(0,194,255,0.3)"
              >
                <Icon as={FaTruck} boxSize={5} />
              </Box>
              <Stat textAlign="center">
                <StatLabel
                  color="text.secondary"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  Active Jobs
                </StatLabel>
                <StatNumber color="blue.500" fontSize="3xl" fontWeight="bold">
                  {data.activeJobs}
                </StatNumber>
                <StatHelpText color="success.500" fontSize="sm">
                  <StatArrow type="increase" />3 new
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card
          variant="elevated"
          borderRadius="2xl"
          borderWidth="2px"
          borderColor="border.primary"
          bg={cardBg}
          boxShadow="xl"
          overflow="hidden"
          position="relative"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0,194,255,0.15)',
            borderColor: 'neon.400',
          }}
          transition="all 0.3s ease"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))',
            pointerEvents: 'none',
          }}
        >
          <CardBody p={6} position="relative" zIndex={1}>
            <VStack spacing={3} align="center">
              <Box
                p={3}
                borderRadius="xl"
                bg="purple.500"
                color="white"
                boxSize="50px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 4px 15px rgba(128,90,213,0.3)"
              >
                <Icon as={FaClock} boxSize={5} />
              </Box>
              <Stat textAlign="center">
                <StatLabel
                  color="text.secondary"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  Avg ETA
                </StatLabel>
                <StatNumber color="purple.500" fontSize="3xl" fontWeight="bold">
                  {data.avgEta}
                </StatNumber>
                <StatHelpText color="success.500" fontSize="sm">
                  <StatArrow type="decrease" />2 min faster
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card
          variant="elevated"
          borderRadius="2xl"
          borderWidth="2px"
          borderColor="border.primary"
          bg={cardBg}
          boxShadow="xl"
          overflow="hidden"
          position="relative"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0,194,255,0.15)',
            borderColor: 'neon.400',
          }}
          transition="all 0.3s ease"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))',
            pointerEvents: 'none',
          }}
        >
          <CardBody p={6} position="relative" zIndex={1}>
            <VStack spacing={3} align="center">
              <Box
                p={3}
                borderRadius="xl"
                bg="orange.500"
                color="white"
                boxSize="50px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 4px 15px rgba(255,159,64,0.3)"
              >
                <Icon as={FaBell} boxSize={5} />
              </Box>
              <Stat textAlign="center">
                <StatLabel
                  color="text.secondary"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  First Response
                </StatLabel>
                <StatNumber color="orange.500" fontSize="3xl" fontWeight="bold">
                  {data.firstResponseTime}
                </StatNumber>
                <StatHelpText color="success.500" fontSize="sm">
                  <StatArrow type="decrease" />
                  0.8 min faster
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card
          variant="elevated"
          borderRadius="2xl"
          borderWidth="2px"
          borderColor="border.primary"
          bg={cardBg}
          boxShadow="xl"
          overflow="hidden"
          position="relative"
          _hover={{
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0,194,255,0.15)',
            borderColor: 'neon.400',
          }}
          transition="all 0.3s ease"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))',
            pointerEvents: 'none',
          }}
        >
          <CardBody p={6} position="relative" zIndex={1}>
            <VStack spacing={3} align="center">
              <Box
                p={3}
                borderRadius="xl"
                bg="red.500"
                color="white"
                boxSize="50px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 4px 15px rgba(239,68,68,0.3)"
              >
                <Icon as={FaExclamationTriangle} boxSize={5} />
              </Box>
              <Stat textAlign="center">
                <StatLabel
                  color="text.secondary"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  Open Incidents
                </StatLabel>
                <StatNumber color="red.500" fontSize="3xl" fontWeight="bold">
                  {data.openIncidents}
                </StatNumber>
                <StatHelpText color="success.500" fontSize="sm">
                  <StatArrow type="decrease" />2 resolved
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Grid
        templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
        gap={8}
        position="relative"
        zIndex={1}
      >
        {/* Live Ops Panel */}
        <Card
          variant="elevated"
          borderRadius="2xl"
          borderWidth="2px"
          borderColor="border.primary"
          bg={cardBg}
          boxShadow="xl"
          overflow="hidden"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 40px rgba(0,194,255,0.15)',
            borderColor: 'neon.400',
          }}
          transition="all 0.3s ease"
        >
          <CardHeader pb={4}>
            <HStack spacing={3}>
              <Icon as={FaChartLine} color="neon.500" boxSize={6} />
              <Heading size="lg" color="text.primary">
                Live Operations
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {data.jobsInProgress.map(job => (
                <Box
                  key={job.id}
                  p={5}
                  border="2px"
                  borderColor="border.primary"
                  borderRadius="xl"
                  bg="bg.surface"
                  _hover={{
                    borderColor: 'neon.400',
                    bg: 'bg.surface.hover',
                    transform: 'translateX(4px)',
                    boxShadow: '0 8px 25px rgba(0,194,255,0.1)',
                  }}
                  transition="all 0.3s ease"
                >
                  <Flex align="center" justify="space-between">
                    <VStack align="start" spacing={2}>
                      <HStack spacing={3}>
                        <Text
                          fontWeight="bold"
                          color="text.primary"
                          fontSize="lg"
                        >
                          #{job.reference}
                        </Text>
                        <Badge
                          colorScheme={
                            job.status === 'assigned'
                              ? 'blue'
                              : job.status === 'in_progress'
                                ? 'yellow'
                                : job.status === 'picked_up'
                                  ? 'green'
                                  : 'gray'
                          }
                          variant="solid"
                          size="lg"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </HStack>
                      <VStack align="start" spacing={1}>
                        <Text
                          fontSize="md"
                          color="text.secondary"
                          fontWeight="medium"
                        >
                          <Icon as={FaMapMarkedAlt} mr={2} color="neon.400" />
                          {job.pickupAddress} → {job.dropoffAddress}
                        </Text>
                        <Text fontSize="sm" color="text.tertiary">
                          <Icon as={FaUsers} mr={2} color="neon.400" />
                          Driver: {job.driver?.user.name || 'Unassigned'}
                        </Text>
                      </VStack>
                    </VStack>
                    <VStack align="end" spacing={2}>
                      <Text
                        fontSize="sm"
                        color="text.tertiary"
                        textAlign="right"
                      >
                        {formatDistanceToNow(new Date(job.createdAt), {
                          addSuffix: true,
                        })}
                      </Text>
                      <Progress
                        value={70}
                        size="sm"
                        colorScheme="neon"
                        borderRadius="full"
                        w="100px"
                      />
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
          <Card
            variant="elevated"
            borderRadius="2xl"
            borderWidth="2px"
            borderColor="border.primary"
            bg={cardBg}
            boxShadow="xl"
            overflow="hidden"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 20px 40px rgba(0,194,255,0.15)',
              borderColor: 'neon.400',
            }}
            transition="all 0.3s ease"
          >
            <CardHeader pb={4}>
              <HStack spacing={3}>
                <Icon as={FaUsers} color="blue.500" boxSize={6} />
                <Heading size="md" color="text.primary">
                  Queue
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex
                  justify="space-between"
                  align="center"
                  p={3}
                  borderRadius="lg"
                  bg="blue.50"
                  _dark={{ bg: 'blue.900' }}
                >
                  <Text color="text.secondary" fontWeight="medium">
                    Driver Applications
                  </Text>
                  <Badge
                    colorScheme="blue"
                    variant="solid"
                    size="lg"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {data.newApplications}
                  </Badge>
                </Flex>
                <Flex
                  justify="space-between"
                  align="center"
                  p={3}
                  borderRadius="lg"
                  bg="orange.50"
                  _dark={{ bg: 'orange.900' }}
                >
                  <Text color="text.secondary" fontWeight="medium">
                    Pending Refunds
                  </Text>
                  <Badge
                    colorScheme="orange"
                    variant="solid"
                    size="lg"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {data.pendingRefunds}
                  </Badge>
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* Driver Application Notifications */}
          {data.recentDriverApplications.length > 0 && (
            <Card
              variant="elevated"
              borderRadius="2xl"
              borderWidth="2px"
              borderColor="red.400"
              bg={cardBg}
              boxShadow="xl"
              overflow="hidden"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 20px 40px rgba(239,68,68,0.15)',
                borderColor: 'red.300',
              }}
              transition="all 0.3s ease"
            >
              <CardHeader pb={4} bg="red.50" _dark={{ bg: 'red.900' }}>
                <HStack spacing={3} justify="space-between">
                  <HStack spacing={3}>
                    <Icon
                      as={FaExclamationTriangle}
                      color="red.500"
                      boxSize={6}
                    />
                    <Heading size="md" color="text.primary">
                      New Driver Applications
                    </Heading>
                  </HStack>
                  <Badge
                    colorScheme="red"
                    variant="solid"
                    size="lg"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {data.recentDriverApplications.length} New
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {data.recentDriverApplications.map((notification, index) => (
                    <Box
                      key={notification.id}
                      p={4}
                      border="1px solid"
                      borderColor="red.200"
                      borderRadius="lg"
                      bg="red.50"
                      _dark={{
                        borderColor: 'red.700',
                        bg: 'red.900',
                      }}
                      _hover={{
                        borderColor: 'red.300',
                        bg: 'red.100',
                        _dark: {
                          borderColor: 'red.600',
                          bg: 'red.800',
                        },
                      }}
                      transition="all 0.2s ease"
                    >
                      <VStack align="start" spacing={2}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold" color="text.primary">
                            {notification.data?.driverName || 'New Driver'}
                          </Text>
                          <Text fontSize="sm" color="text.tertiary">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="text.secondary">
                          {notification.data?.email || 'Email not provided'}
                        </Text>
                        <Text fontSize="sm" color="text.secondary">
                          Phone:{' '}
                          {notification.data?.phone || 'Phone not provided'}
                        </Text>
                        <HStack spacing={2} mt={2}>
                          <Badge colorScheme="red" variant="outline" size="sm">
                            High Priority
                          </Badge>
                          <Badge colorScheme="blue" variant="outline" size="sm">
                            Requires Review
                          </Badge>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                  <Box textAlign="center" pt={2}>
                    <Text fontSize="sm" color="text.tertiary">
                      <a
                        href="/admin/drivers/applications"
                        style={{
                          color: 'inherit',
                          textDecoration: 'underline',
                        }}
                      >
                        View All Applications →
                      </a>
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* System Health */}
          <Card
            variant="elevated"
            borderRadius="2xl"
            borderWidth="2px"
            borderColor="border.primary"
            bg={cardBg}
            boxShadow="xl"
            overflow="hidden"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 20px 40px rgba(0,194,255,0.15)',
              borderColor: 'neon.400',
            }}
            transition="all 0.3s ease"
          >
            <CardHeader pb={4}>
              <HStack spacing={3}>
                <Icon as={FaShieldAlt} color="green.500" boxSize={6} />
                <Heading size="md" color="text.primary">
                  System Health
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex
                  justify="space-between"
                  align="center"
                  p={3}
                  borderRadius="lg"
                  bg="green.50"
                  _dark={{ bg: 'green.900' }}
                >
                  <HStack spacing={3}>
                    <Icon as={FaDatabase} color="green.500" />
                    <Text color="text.secondary" fontWeight="medium">
                      Database
                    </Text>
                  </HStack>
                  <Badge
                    colorScheme="green"
                    variant="solid"
                    size="lg"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {data.dbHealth}
                  </Badge>
                </Flex>
                <Flex
                  justify="space-between"
                  align="center"
                  p={3}
                  borderRadius="lg"
                  bg="green.50"
                  _dark={{ bg: 'green.900' }}
                >
                  <HStack spacing={3}>
                    <Icon as={FaServer} color="green.500" />
                    <Text color="text.secondary" fontWeight="medium">
                      Queue
                    </Text>
                  </HStack>
                  <Badge
                    colorScheme="green"
                    variant="solid"
                    size="lg"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {data.queueHealth}
                  </Badge>
                </Flex>
                <Flex
                  justify="space-between"
                  align="center"
                  p={3}
                  borderRadius="lg"
                  bg="green.50"
                  _dark={{ bg: 'green.900' }}
                >
                  <HStack spacing={3}>
                    <Icon as={FaBell} color="green.500" />
                    <Text color="text.secondary" fontWeight="medium">
                      Pusher
                    </Text>
                  </HStack>
                  <Badge
                    colorScheme="green"
                    variant="solid"
                    size="lg"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {data.pusherHealth}
                  </Badge>
                </Flex>
                <Flex
                  justify="space-between"
                  align="center"
                  p={3}
                  borderRadius="lg"
                  bg="green.50"
                  _dark={{ bg: 'green.900' }}
                >
                  <HStack spacing={3}>
                    <Icon as={FaStripe} color="green.500" />
                    <Text color="text.secondary" fontWeight="medium">
                      Stripe
                    </Text>
                  </HStack>
                  <Badge
                    colorScheme="green"
                    variant="solid"
                    size="lg"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {data.stripeHealth}
                  </Badge>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </Box>
  );
}
