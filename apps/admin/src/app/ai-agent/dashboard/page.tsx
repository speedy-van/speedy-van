import React from 'react';
import { Metadata } from 'next';
import { Box, Container, VStack, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import AIAgentDashboard from '@/components/AIAgent/AIAgentDashboard';

export const metadata: Metadata = {
  title: 'لوحة تحكم AI Agent - Speedy Van',
  description: 'مراقبة شاملة لأداء المساعد الذكي والإحصائيات المتقدمة',
  keywords: 'AI Agent Dashboard, Speedy Van, لوحة التحكم',
  openGraph: {
    title: 'لوحة تحكم AI Agent - Speedy Van',
    description: 'مراقبة شاملة لأداء المساعد الذكي والإحصائيات المتقدمة',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function AIAgentDashboardPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color={textColor}>
              لوحة تحكم AI Agent
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="3xl">
              مراقبة شاملة لأداء المساعد الذكي والإحصائيات المتقدمة
            </Text>
            <Text fontSize="lg" color="gray.500">
              تتبع الأداء والاستخدام في الوقت الفعلي
            </Text>
          </VStack>

          {/* Dashboard Component */}
          <AIAgentDashboard />
        </VStack>
      </Container>
    </Box>
  );
}
