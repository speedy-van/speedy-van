import React from 'react';
import { Metadata } from 'next';
import { Box, Container, VStack, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import AIAgentSettings from '@/components/AIAgent/AIAgentSettings';

export const metadata: Metadata = {
  title: 'إعدادات AI Agent - Speedy Van',
  description: 'تخصيص وإدارة إعدادات المساعد الذكي المتقدمة',
  keywords: 'AI Agent Settings, Speedy Van, إعدادات المساعد الذكي',
  openGraph: {
    title: 'إعدادات AI Agent - Speedy Van',
    description: 'تخصيص وإدارة إعدادات المساعد الذكي المتقدمة',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function AIAgentSettingsPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color={textColor}>
              إعدادات AI Agent
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="3xl">
              تخصيص وإدارة إعدادات المساعد الذكي المتقدمة
            </Text>
            <Text fontSize="lg" color="gray.500">
              اضبط جميع جوانب AI Agent لتناسب احتياجاتك
            </Text>
          </VStack>

          {/* Settings Component */}
          <AIAgentSettings />
        </VStack>
      </Container>
    </Box>
  );
}
