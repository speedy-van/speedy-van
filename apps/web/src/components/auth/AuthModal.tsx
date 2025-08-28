'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Divider,
  useToast,
  InputGroup,
  InputRightElement,
  Checkbox,
  FormErrorMessage,
  useDisclosure,
  Box,
} from '@chakra-ui/react';
import { SafeIconButton } from '@/components/common';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useRoleBasedRedirect } from '@/hooks/useRoleBasedRedirect';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  rememberMe: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}



export default function AuthModal({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) {
  const [tabIndex, setTabIndex] = useState(defaultTab === 'signup' ? 1 : 0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const initialRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { returnTo, handleAuthRedirect } = useAuthRedirect();
  const { userRole } = useRoleBasedRedirect();

  // Focus trap functionality
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Only allow closing if not loading
        if (!isLoading && !isOAuthLoading) {
          onClose();
        }
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLoading, isOAuthLoading]);



  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (session && isOpen) {
      onClose();
      
      // Let the useRoleBasedRedirect hook handle the redirect
      // This ensures consistent role-based routing across the app
      console.log('✅ Session established, closing modal and letting role-based redirect handle routing');
    }
  }, [session, isOpen, onClose]);

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: returnTo || '/',
      });

      if (result?.error) {
        toast({
          title: 'Sign in failed',
          description: 'Invalid email or password. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Show success toast
        toast({
          title: 'Welcome back!',
          description: 'You have been successfully signed in.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Close modal and let the useRoleBasedRedirect hook handle the redirect
        // This ensures consistent role-based routing and prevents race conditions
        onClose();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Sign in failed',
        description: 'An unexpected error occurred. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      // For now, we'll use the same credentials provider
      // In a real implementation, you'd have a separate signup API
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: 'Sign up failed',
          description: 'Unable to create account. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Account created!',
          description: 'Welcome to Speedy Van!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        handleAuthRedirect();
      }
    } catch (error) {
      toast({
        title: 'Sign up failed',
        description: 'An unexpected error occurred. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setIsOAuthLoading(true);
    try {
      // For OAuth, we'll let NextAuth handle the redirect
      // The callback will handle role-based redirects
      await signIn(provider, {
        callbackUrl: returnTo || '/',
        redirect: true,
      });
    } catch (error) {
      console.error(`${provider} OAuth sign in error:`, error);
      toast({
        title: 'OAuth sign in failed',
        description: `Unable to sign in with ${provider}. Please try again.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsOAuthLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onClose();
    router.push('/auth/forgot');
  };

  const handleDriverApply = () => {
    onClose();
    router.push('/driver/onboarding');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading || isOAuthLoading ? () => {} : onClose}
      initialFocusRef={initialRef}
      isCentered
      size="md"
      closeOnOverlayClick={!isLoading && !isOAuthLoading}
      closeOnEsc={!isLoading && !isOAuthLoading}
      trapFocus={true}
      returnFocusOnClose={true}
    >
      <ModalOverlay />
      <ModalContent ref={modalRef} role="dialog" aria-labelledby="auth-modal-title" aria-describedby="auth-modal-description">
        <ModalHeader id="auth-modal-title" textAlign="center">Welcome to Speedy Van</ModalHeader>
        <ModalCloseButton 
          aria-label="Close authentication modal" 
          isDisabled={isLoading || isOAuthLoading}
        />
        <ModalBody pb={6} id="auth-modal-description">
          <Tabs index={tabIndex} onChange={setTabIndex} variant="enclosed">
            <TabList>
              <Tab>Sign In</Tab>
              <Tab>Create Account</Tab>
            </TabList>

            <TabPanels>
              {/* Sign In Tab */}
              <TabPanel>
                <VStack spacing={4} as="form" onSubmit={signInForm.handleSubmit(handleSignIn)}>
                  <FormControl isInvalid={!!signInForm.formState.errors.email}>
                    <FormLabel htmlFor="signin-email">Email</FormLabel>
                    <Input
                      id="signin-email"
                      data-testid="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      aria-describedby={signInForm.formState.errors.email ? "signin-email-error" : undefined}
                      {...signInForm.register('email')}
                    />
                    <FormErrorMessage id="signin-email-error">
                      {signInForm.formState.errors.email?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!signInForm.formState.errors.password}>
                    <FormLabel htmlFor="signin-password">Password</FormLabel>
                    <InputGroup>
                      <Input
                        id="signin-password"
                        data-testid="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        aria-describedby={signInForm.formState.errors.password ? "signin-password-error" : undefined}
                        {...signInForm.register('password')}
                      />
                      <InputRightElement>
                                              <SafeIconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage id="signin-password-error">
                      {signInForm.formState.errors.password?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <HStack w="full" justify="space-between">
                    <Checkbox {...signInForm.register('rememberMe')}>
                      Remember me
                    </Checkbox>
                    <Button variant="link" size="sm" onClick={handleForgotPassword}>
                      Forgot password?
                    </Button>
                  </HStack>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                    disabled={isLoading || isOAuthLoading}
                  >
                    Continue
                  </Button>

                  <Divider />

                  <VStack spacing={3} w="full">
                    <Button
                      w="full"
                      variant="outline"
                      onClick={() => handleOAuthSignIn('google')}
                      isLoading={isOAuthLoading}
                      loadingText="Signing in with Google..."
                      disabled={isLoading || isOAuthLoading}
                    >
                      Continue with Google
                    </Button>
                    <Button
                      w="full"
                      variant="outline"
                      onClick={() => handleOAuthSignIn('apple')}
                      isLoading={isOAuthLoading}
                      loadingText="Signing in with Apple..."
                      disabled={isLoading || isOAuthLoading}
                    >
                      Continue with Apple
                    </Button>
                  </VStack>

                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Don't have an account?{' '}
                    <Button variant="link" size="sm" onClick={() => setTabIndex(1)}>
                      Create one
                    </Button>
                  </Text>

                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleDriverApply}
                    color="teal.500"
                  >
                    Want to drive for us? Apply here
                  </Button>
                </VStack>
              </TabPanel>

              {/* Sign Up Tab */}
              <TabPanel>
                <VStack spacing={4} as="form" onSubmit={signUpForm.handleSubmit(handleSignUp)}>
                  <FormControl isInvalid={!!signUpForm.formState.errors.name}>
                    <FormLabel htmlFor="signup-name">Full Name</FormLabel>
                    <Input
                      id="signup-name"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      aria-describedby={signUpForm.formState.errors.name ? "signup-name-error" : undefined}
                      {...signUpForm.register('name')}
                    />
                    <FormErrorMessage id="signup-name-error">
                      {signUpForm.formState.errors.name?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!signUpForm.formState.errors.email}>
                    <FormLabel htmlFor="signup-email">Email</FormLabel>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      aria-describedby={signUpForm.formState.errors.email ? "signup-email-error" : undefined}
                      {...signUpForm.register('email')}
                    />
                    <FormErrorMessage id="signup-email-error">
                      {signUpForm.formState.errors.email?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!signUpForm.formState.errors.password}>
                    <FormLabel htmlFor="signup-password">Password</FormLabel>
                    <InputGroup>
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        aria-describedby={signUpForm.formState.errors.password ? "signup-password-error" : undefined}
                        {...signUpForm.register('password')}
                      />
                      <InputRightElement>
                        <SafeIconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          type="button"
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage id="signup-password-error">
                      {signUpForm.formState.errors.password?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!signUpForm.formState.errors.confirmPassword}>
                    <FormLabel htmlFor="signup-confirm-password">Confirm Password</FormLabel>
                    <InputGroup>
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        aria-describedby={signUpForm.formState.errors.confirmPassword ? "signup-confirm-password-error" : undefined}
                        {...signUpForm.register('confirmPassword')}
                      />
                      <InputRightElement>
                        <SafeIconButton
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          type="button"
                        />
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage id="signup-confirm-password-error">
                      {signUpForm.formState.errors.confirmPassword?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <HStack w="full" justify="flex-start">
                    <Checkbox {...signUpForm.register('rememberMe')}>
                      Remember me
                    </Checkbox>
                  </HStack>

                  <Button
                    type="submit"
                    colorScheme="teal"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Creating account..."
                    disabled={isLoading || isOAuthLoading}
                  >
                    Create Account
                  </Button>

                  <Divider />

                  <VStack spacing={3} w="full">
                    <Button
                      w="full"
                      variant="outline"
                      onClick={() => handleOAuthSignIn('google')}
                      isLoading={isOAuthLoading}
                      loadingText="Signing up with Google..."
                      disabled={isLoading || isOAuthLoading}
                    >
                      Continue with Google
                    </Button>
                    <Button
                      w="full"
                      variant="outline"
                      onClick={() => handleOAuthSignIn('apple')}
                      isLoading={isOAuthLoading}
                      loadingText="Signing up with Apple..."
                      disabled={isLoading || isOAuthLoading}
                    >
                      Continue with Apple
                    </Button>
                  </VStack>

                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Already have an account?{' '}
                    <Button variant="link" size="sm" onClick={() => setTabIndex(0)}>
                      Sign in
                    </Button>
                  </Text>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
