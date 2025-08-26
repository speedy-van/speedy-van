'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  Text,
  Heading,
  Card,
  CardBody
} from '@chakra-ui/react';
import { FiRefreshCw, FiHome, FiArrowLeft } from 'react-icons/fi';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error monitoring service
      console.error('Production error:', { error, errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/admin';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box p={6} minH="100vh" bg="gray.50">
          <Card maxW="600px" mx="auto" mt={20}>
            <CardBody>
              <VStack spacing={6} textAlign="center">
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Application Error</AlertTitle>
                    <AlertDescription>
                      Something went wrong while loading this page. Please try again.
                    </AlertDescription>
                  </Box>
                </Alert>

                <VStack spacing={4}>
                  <Heading size="md" color="gray.700">
                    Oops! Something went wrong
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    We encountered an unexpected error. This has been logged and our team will investigate.
                  </Text>
                  
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <Box 
                      p={4} 
                      bg="gray.100" 
                      borderRadius="md" 
                      w="full" 
                      textAlign="left"
                      fontSize="xs"
                      fontFamily="mono"
                    >
                      <Text fontWeight="bold" mb={2}>Error Details (Development):</Text>
                      <Text color="red.600">{this.state.error.message}</Text>
                      {this.state.errorInfo && (
                        <Text color="gray.600" mt={2}>
                          {this.state.errorInfo.componentStack}
                        </Text>
                      )}
                    </Box>
                  )}
                </VStack>

                <VStack spacing={3} w="full">
                  <Button
                    leftIcon={<FiRefreshCw />}
                    colorScheme="blue"
                    onClick={this.handleRetry}
                    w="full"
                  >
                    Try Again
                  </Button>
                  
                  <Button
                    leftIcon={<FiArrowLeft />}
                    variant="outline"
                    onClick={this.handleGoBack}
                    w="full"
                  >
                    Go Back
                  </Button>
                  
                  <Button
                    leftIcon={<FiHome />}
                    variant="ghost"
                    onClick={this.handleGoHome}
                    w="full"
                  >
                    Go to Dashboard
                  </Button>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
