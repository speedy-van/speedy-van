'use client';

import React from 'react';
import { Box, Container, HStack, Button, Heading } from '@chakra-ui/react';
import HeaderButton from '@/components/common/HeaderButton';

export const Header = () => (
  <Box as="header"
    position="sticky" 
    top="0" 
    zIndex="sticky"
    className="safe-area-top"
    h="64px"
    bg="rgba(13,13,13,0.95)" 
    backdropFilter="saturate(140%) blur(12px)"
    borderBottom="1px solid" 
    borderColor="border.neon"
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
    }}>
    <Container maxW="container.lg" h="full">
      <HStack h="full" justify="space-between">
        <img 
          src="/logo/speedy-van-logo-dark.svg" 
          alt="Speedy Van" 
          width="120" 
          height="40"
          style={{ height: '40px', width: 'auto' }}
        />
        <HStack>
          <HeaderButton href="#" label="Sign in" size="sm" />
          <HeaderButton href="/book" label="Get a quote" size="sm" />
        </HStack>
      </HStack>
    </Container>
  </Box>
);

// Footer component removed - using unified Footer from @/components/site/Footer

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100dvh" display="flex" flexDir="column" bg="bg.canvas">
      <Header />
      <Box as="main" 
        flex="1" 
        pb="env(safe-area-inset-bottom)"
        className="safe-area-bottom"
        bg="bg.canvas">
        {children}
      </Box>
      {/* Footer removed - using unified Footer from public layout */}
    </Box>
  );
}
