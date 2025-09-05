import React from 'react';
import { Metadata } from 'next';
import { Box, Container, VStack, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import AIAgentChatInterface from '@/components/AIAgent/AIAgentChatInterface';

export const metadata: Metadata = {
  title: 'محادثة AI Agent - Speedy Van',
  description: 'ابدأ محادثة مع المساعد الذكي واكتشف قدراته المتقدمة',
  keywords: 'AI Agent Chat, Speedy Van, محادثة المساعد الذكي',
  openGraph: {
    title: 'محادثة AI Agent - Speedy Van',
    description: 'ابدأ محادثة مع المساعد الذكي واكتشف قدراته المتقدمة',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function AIAgentChatPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color={textColor}>
              محادثة AI Agent
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="3xl">
              ابدأ محادثة مع المساعد الذكي واكتشف قدراته المتقدمة
            </Text>
            <Text fontSize="lg" color="gray.500">
              اسأل أي سؤال واحصل على إجابة ذكية وفورية
            </Text>
          </VStack>

          {/* Chat Interface */}
          <Box h="700px" borderRadius="xl" overflow="hidden" boxShadow="2xl">
            <AIAgentChatInterface mode="auto" />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
