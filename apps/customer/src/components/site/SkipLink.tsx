'use client';
import { Box } from '@chakra-ui/react';

export default function SkipLink() {
  return (
    <Box
      as="a"
      href="#main"
      position="absolute"
      left="-10000px"
      top="auto"
      bg="white"
      color="gray.800"
      px={3}
      py={2}
      borderRadius="md"
      boxShadow="sm"
      zIndex={9999}
      _focus={{
        left: '8px',
        top: '8px',
        outline: '2px solid',
        outlineColor: 'brand.500',
        outlineOffset: '2px',
      }}
      _dark={{
        bg: 'gray.800',
        color: 'white',
      }}
    >
      Skip to content
    </Box>
  );
}
