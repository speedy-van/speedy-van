"use client";

import React, { useState } from "react";
import { Box, Container, VStack, Heading, Text, FormControl, FormLabel, Input, Button, Alert, AlertIcon, Card, CardBody, Link as ChakraLink } from "@chakra-ui/react";
import { signIn, getCsrfToken, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";

export default function DriverLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  // Get CSRF token on component mount
  React.useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const token = await getCsrfToken();
        setCsrfToken(token || "");
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };
    fetchCsrfToken();
  }, []);

  // Monitor session and redirect if already authenticated
  React.useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (session?.user && (session.user as any).role === "driver") {
      console.log("✅ Driver session detected, redirecting to dashboard");
      router.replace("/driver/dashboard");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log('Attempting to sign in with:', { email, password, csrfToken });
      
      const result = await signIn("credentials", {
        email,
        password,
        csrfToken,
        redirect: false,
      });

      console.log('Sign in result:', result);

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        console.log('Sign in successful, refreshing session...');
        // Force session refresh and then redirect
        try {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit for session to update
          console.log('✅ SignIn successful, refreshing session...');
          await router.refresh(); // Refresh the router
          console.log('✅ Session refreshed successfully');
          
          // Check if session was updated
          if (session?.user && (session.user as any).role === "driver") {
            console.log('✅ Session updated, redirecting to dashboard');
            router.push("/driver/dashboard");
          } else {
            console.log('⚠️ Session not updated, attempting direct redirect...');
            // Force redirect even if session hasn't updated yet
            router.push("/driver/dashboard");
          }
        } catch (error) {
          console.error('Error during redirect:', error);
          // Fallback redirect
          router.push("/driver/dashboard");
        }
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <Heading size="lg" mb={2}>Driver Login</Heading>
          <Text color="gray.600">Sign in to your driver account</Text>
        </Box>

        <Card w="full">
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                {error && (
                  <Alert data-testid="error-message" status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                {/* Hidden CSRF token field */}
                <input type="hidden" name="csrfToken" value={csrfToken} />

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    data-testid="email-input"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    data-testid="password-input"
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </FormControl>

                <Button
                  data-testid="login-button"
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                >
                  Sign In
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        <VStack spacing={2}>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            <ChakraLink data-testid="forgot-password-link" as={NextLink} href="/driver/forgot" color="blue.500">
              Forgot your password?
            </ChakraLink>
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Don't have a driver account? Contact support to get started.
          </Text>
        </VStack>
      </VStack>
    </Container>
  );
}
