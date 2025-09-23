'use client';

import React, { useState, useEffect } from 'react';
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
  IconButton,
  HStack,
  Icon,
  InputGroup,
  InputRightElement,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import {
  FaTruck,
  FaArrowLeft,
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

export default function DriverResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [searchParams]);

  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
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

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/driver-auth');
        }, 3000);
      } else {
        setError(result.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push('/driver-auth');
  };

  if (success) {
    return (
      <Box
        minH="100vh"
        bg={bgColor}
        py={{ base: 8, md: 12 }}
        position="relative"
        overflow="hidden"
      >
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

        <Container maxW="2xl" position="relative" zIndex={1}>
          <VStack spacing={{ base: 8, md: 12 }}>
            {/* Back Button */}
            <HStack w="full" justify="flex-start">
              <IconButton
                aria-label="Back to login"
                icon={<FaArrowLeft />}
                variant="ghost"
                onClick={handleBackClick}
                size="lg"
                color="text.secondary"
                _hover={{
                  bg: 'rgba(0,194,255,0.1)',
                  color: 'neon.400',
                }}
                transition="all 0.2s"
              />
            </HStack>

            <Card
              w="full"
              borderRadius="2xl"
              borderWidth="2px"
              borderColor="border.primary"
              bg={cardBg}
              boxShadow="xl"
              overflow="hidden"
              position="relative"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '2xl',
                background:
                  'linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))',
                pointerEvents: 'none',
              }}
            >
              <CardBody
                p={{ base: 6, md: 8 }}
                position="relative"
                zIndex={1}
              >
                <VStack spacing={6} textAlign="center">
                  <Box
                    p={6}
                    borderRadius="2xl"
                    bg="green.500"
                    color="white"
                    boxSize="80px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    boxShadow="0 8px 25px rgba(72,187,120,0.3)"
                  >
                    <Icon as={FaCheckCircle} boxSize={8} />
                  </Box>

                  <VStack spacing={4}>
                    <Heading size="lg" color="text.primary">
                      Password Reset Successful!
                    </Heading>
                    <Text color="text.secondary" fontSize="md" lineHeight="1.6">
                      Your password has been successfully reset. You can now sign in with your new password.
                    </Text>
                    <Alert status="success" borderRadius="xl" borderWidth="1px">
                      <AlertIcon />
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" fontWeight="semibold">
                          Redirecting to login...
                        </Text>
                        <Text fontSize="sm">
                          You will be automatically redirected to the driver login page in a few seconds.
                        </Text>
                      </VStack>
                    </Alert>
                  </VStack>

                  <Button
                    onClick={() => router.push('/driver-auth')}
                    colorScheme="blue"
                    size="md"
                    w="full"
                    borderRadius="xl"
                    leftIcon={<FaTruck />}
                  >
                    Go to Driver Login
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      py={{ base: 8, md: 12 }}
      position="relative"
      overflow="hidden"
    >
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

      <Container maxW="2xl" position="relative" zIndex={1}>
        <VStack spacing={{ base: 8, md: 12 }}>
          {/* Back Button */}
          <HStack w="full" justify="flex-start">
            <IconButton
              aria-label="Back to login"
              icon={<FaArrowLeft />}
              variant="ghost"
              onClick={handleBackClick}
              size="lg"
              color="text.secondary"
              _hover={{
                bg: 'rgba(0,194,255,0.1)',
                color: 'neon.400',
              }}
              transition="all 0.2s"
            />
          </HStack>

          {/* Header Section */}
          <Box textAlign="center" w="full">
            <VStack spacing={6}>
              <Box
                p={6}
                borderRadius="2xl"
                bg="linear-gradient(135deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))"
                borderWidth="2px"
                borderColor="neon.400"
                display="inline-block"
              >
                <Icon as={FaTruck} color="neon.500" boxSize={12} />
              </Box>

              <VStack spacing={3}>
                <Heading
                  size={{ base: 'xl', md: '2xl' }}
                  color="neon.500"
                  mb={2}
                  textShadow="0 0 20px rgba(0,194,255,0.3)"
                  fontWeight="extrabold"
                >
                  Set New Password
                </Heading>
                <Text
                  color="text.secondary"
                  fontSize={{ base: 'md', md: 'lg' }}
                  maxW="2xl"
                  mx="auto"
                  lineHeight="1.6"
                >
                  Enter your new password to complete the reset process
                </Text>
              </VStack>
            </VStack>
          </Box>

          {/* Reset Form */}
          <Card
            w="full"
            borderRadius="2xl"
            borderWidth="2px"
            borderColor="border.primary"
            bg={cardBg}
            boxShadow="xl"
            overflow="hidden"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '2xl',
              background:
                'linear-gradient(135deg, rgba(0,194,255,0.05), rgba(0,209,143,0.05))',
              pointerEvents: 'none',
            }}
          >
            <CardBody
              p={{ base: 6, md: 8 }}
              position="relative"
              zIndex={1}
            >
              <VStack spacing={6}>
                <VStack spacing={3} textAlign="center">
                  <Box
                    p={4}
                    borderRadius="xl"
                    bg="neon.500"
                    color="white"
                    boxSize="60px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mx="auto"
                    boxShadow="0 8px 25px rgba(0,194,255,0.3)"
                  >
                    <Icon as={FaShieldAlt} boxSize={6} />
                  </Box>
                  <Heading size="md" color="text.primary">
                    Create New Password
                  </Heading>
                  <Text color="text.secondary" fontSize="sm">
                    Choose a strong password to secure your driver account
                  </Text>
                </VStack>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  <VStack spacing={5}>
                    {error && (
                      <Alert
                        status="error"
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor="red.400"
                      >
                        <AlertIcon />
                        {error}
                      </Alert>
                    )}

                    <FormControl isRequired>
                      <FormLabel
                        fontSize="md"
                        fontWeight="semibold"
                        color="text.primary"
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        <Icon as={FaLock} color="neon.400" />
                        New Password
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Enter your new password"
                          size="lg"
                          borderRadius="xl"
                          borderWidth="2px"
                          borderColor="border.primary"
                          bg="bg.surface"
                          _focus={{
                            borderColor: 'neon.400',
                            boxShadow: '0 0 0 1px rgba(0,194,255,0.2)',
                          }}
                          _hover={{
                            borderColor: 'neon.300',
                          }}
                          transition="all 0.2s"
                        />
                        <InputRightElement h="full" pr={4}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                      <Text fontSize="xs" color="text.tertiary" mt={2}>
                        Must be at least 8 characters with uppercase, lowercase, and numbers
                      </Text>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel
                        fontSize="md"
                        fontWeight="semibold"
                        color="text.primary"
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        <Icon as={FaLock} color="neon.400" />
                        Confirm New Password
                      </FormLabel>
                      <InputGroup>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                          size="lg"
                          borderRadius="xl"
                          borderWidth="2px"
                          borderColor="border.primary"
                          bg="bg.surface"
                          _focus={{
                            borderColor: 'neon.400',
                            boxShadow: '0 0 0 1px rgba(0,194,255,0.2)',
                          }}
                          _hover={{
                            borderColor: 'neon.300',
                          }}
                          transition="all 0.2s"
                        />
                        <InputRightElement h="full" pr={4}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <Button
                      type="submit"
                      size="lg"
                      w="full"
                      isLoading={isLoading}
                      loadingText="Resetting Password..."
                      bg="linear-gradient(135deg, #00C2FF, #00D18F)"
                      color="white"
                      borderRadius="xl"
                      py={7}
                      fontSize="lg"
                      fontWeight="bold"
                      _hover={{
                        bg: 'linear-gradient(135deg, #00D18F, #00C2FF)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,194,255,0.4)',
                      }}
                      _active={{
                        bg: 'linear-gradient(135deg, #00B8E6, #00C2FF)',
                      }}
                      transition="all 0.3s ease"
                      leftIcon={<FaShieldAlt />}
                    >
                      Reset Password
                    </Button>
                  </VStack>
                </form>

                <VStack spacing={3} w="full">
                  <Text
                    fontSize="sm"
                    color="text.tertiary"
                    textAlign="center"
                  >
                    Remember your password?{' '}
                    <ChakraLink
                      as={NextLink}
                      href="/driver-auth"
                      color="neon.400"
                      fontWeight="semibold"
                      _hover={{
                        textDecoration: 'underline',
                        color: 'neon.300',
                      }}
                    >
                      Back to Login
                    </ChakraLink>
                  </Text>
                  <Text
                    fontSize="sm"
                    color="text.tertiary"
                    textAlign="center"
                  >
                    Need help?{' '}
                    <ChakraLink
                      href="mailto:support@speedy-van.co.uk"
                      color="neon.400"
                      fontWeight="semibold"
                      _hover={{
                        textDecoration: 'underline',
                        color: 'neon.300',
                      }}
                    >
                      Contact Support
                    </ChakraLink>
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
