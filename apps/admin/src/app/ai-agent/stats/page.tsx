import React from 'react';
import { Metadata } from 'next';
import { Box, Container, VStack, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import AIAgentStats from '@/components/AIAgent/AIAgentStats';

export const metadata: Metadata = {
  title: 'إحصائيات AI Agent - Speedy Van',
  description: 'نظرة سريعة على أداء المساعد الذكي والمؤشرات الرئيسية',
  keywords: 'AI Agent Stats, Speedy Van, الإحصائيات',
  openGraph: {
    title: 'إحصائيات AI Agent - Speedy Van',
    description: 'نظرة سريعة على أداء المساعد الذكي والمؤشرات الرئيسية',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function AIAgentStatsPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color={textColor}>
              إحصائيات AI Agent
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="3xl">
              نظرة سريعة على أداء المساعد الذكي والمؤشرات الرئيسية
            </Text>
            <Text fontSize="lg" color="gray.500">
              مراقبة الأداء والاستخدام في الوقت الفعلي
            </Text>
          </VStack>

          {/* Stats Component */}
          <AIAgentStats />
        </VStack>
      </Container>
    </Box>
  );
}
