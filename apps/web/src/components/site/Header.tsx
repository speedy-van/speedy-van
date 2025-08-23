'use client';
import { Box, Container, HStack, Button, Heading } from "@chakra-ui/react";
import NextLink from "next/link";
import Sidebar from "@/components/site/Sidebar";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDisclosure, useToast } from "@chakra-ui/react";
import AuthModal from "@/components/auth/AuthModal";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import HeaderButton from "@/components/common/HeaderButton";

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
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
          quickLinks = 'Quick access: Driver Dashboard, Available Jobs, Earnings';
          quickActions = [
            { label: '🚗 Dashboard', href: '/driver/dashboard' },
            { label: '📦 Jobs', href: '/driver/jobs' },
            { label: '💰 Earnings', href: '/driver/earnings' }
          ];
          break;
        case 'admin':
          quickLinks = 'Quick access: Admin Dashboard, Orders, Analytics';
          quickActions = [
            { label: '🛠️ Admin', href: '/admin' },
            { label: '📋 Orders', href: '/admin/orders' },
            { label: '📈 Analytics', href: '/admin/analytics' }
          ];
          break;
        case 'customer':
        default:
          quickLinks = 'Quick access: My Orders, Book a van, Track orders';
          quickActions = [
            { label: '📋 My Orders', href: '/customer-portal' },
            { label: '🚚 Book Van', href: '/book' },
            { label: '📍 Track', href: '/track' }
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
      <Box as="header"
        data-glass="topbar"
        position="sticky" top="0" zIndex={20}
        bg="rgba(13,13,13,0.95)" backdropFilter="saturate(140%) blur(12px)"
        borderBottom="1px solid" borderColor="border.neon" h="64px"
        className="safe-area-top"
        sx={{
          // Prevent overlay from covering the whole page in prod
          '&[data-glass="topbar"]': {
            WebkitBackdropFilter: 'saturate(140%) blur(12px)',
            pointerEvents: 'auto'
          }
        }}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, rgba(0,194,255,0.1), rgba(0,209,143,0.1))',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <Container maxW="container.lg" h="full">
          <HStack justify="space-between" h="full">
            <HStack align="center" gap={2}>
              <Sidebar />
              <NextLink href="/">
                <img 
                  src="/logo/speedy-van-logo-dark.svg" 
                  alt="Speedy Van" 
                  width="120" 
                  height="40"
                  style={{ height: '40px', width: 'auto' }}
                />
              </NextLink>
            </HStack>

            {/* Desktop navigation */}
            <HStack as="nav" spacing={6} display={{ base: "none", md: "flex" }}>
              <HeaderButton href="/book" label="Book" />
              <HeaderButton href="/track" label="Track" />
              <NextLink href="/how-it-works">How it works</NextLink>
              
              <HeaderButton 
                href="/driver-application" 
                label="Become a Driver"
                ml={2}
              />
              <HeaderButton 
                href="/auth/login" 
                label="Driver Login"
                ml={2}
              />
            </HStack>

            {/* Desktop actions */}
            <HStack spacing={3} display={{ base: "none", md: "flex" }}>
              {session?.user ? (
                <UserAvatarMenu />
              ) : (
                <>
                  <HeaderButton href="#" label="Sign in" onClick={onOpen} />
                  <HeaderButton href="/book" label="Get a quote" ml={2} />
                </>
              )}
            </HStack>

            {/* Mobile actions - keep both CTAs visible */}
            <HStack spacing={2} display={{ base: "flex", md: "none" }}>
              <HeaderButton 
                href="/driver-application" 
                label="Become driver"
                size="sm"
              />
              <HeaderButton 
                href="/book" 
                label="Get a quote"
                size="sm"
                ml={1}
              />
            </HStack>
          </HStack>
        </Container>
      </Box>

      <AuthModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}


