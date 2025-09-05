'use client';

import React from 'react';
import { Box, Container, VStack, Heading, Text, SimpleGrid, Icon, useColorModeValue } from '@chakra-ui/react';
import { FiUsers, FiCode, FiZap, FiShield, FiTrendingUp } from 'react-icons/fi';
import AIAgentChatInterface from '@/components/AIAgent/AIAgentChatInterface';
import AIAgentDashboard from '@/components/AIAgent/AIAgentDashboard';
import AIAgentStats from '@/components/AIAgent/AIAgentStats';

// Metadata removed - cannot use with 'use client'

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      p={6}
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      textAlign="center"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'lg',
        borderColor: color,
      }}
    >
      <Icon as={icon} w={10} h={10} color={color} mb={4} />
      <Heading size="md" mb={3}>
        {title}
      </Heading>
      <Text color="gray.600" fontSize="sm">
        {description}
      </Text>
    </Box>
  );
};

export default function AIAgentPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  const features = [
    {
      icon: FiCode,
      title: 'ذكاء اصطناعي متقدم',
      description: 'تقنيات DeepSeek AI مع RAG للردود الذكية والدقيقة',
      color: 'blue.500',
    },
    {
      icon: FiUsers,
      title: 'خدمة عملاء ذكية',
      description: 'مساعد ذكي للعملاء مع دعم متعدد اللغات',
      color: 'green.500',
    },
    {
      icon: FiCode,
      title: 'أدوات تطوير متقدمة',
      description: 'مساعد للمطورين مع تحليل الكود وإدارة الملفات',
      color: 'purple.500',
    },
    {
      icon: FiZap,
      title: 'أداء عالي',
      description: 'معالجة سريعة مع تحسين الأداء والكفاءة',
      color: 'orange.500',
    },
    {
      icon: FiShield,
      title: 'أمان متقدم',
      description: 'حماية شاملة للبيانات والمحادثات',
      color: 'red.500',
    },
    {
      icon: FiTrendingUp,
      title: 'تعلم مستمر',
      description: 'تحسين مستمر للأداء والدقة',
      color: 'teal.500',
    },
  ];

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section */}
      <Box
        bg="linear-gradient(135deg, blue.500 0%, purple.600 100%)"
        color="white"
        py={20}
        textAlign="center"
      >
        <Container maxW="container.xl">
          <VStack spacing={8}>
            <Heading size="2xl" fontWeight="bold">
              Speedy Van AI Agent
            </Heading>
            <Text fontSize="xl" maxW="2xl" opacity={0.9}>
              مساعد ذكي متقدم يجمع بين خدمة العملاء المتميزة وأدوات التطوير المتقدمة
            </Text>
            <Text fontSize="lg" opacity={0.8}>
              مدعوم بتقنيات الذكاء الاصطناعي المتقدمة لخدمة أفضل
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={16}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color={textColor}>
              الميزات المتقدمة
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              اكتشف القوة الحقيقية للذكاء الاصطناعي في خدمة العملاء والتطوير
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* AI Agent Interface Section */}
      <Container maxW="container.xl" py={16}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color={textColor}>
              جرب المساعد الذكي
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              ابدأ محادثة مع AI Agent واكتشف قدراته المتقدمة
            </Text>
          </VStack>

          <Box w="full" h="600px" borderRadius="xl" overflow="hidden" boxShadow="2xl">
            <AIAgentChatInterface mode="auto" />
          </Box>
        </VStack>
      </Container>

      {/* Stats Section */}
      <Box bg="white" py={16} _dark={{ bg: 'gray.800' }}>
        <Container maxW="container.xl">
          <AIAgentStats />
        </Container>
      </Box>

      {/* Dashboard Section */}
      <Container maxW="container.xl" py={16}>
        <VStack spacing={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color={textColor}>
              لوحة التحكم المتقدمة
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              مراقبة شاملة لأداء AI Agent والإحصائيات المتقدمة
            </Text>
          </VStack>

          <AIAgentDashboard />
        </VStack>
      </Container>
    </Box>
  );
}
