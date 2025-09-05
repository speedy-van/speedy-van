import React from 'react';
import {
  Box,
  Spinner,
  Text,
  VStack,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showProgress?: boolean;
  progressValue?: number;
  error?: string | null;
  onRetry?: () => void;
  fullHeight?: boolean;
}

export default function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  showProgress = false,
  progressValue = 0,
  error = null,
  onRetry,
  fullHeight = false,
}: LoadingSpinnerProps) {
  if (error) {
    return (
      <Box
        p={6}
        textAlign="center"
        minH={fullHeight ? '100vh' : 'auto'}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4} maxW="400px">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Loading Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>

          {onRetry && (
            <Button
              leftIcon={<FiRefreshCw />}
              colorScheme="blue"
              onClick={onRetry}
            >
              Try Again
            </Button>
          )}
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      p={6}
      textAlign="center"
      minH={fullHeight ? '100vh' : 'auto'}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size={size}
        />

        <Text color="gray.600" fontSize="sm">
          {message}
        </Text>

        {showProgress && (
          <Box w="200px">
            <Progress
              value={progressValue}
              size="sm"
              colorScheme="blue"
              borderRadius="full"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              {Math.round(progressValue)}% complete
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
