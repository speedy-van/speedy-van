'use client';

import React from 'react';
import {
  Box as Card,
  Box as CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Box,
  Divider,
  Icon,
  Flex,
  useColorModeValue,
  Link as ChakraLink,
  Tooltip,
  IconButton,
} from '@chakra-ui/react';
import {
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaClock,
  FaBox,
  FaTruck,
  FaMap,
  FaPhoneAlt,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';

interface Job {
  id: string;
  reference: string;
  customer: string;
  customerPhone: string;
  date: string;
  time: string;
  from: string;
  to: string;
  distance: string;
  vehicleType: string;
  items: string;
  estimatedEarnings: number;
  status: string;
  priority?: string;
  duration?: string;
  crew?: string;
}

interface EnhancedJobCardProps {
  job: Job;
  onAccept?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  isAccepting?: boolean;
  variant?: 'assigned' | 'available';
}

export function EnhancedJobCard({
  job,
  onAccept,
  onViewDetails,
  isAccepting = false,
  variant = 'available'
}: EnhancedJobCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const primaryColor = variant === 'assigned' ? 'blue' : 'green';
  const statusColor = variant === 'assigned' ? 'blue.500' : 'green.500';

  const handleCallCustomer = () => {
    window.open(`tel:${job.customerPhone}`, '_self');
  };

  const handleOpenMap = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'normal': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Card
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow="lg"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'xl',
      }}
    >
      <CardBody p={{ base: 5, md: 6 }} px={{ base: 6, md: 7 }}>
        <VStack spacing={{ base: 6, md: 7 }} align="stretch">
          {/* Header with Job ID and Price */}
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text
                fontWeight="bold"
                fontSize="lg"
                color="gray.800"
                fontFamily="mono"
              >
                {job.reference}
              </Text>
              {job.priority && (
                <Badge
                  colorScheme={getPriorityColor(job.priority)}
                  size="sm"
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  {job.priority.toUpperCase()}
                </Badge>
              )}
            </VStack>
            <VStack align="end" spacing={1}>
              <Text
                fontWeight="800"
                fontSize="2xl"
                color={`${primaryColor}.700`}
              >
                £{isNaN(Number(job.estimatedEarnings)) ? '0.00' : Number(job.estimatedEarnings).toFixed(2)}
              </Text>
              <Badge
                colorScheme={primaryColor}
                size="lg"
                borderRadius="full"
                px={3}
                py={1}
              >
                {job.status.toUpperCase()}
              </Badge>
            </VStack>
          </Flex>

          <Divider borderColor="gray.400" borderWidth="1px" />

          {/* Customer Information */}
          <Box>
            <Text fontWeight="semibold" color="gray.700" mb={3} fontSize="md">
              Customer Details
            </Text>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} align="center">
                <Icon as={FaUser} color="blue.500" boxSize={4} />
                <Text 
                  fontWeight="medium" 
                  color="gray.800"
                  fontSize="16px"
                  lineHeight="24px"
                  flex="1"
                >
                  {job.customer || 'No customer info'}
                </Text>
              </HStack>
              <HStack spacing={4} align="center">
                <Icon as={FaPhone} color="blue.500" boxSize={4} />
                <Text 
                  color={job.customerPhone ? "gray.700" : "gray.400"}
                  fontSize="16px"
                  lineHeight="24px"
                  flex="1"
                >
                  {job.customerPhone || 'No contact info'}
                </Text>
                {job.customerPhone ? (
                  <Tooltip label="Call Customer">
                    <IconButton
                      aria-label="Call customer"
                      icon={<FaPhoneAlt />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={handleCallCustomer}
                    />
                  </Tooltip>
                ) : null}
              </HStack>
            </VStack>
          </Box>

          <Divider borderColor="gray.400" borderWidth="1px" />

          {/* Pickup Location */}
          <Box>
            <HStack spacing={3} mb={4} align="center">
              <Box
                p={2}
                borderRadius="lg"
                bg="green.50"
                border="1px solid"
                borderColor="green.200"
              >
                <Icon as={FaMapMarkerAlt} color="green.600" boxSize={5} />
              </Box>
              <Text fontWeight="bold" color="green.700" fontSize="lg">
                Pickup Location
              </Text>
            </HStack>
            <VStack align="stretch" spacing={3} pl={2}>
              <Text 
                fontWeight="semibold" 
                color="gray.800"
                fontSize="17px"
                lineHeight="26px"
              >
                {job.from}
              </Text>
              <HStack spacing={4} align="center">
                <Badge
                  colorScheme="green"
                  size="md"
                  px={3}
                  py={1}
                  borderRadius="lg"
                  fontWeight="medium"
                >
                  📅 {job.date} at {job.time}
                </Badge>
                <Tooltip label="Open in Maps" hasArrow>
                  <IconButton
                    aria-label="Open pickup location in maps"
                    icon={<FaMap />}
                    size="sm"
                    colorScheme="green"
                    variant="outline"
                    borderRadius="lg"
                    onClick={() => handleOpenMap(job.from)}
                    _hover={{
                      transform: 'scale(1.05)',
                      boxShadow: 'md'
                    }}
                  />
                </Tooltip>
              </HStack>
            </VStack>
          </Box>

          <Divider borderColor="gray.400" borderWidth="1px" />

          {/* Dropoff Location */}
          <Box>
            <HStack spacing={3} mb={4} align="center">
              <Box
                p={2}
                borderRadius="lg"
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
              >
                <Icon as={FaMapMarkerAlt} color="red.400" boxSize={5} />
              </Box>
              <Text fontWeight="bold" color="red.600" fontSize="lg">
                Dropoff Location
              </Text>
            </HStack>
            <VStack align="stretch" spacing={3} pl={2}>
              <Text 
                fontWeight="semibold" 
                color="gray.800"
                fontSize="17px"
                lineHeight="26px"
              >
                {job.to}
              </Text>
              <HStack spacing={4} align="center">
                <Badge
                  colorScheme="red"
                  size="md"
                  px={3}
                  py={1}
                  borderRadius="lg"
                  fontWeight="medium"
                  variant="subtle"
                >
                  📍 Distance: {job.distance}
                </Badge>
                <Tooltip label="Open in Maps" hasArrow>
                  <IconButton
                    aria-label="Open dropoff location in maps"
                    icon={<FaMap />}
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    borderRadius="lg"
                    onClick={() => handleOpenMap(job.to)}
                    _hover={{
                      transform: 'scale(1.05)',
                      boxShadow: 'md'
                    }}
                  />
                </Tooltip>
              </HStack>
            </VStack>
          </Box>

          <Divider borderColor="gray.400" borderWidth="1px" />

          {/* Job Details */}
          <Box>
            <Text fontWeight="bold" color="gray.800" mb={4} fontSize="lg">
              Job Details
            </Text>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} align="center">
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="purple.50"
                  border="1px solid"
                  borderColor="purple.200"
                >
                  <Icon as={FaTruck} color="purple.600" boxSize={5} />
                </Box>
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">Vehicle</Text>
                  <Text color="gray.800" fontWeight="semibold" fontSize="16px">{job.vehicleType}</Text>
                </VStack>
              </HStack>
              
              <HStack spacing={4} align="center">
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="purple.50"
                  border="1px solid"
                  borderColor="purple.200"
                >
                  <Icon as={FaBox} color="purple.600" boxSize={5} />
                </Box>
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">Items</Text>
                  <Text color="gray.800" fontWeight="semibold" fontSize="16px">{job.items}</Text>
                </VStack>
              </HStack>
              
              {job.duration && (
                <HStack spacing={4} align="center">
                  <Box
                    p={2}
                    borderRadius="lg"
                    bg="purple.50"
                    border="1px solid"
                    borderColor="purple.200"
                  >
                    <Icon as={FaClock} color="purple.600" boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">Duration</Text>
                    <Text color="gray.800" fontWeight="semibold" fontSize="16px">{job.duration}</Text>
                  </VStack>
                </HStack>
              )}
              
              {job.crew && (
                <HStack spacing={4} align="center">
                  <Box
                    p={2}
                    borderRadius="lg"
                    bg="purple.50"
                    border="1px solid"
                    borderColor="purple.200"
                  >
                    <Icon as={FaUser} color="purple.600" boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">Crew</Text>
                    <Text color="gray.800" fontWeight="semibold" fontSize="16px">{job.crew}</Text>
                  </VStack>
                </HStack>
              )}
            </VStack>
          </Box>

          <Divider borderColor="gray.400" borderWidth="1px" />

          {/* Action Buttons */}
          <VStack spacing={3}>
            {onAccept && (
              <Button
                colorScheme={primaryColor}
                size="lg"
                width="full"
                leftIcon={<FaCheckCircle />}
                onClick={() => onAccept(job.id)}
                isLoading={isAccepting}
                loadingText="Accepting..."
                borderRadius="xl"
                fontWeight="bold"
                fontSize="md"
                py={6}
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                }}
              >
                Accept Job
              </Button>
            )}
            {onViewDetails && (
              <Button
                variant="outline"
                size="md"
                width="full"
                onClick={() => onViewDetails(job.id)}
                borderRadius="xl"
                borderColor={`${primaryColor}.300`}
                color={`${primaryColor}.600`}
                _hover={{
                  bg: `${primaryColor}.50`,
                  borderColor: `${primaryColor}.400`,
                }}
              >
                View Full Details
              </Button>
            )}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}
