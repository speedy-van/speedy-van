'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Link as ChakraLink,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function DriverResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/driver/auth/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Container maxW="md" py={12}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Heading size="lg" mb={2}>
              Invalid Reset Link
            </Heading>
            <Text color="gray.600">
              This password reset link is invalid or has expired.
            </Text>
          </Box>
          <Button
            as={NextLink}
            href="/driver/forgot"
            colorScheme="blue"
            size="lg"
            w="full"
          >
            Request New Reset Link
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Set New Password
          </Heading>
          <Text color="gray.600">Enter your new password below</Text>
        </Box>

        <Card w="full">
          <CardBody>
            {success ? (
              <VStack spacing={4}>
                <Alert status="success">
                  <AlertIcon />
                  Your password has been reset successfully!
                </Alert>
                <Button
                  as={NextLink}
                  href="/driver/login"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                >
                  Sign In
                </Button>
              </VStack>
            ) : (
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  {error && (
                    <Alert status="error">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}

                  <FormControl isRequired>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your new password"
                      minLength={8}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Confirm Password</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                  >
                    Reset Password
                  </Button>
                </VStack>
              </form>
            )}
          </CardBody>
        </Card>

        <Text fontSize="sm" color="gray.500" textAlign="center">
          Remember your password?{' '}
          <ChakraLink as={NextLink} href="/driver/login" color="blue.500">
            Sign in here
          </ChakraLink>
        </Text>
      </VStack>
    </Container>
  );
}
