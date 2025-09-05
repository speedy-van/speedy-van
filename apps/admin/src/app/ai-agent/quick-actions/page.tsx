import React from 'react';
import { Metadata } from 'next';
import { Box, Container, VStack, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import AIAgentQuickActions from '@/components/AIAgent/AIAgentQuickActions';

export const metadata: Metadata = {
  title: 'الإجراءات السريعة - Speedy Van AI Agent',
  description: 'وصول سريع لأهم الميزات والوظائف',
  keywords: 'AI Agent Quick Actions, Speedy Van, الإجراءات السريعة',
  openGraph: {
    title: 'الإجراءات السريعة - Speedy Van AI Agent',
    description: 'وصول سريع لأهم الميزات والوظائف',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function AIAgentQuickActionsPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color={textColor}>
              الإجراءات السريعة
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="3xl">
              وصول سريع لأهم الميزات والوظائف
            </Text>
            <Text fontSize="lg" color="gray.500">
              انقر على أي إجراء لتنفيذه فوراً
            </Text>
          </VStack>

          {/* Quick Actions Component */}
          <AIAgentQuickActions />
        </VStack>
      </Container>
    </Box>
  );
}
