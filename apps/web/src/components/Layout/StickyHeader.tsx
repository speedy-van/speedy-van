'use client';

import React from 'react';
import { Box, Container, HStack, Heading, Button } from '@chakra-ui/react';
import HeaderButton from '@/components/common/HeaderButton';

interface StickyHeaderProps {
  title?: string;
  onSignIn?: () => void;
  onGetQuote?: () => void;
  className?: string;
}

export default function StickyHeader({
  title = "Speedy Van",
  onSignIn,
  onGetQuote,
  className = ''
}: StickyHeaderProps) {
  const bgColor = 'rgba(13, 13, 13, 0.95)';
  const borderColor = 'border.neon';
  const textColor = 'text.primary';

  return (
    <Box
      as="header"
      className={`sticky-header ${className}`}
      position="sticky"
      top="0"
      zIndex="sticky"
      bg={bgColor}
      backdropFilter="saturate(140%) blur(12px)"
      borderBottom="1px solid"
      borderColor={borderColor}
      transition="all 0.2s ease"
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
      <Container maxW="container.lg" py="2">
        <HStack justify="space-between" align="center">
          <img 
            src="/logo/speedy-van-logo-dark.svg" 
            alt="Speedy Van" 
            width="120" 
            height="40"
            style={{ height: '40px', width: 'auto' }}
          />
          
          <HStack spacing="3">
            <HeaderButton
              href="#"
              label="Sign In"
              onClick={onSignIn}
              minH="44px"
              minW="44px"
              className="mobile-button"
            />
            <HeaderButton
              href="/book"
              label="Get a Quote"
              onClick={onGetQuote}
              minH="44px"
              minW="44px"
              className="mobile-button"
            />
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}
