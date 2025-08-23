"use client";
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  Icon, 
  Card, 
  CardBody,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon
} from "@chakra-ui/react";
import { 
  FiWifiOff, 
  FiRefreshCw, 
  FiCheck,
  FiAlertTriangle
} from "react-icons/fi";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    checkOnlineStatus();

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    window.location.reload();
  };

  const handleGoHome = () => {
            window.location.href = '/';
  };

  if (isOnline) {
    return (
      <Box minH={{ base: '100dvh', md: '100vh' }} bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <Card maxW="md" w="full" mx={4}>
          <CardBody>
            <VStack spacing={6} textAlign="center">
              <Icon as={FiCheck} size={48} color="green.500" />
              <VStack spacing={2}>
                <Heading size="lg" color="green.600">Connection Restored!</Heading>
                <Text color="gray.600">
                                     You're back online. You can now continue using the application.
                </Text>
              </VStack>
              <Button 
                colorScheme="green" 
                size="lg" 
                onClick={handleGoHome}
                leftIcon={<FiRefreshCw />}
              >
                Go to Dashboard
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box minH={{ base: '100dvh', md: '100vh' }} bg="gray.50" display="flex" alignItems="center" justifyContent="center">
      <Card maxW="md" w="full" mx={4}>
        <CardBody>
          <VStack spacing={6} textAlign="center">
            <Icon as={FiWifiOff} size={48} color="red.500" />
            <VStack spacing={2}>
              <Heading size="lg" color="red.600">You're Offline</Heading>
              <Text color="gray.600">
                No internet connection detected. Some features may be limited.
              </Text>
            </VStack>

            <Alert status="warning">
              <AlertIcon />
              <Box>
                <AlertTitle>Limited Functionality</AlertTitle>
                <AlertDescription>
                  While offline, you can view cached job details and settings, but you cannot:
                </AlertDescription>
              </Box>
            </Alert>

            <List spacing={2} w="full">
              <ListItem display="flex" alignItems="center">
                <ListIcon as={FiAlertTriangle} color="orange.500" />
                <Text fontSize="sm">Update job status</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <ListIcon as={FiAlertTriangle} color="orange.500" />
                <Text fontSize="sm">Send messages</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <ListIcon as={FiAlertTriangle} color="orange.500" />
                <Text fontSize="sm">Receive new job offers</Text>
              </ListItem>
              <ListItem display="flex" alignItems="center">
                <ListIcon as={FiAlertTriangle} color="orange.500" />
                <Text fontSize="sm">Update location</Text>
              </ListItem>
            </List>

            <VStack spacing={3} w="full">
              <Button 
                colorScheme="blue" 
                size="lg" 
                onClick={handleRetry}
                leftIcon={<FiRefreshCw />}
                isLoading={retrying}
                loadingText="Checking Connection"
                w="full"
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                size="md" 
                onClick={handleGoHome}
                w="full"
              >
                Go to Dashboard
              </Button>
            </VStack>

            <Text fontSize="xs" color="gray.500" textAlign="center">
              If the problem persists, please check your internet connection or contact support.
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
