'use client';
import {
  Box,
  Container,
  HStack,
  Button,
  Heading,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import Sidebar from '@/components/site/Sidebar';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import AuthModal from '@/components/auth/AuthModal';
import UserAvatarMenu from '@/components/UserAvatarMenu';
import HeaderButton from '@/components/common/HeaderButton';

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const toast = useToast();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Auto-open auth modal when redirected from protected route
  useEffect(() => {
    const showAuth = searchParams.get('showAuth');
    if (showAuth === 'true' && !session?.user) {
      onOpen();
    }
  }, [searchParams, session, onOpen]);

  // Show role-aware welcome message and handle redirects after successful authentication
  useEffect(() => {
    if (session?.user && !hasShownWelcome) {
      const user = session.user as any;
      const { name, email, role } = user;
      const userName = name || email || 'there';

      // Check if we need to redirect based on role and current location
      const currentPath = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const returnTo = searchParams.get('returnTo');

      // If we're on the home page and there's no returnTo, redirect based on role
      if (currentPath === '/' && !returnTo) {
        let redirectUrl = '/';

        switch (role) {
          case 'customer':
            redirectUrl = '/customer-portal';
            break;
          case 'driver':
            redirectUrl = '/driver/dashboard';
            break;
          case 'admin':
            redirectUrl = '/admin';
            break;
          default:
            redirectUrl = '/';
        }

        // Only redirect if it's different from current path
        if (redirectUrl !== currentPath) {
          // Small delay to ensure session is fully established
          setTimeout(() => {
            router.push(redirectUrl);
          }, 100);
        }
      }

      // Role-aware welcome message with quick links
      let welcomeMessage = `Welcome back, ${userName}!`;
      let quickLinks = '';
      let quickActions = [];

      switch (role) {
        case 'driver':
          quickLinks =
            'Quick access: Driver Dashboard, Available Jobs, Earnings';
          quickActions = [
            { label: '🚗 Dashboard', href: '/driver/dashboard' },
            { label: '📦 Jobs', href: '/driver/jobs' },
            { label: '💰 Earnings', href: '/driver/earnings' },
          ];
          break;
        case 'admin':
          quickLinks = 'Quick access: Admin Dashboard, Orders, Analytics';
          quickActions = [
            { label: '🛠️ Admin', href: '/admin' },
            { label: '📋 Orders', href: '/admin/orders' },
            { label: '📈 Analytics', href: '/admin/analytics' },
          ];
          break;
        case 'customer':
        default:
          quickLinks = 'Quick access: My Orders, Book a van, Track orders';
          quickActions = [
            { label: '📋 My Orders', href: '/customer-portal' },
            { label: '🚚 Book Van', href: '/book' },
            { label: '📍 Track', href: '/track' },
          ];
          break;
      }

      toast({
        title: welcomeMessage,
        description: quickLinks,
        status: 'success',
        duration: 6000,
        isClosable: true,
        position: 'top-right',
      });

      setHasShownWelcome(true);
    }
  }, [session, hasShownWelcome, toast, router]);

  return (
    <>
      <Box
        as="header"
        data-glass="topbar"
        position="sticky"
        top="0"
        zIndex={20}
        bg="rgba(13,13,13,0.95)"
        backdropFilter="saturate(140%) blur(12px)"
        borderBottom="1px solid"
        borderColor="border.neon"
        h={{ base: '60px', md: '64px' }}
        className="safe-area-top"
        sx={{
          // Prevent overlay from covering the whole page in prod
          '&[data-glass="topbar"]': {
            WebkitBackdropFilter: 'saturate(140%) blur(12px)',
            pointerEvents: 'auto',
          },
        }}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(90deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <Container maxW="container.lg" h="full" px={{ base: 3, md: 6 }}>
          <HStack justify="space-between" h="full" spacing={{ base: 1, md: 4 }}>
            <HStack align="center" gap={{ base: 2, md: 4 }} flex="0 0 auto">
              {/* Logo - Mobile optimized */}
              <NextLink href="/">
                <Box
                  p={1}
                  borderRadius="lg"
                  transition="all 0.3s ease-in-out"
                  _hover={{
                    transform: 'scale(1.05)',
                    filter: 'drop-shadow(0 0 20px rgba(0,194,255,0.6))',
                  }}
                  ml={{ base: -2, md: -4 }}
                  position="relative"
                  left={{ base: '-8px', md: '-16px' }}
                >
                  <img
                    src="/logo/speedy-van-logo-dark.svg"
                    alt="Speedy Van"
                    width="140"
                    height="49"
                    style={{
                      display: 'block',
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '140px',
                      maxHeight: '49px',
                    }}
                  />
                </Box>
              </NextLink>

              {/* Sidebar - Hidden on mobile to save space */}
              <Box display={{ base: 'none', md: 'block' }}>
                <Sidebar />
              </Box>
            </HStack>

            {/* Desktop navigation */}
            <HStack as="nav" spacing={6} display={{ base: 'none', md: 'flex' }}>
              <HeaderButton href="/track" label="Track" />
              <HeaderButton href="/how-it-works" label="How it works" />
              <HeaderButton href="/pricing" label="Pricing" />
              <HeaderButton href="/ai-agent" label="AI Assistant" />

              <HeaderButton
                href="/driver-application"
                label="Become a Driver"
                ml={2}
              />
              <HeaderButton href="/auth/login" label="Driver Login" ml={2} />
            </HStack>

            {/* Desktop actions */}
            <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
              {session?.user ? (
                <UserAvatarMenu />
              ) : (
                <>
                  <HeaderButton href="#" label="Sign in" onClick={onOpen} />
                  <HeaderButton href="/book" label="Get a quote" ml={2} />
                </>
              )}
            </HStack>

            {/* Mobile actions - optimized for touch */}
            <HStack
              spacing={3}
              display={{ base: 'flex', md: 'none' }}
              align="center"
              flexShrink={0}
            >
              <HeaderButton
                href="/book"
                label="Get a quote"
                size="lg"
                px={8}
                py={6}
                fontSize="md"
                fontWeight="bold"
                minH="48px"
                maxW="190px"
                borderRadius="2xl"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 194, 255, 0.4)',
                }}
                _active={{
                  transform: 'translateY(0px)',
                  boxShadow: '0 4px 15px rgba(0, 194, 255, 0.3)',
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              />
              <IconButton
                aria-label="Open navigation menu"
                icon={<FiMenu size={20} />}
                variant="ghost"
                color="white"
                size="lg"
                minW="44px"
                minH="44px"
                onClick={onDrawerOpen}
                _hover={{
                  bg: 'rgba(0,194,255,0.15)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0, 194, 255, 0.2)',
                }}
                _active={{
                  bg: 'rgba(0,194,255,0.25)',
                  transform: 'scale(0.95)',
                }}
                borderRadius="xl"
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.1)"
              />
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        placement="right"
        onClose={onDrawerClose}
        size="full"
      >
        <DrawerOverlay
          bg="rgba(0,0,0,0.7)"
          backdropFilter="blur(4px)"
          onClick={onDrawerClose}
        />
        <DrawerContent
          bg="dark.900"
          borderLeft="1px solid"
          borderColor="border.neon"
          position="relative"
        >
          <DrawerHeader
            borderBottom="1px solid"
            borderColor="border.neon"
            bg="dark.800"
            pt={6}
            pb={4}
            px={6}
            position="relative"
          >
            {/* Swipe indicator */}
            <Box
              position="absolute"
              top={3}
              left="50%"
              transform="translateX(-50%)"
              w="40px"
              h="4px"
              bg="gray.600"
              borderRadius="full"
              opacity={0.6}
            />

            {/* Small X button opposite to the text */}
            <IconButton
              aria-label="Close menu"
              icon={
                <Box as="span" fontSize="12px" fontWeight="bold">
                  ×
                </Box>
              }
              size="xs"
              position="absolute"
              top={4}
              sx={{ right: '16px' }}
              bg="transparent"
              color="gray.400"
              borderRadius="full"
              w="20px"
              h="20px"
              minW="20px"
              minH="20px"
              onClick={onDrawerClose}
              _hover={{
                bg: 'rgba(255,255,255,0.1)',
                color: 'white',
                transform: 'scale(1.1)',
              }}
              _active={{
                bg: 'rgba(255,255,255,0.2)',
                transform: 'scale(0.95)',
              }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              zIndex={5}
            />

            <Heading size="lg" color="neon.500" fontWeight="bold">
              Menu
            </Heading>
            <Text color="gray.400" fontSize="sm" mt={1}>
              Navigate through Speedy Van
            </Text>
          </DrawerHeader>
          <DrawerBody pt={6} px={4} position="relative">
            <VStack spacing={6} align="stretch" h="full">
              {/* Main Navigation Links */}
              <VStack spacing={3} align="stretch">
                <Text
                  color="neon.400"
                  fontSize="sm"
                  fontWeight="semibold"
                  px={2}
                >
                  Main Navigation
                </Text>
                <HeaderButton
                  href="/"
                  label="Home"
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  minH="48px"
                  px={4}
                  borderRadius="lg"
                  onClick={onDrawerClose}
                  _hover={{ bg: 'rgba(0,194,255,0.1)' }}
                />
                <HeaderButton
                  href="/track"
                  label="Track Your Move"
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  minH="48px"
                  px={4}
                  borderRadius="lg"
                  onClick={onDrawerClose}
                  _hover={{ bg: 'rgba(0,194,255,0.1)' }}
                />
                <HeaderButton
                  href="/how-it-works"
                  label="How It Works"
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  minH="48px"
                  px={4}
                  borderRadius="lg"
                  onClick={onDrawerClose}
                  _hover={{ bg: 'rgba(0,255,0,0.1)' }}
                />
                <HeaderButton
                  href="/pricing"
                  label="Pricing"
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  minH="48px"
                  px={4}
                  borderRadius="lg"
                  onClick={onDrawerClose}
                  _hover={{ bg: 'rgba(0,194,255,0.1)' }}
                />

                <HeaderButton
                  href="tel:07901846297"
                  label="Contact Us"
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  minH="48px"
                  px={4}
                  borderRadius="lg"
                  onClick={onDrawerClose}
                  _hover={{ bg: 'rgba(0,194,255,0.1)' }}
                  leftIcon={
                    <Box as="span" fontSize="16px">
                      📞
                    </Box>
                  }
                />
              </VStack>

              {/* Driver Section */}
              <VStack spacing={3} align="stretch">
                <Text
                  color="neon.400"
                  fontSize="sm"
                  fontWeight="semibold"
                  px={2}
                >
                  For Drivers
                </Text>
                <HeaderButton
                  href="/driver-application"
                  label="Become a Driver"
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  minH="48px"
                  px={4}
                  borderRadius="lg"
                  onClick={onDrawerClose}
                  _hover={{ bg: 'rgba(0,194,255,0.1)' }}
                />
                <HeaderButton
                  href="/auth/login"
                  label="Driver Login"
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  minH="48px"
                  px={4}
                  borderRadius="lg"
                  onClick={onDrawerClose}
                  _hover={{ bg: 'rgba(0,194,255,0.1)' }}
                />
              </VStack>

              {/* User Actions */}
              <VStack spacing={3} align="stretch">
                <Text
                  color="neon.400"
                  fontSize="sm"
                  fontWeight="semibold"
                  px={2}
                >
                  Account
                </Text>
                {session?.user ? (
                  <Box px={2}>
                    <UserAvatarMenu />
                  </Box>
                ) : (
                  <VStack spacing={3} align="stretch">
                    <HeaderButton
                      href="#"
                      label="Sign In"
                      variant="outline"
                      justifyContent="flex-start"
                      size="lg"
                      minH="48px"
                      px={4}
                      borderRadius="lg"
                      onClick={() => {
                        onDrawerClose();
                        onOpen();
                      }}
                      _hover={{ bg: 'rgba(0,194,255,0.1)' }}
                    />
                    <HeaderButton
                      href="/book"
                      label="Get a Quote"
                      variant="primary"
                      justifyContent="flex-start"
                      size="lg"
                      minH="48px"
                      px={4}
                      borderRadius="lg"
                      onClick={onDrawerClose}
                      _hover={{
                        transform: 'translateY(-1px)',
                        boxShadow: 'lg',
                      }}
                    />
                  </VStack>
                )}
              </VStack>

              {/* Bottom Close Button */}
              <Box mt="auto" pt={6} pb={4}>
                <Button
                  onClick={onDrawerClose}
                  variant="ghost"
                  color="gray.400"
                  size="lg"
                  w="full"
                  minH="48px"
                  borderRadius="lg"
                  _hover={{
                    bg: 'rgba(255,255,255,0.05)',
                    color: 'white',
                  }}
                  _active={{
                    bg: 'rgba(255,255,255,0.1)',
                  }}
                  transition="all 0.2s ease"
                >
                  Close Menu
                </Button>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <AuthModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
