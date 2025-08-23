"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { Box, Button, FormControl, FormLabel, Heading, Input, Link as ChakraLink, Text, VStack, Divider } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

export default function CustomerPortalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      if (user.role === 'customer') {
        router.push('/customer-portal');
      } else {
        // Redirect to appropriate portal based on role
        switch (user.role) {
          case 'driver':
            router.push('/driver/dashboard');
            break;
          case 'admin':
            router.push('/admin');
            break;
          default:
            router.push('/');
        }
      }
    }
  }, [session, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const res = await signIn("credentials", { 
        email, 
        password, 
        redirect: false, 
        callbackUrl: "/customer-portal" 
      });
      
      if (!res || res.error) {
        setError("Invalid email or password");
      } else if (res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box maxW="sm" mx="auto">
      <Heading size="md" mb={4}>Customer Login</Heading>
      <Box as="form" onSubmit={onSubmit} bg="white" p={4} borderWidth="1px" borderRadius="md">
        <VStack spacing={3} align="stretch">
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </FormControl>
          {error && <Text color="red.500" fontSize="sm">{error}</Text>}
          <Button type="submit" isLoading={loading} colorScheme="blue">Sign in</Button>
          <ChakraLink as={NextLink} href="/auth/forgot">Forgot password?</ChakraLink>
          <Text fontSize="sm">New here? <ChakraLink as={NextLink} href="/book">Start a booking</ChakraLink></Text>
          <Divider />
          <Text fontSize="sm" textAlign="center">
            Or{' '}
            <ChakraLink as={NextLink} href="/?showAuth=true&returnTo=/customer-portal" color="teal.500">
              sign in with the main portal
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}


