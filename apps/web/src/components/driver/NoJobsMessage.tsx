'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Button,
  useColorModeValue,
  Container,
} from '@chakra-ui/react';
import {
  FaTruck,
  FaBell,
  FaSync,
  FaMapMarkerAlt,
} from 'react-icons/fa';

interface NoJobsMessageProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  message?: string;
  subMessage?: string;
}

export function NoJobsMessage({
  onRefresh,
  isRefreshing = false,
  message = "No available jobs at the moment",
  subMessage = "New jobs will appear here when customers place orders"
}: NoJobsMessageProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const iconColor = useColorModeValue('gray.400', 'gray.500');

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={6} textAlign="center">
        {/* Icon */}
        <Box
          p={6}
          borderRadius="full"
          bg={bgColor}
          color={iconColor}
        >
          <Icon as={FaTruck} boxSize={12} />
        </Box>

        {/* Message */}
        <VStack spacing={3}>
          <Text
            fontSize="xl"
            fontWeight="semibold"
            color={textColor}
          >
            {message}
          </Text>
          <Text
            fontSize="md"
            color={textColor}
            opacity={0.8}
            lineHeight="1.6"
          >
            {subMessage}
          </Text>
        </VStack>

        {/* Tips */}
        <VStack spacing={4} align="stretch" w="full">
          <Text
            fontSize="sm"
            fontWeight="medium"
            color={textColor}
            opacity={0.7}
          >
            💡 Tips to get more jobs:
          </Text>
          <VStack spacing={2} align="start" w="full" pl={4}>
            <HStack spacing={3}>
              <Icon as={FaMapMarkerAlt} color="blue.500" boxSize={4} />
              <Text fontSize="sm" color={textColor} opacity={0.8}>
                Keep your location updated
              </Text>
            </HStack>
            <HStack spacing={3}>
              <Icon as={FaBell} color="green.500" boxSize={4} />
              <Text fontSize="sm" color={textColor} opacity={0.8}>
                Enable notifications for new jobs
              </Text>
            </HStack>
            <HStack spacing={3}>
              <Icon as={FaSync} color="purple.500" boxSize={4} />
              <Text fontSize="sm" color={textColor} opacity={0.8}>
                Check back regularly for updates
              </Text>
            </HStack>
          </VStack>
        </VStack>

        {/* Refresh Button */}
        {onRefresh && (
          <Button
            colorScheme="blue"
            size="lg"
            onClick={onRefresh}
            isLoading={isRefreshing}
            loadingText="Checking for jobs..."
            leftIcon={<Icon as={FaSync} />}
            borderRadius="xl"
            fontWeight="semibold"
            px={8}
            py={6}
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: 'lg',
            }}
          >
            Check for New Jobs
          </Button>
        )}
      </VStack>
    </Container>
  );
}
