"use client";

import React, { useState } from "react";
import { Box, Container, VStack, Heading, Text, FormControl, FormLabel, Input, Button, Alert, AlertIcon, Card, CardBody, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";

export default function DriverForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/driver/auth/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="lg" mb={2}>Reset Password</Heading>
          <Text color="gray.600">Enter your email to receive a password reset link</Text>
        </Box>

        <Card w="full">
          <CardBody>
            {success ? (
              <VStack spacing={4}>
                <Alert status="success">
                  <AlertIcon />
                  If an account with that email exists, a password reset link has been sent.
                </Alert>
                <Button
                  as={NextLink}
                  href="/driver/login"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                >
                  Back to Login
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
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                  >
                    Send Reset Link
                  </Button>
                </VStack>
              </form>
            )}
          </CardBody>
        </Card>

        <Text fontSize="sm" color="gray.500" textAlign="center">
          Remember your password?{" "}
          <ChakraLink as={NextLink} href="/driver/login" color="blue.500">
            Sign in here
          </ChakraLink>
        </Text>
      </VStack>
    </Container>
  );
}
