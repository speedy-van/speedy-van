'use client';

import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Badge,
} from '@chakra-ui/react';
import {
  FiMessageSquare,
  FiZap,
  FiSettings,
  FiUsers,
  FiCode,
  FiTrendingUp,
} from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Metadata removed - cannot use with 'use client'

interface NavigationItem {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'المحادثة',
    description: 'ابدأ محادثة مع المساعد الذكي',
    href: '/ai-agent/chat',
    icon: FiMessageSquare,
    color: 'blue',
  },
  {
    title: 'لوحة التحكم',
    description: 'مراقبة شاملة للأداء والإحصائيات',
    href: '/ai-agent/dashboard',
    icon: FiCode,
    color: 'green',
  },
  {
    title: 'الإحصائيات',
    description: 'نظرة سريعة على المؤشرات الرئيسية',
    href: '/ai-agent/stats',
    icon: FiTrendingUp,
    color: 'purple',
  },
  {
    title: 'الإجراءات السريعة',
    description: 'وصول سريع لأهم الميزات',
    href: '/ai-agent/quick-actions',
    icon: FiZap,
    color: 'orange',
  },
  {
    title: 'الإعدادات',
    description: 'تخصيص وإدارة الإعدادات المتقدمة',
    href: '/ai-agent/settings',
    icon: FiSettings,
    color: 'red',
  },
];

export default function AIAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Header */}
      <Box bg={bgColor} borderBottom="1px solid" borderColor={borderColor} py={6}>
        <Container maxW="container.xl">
          <VStack spacing={6}>
            {/* Main Header */}
            <VStack spacing={4} textAlign="center">
                             <HStack spacing={3}>
                 <Icon as={FiCode} w={10} h={10} color={accentColor} />
                 <Heading size="xl" color={textColor}>
                   Speedy Van AI Agent
                 </Heading>
               </HStack>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                مساعد ذكي متقدم يجمع بين خدمة العملاء وأدوات التطوير المتقدمة
              </Text>
            </VStack>

            {/* Navigation Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <Box
                    p={6}
                    bg={bgColor}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    cursor="pointer"
                    transition="all 0.3s"
                    _hover={{
                      transform: 'translateY(-4px)',
                      boxShadow: 'xl',
                      borderColor: `${item.color}.500`,
                    }}
                    textAlign="center"
                  >
                    <VStack spacing={4}>
                      <Icon
                        as={item.icon}
                        w={12}
                        h={12}
                        color={`${item.color}.500`}
                      />
                      <VStack spacing={2}>
                        <Heading size="md" color={textColor}>
                          {item.title}
                        </Heading>
                        <Text fontSize="sm" color="gray.500" lineHeight="1.4">
                          {item.description}
                        </Text>
                      </VStack>
                      {item.badge && (
                        <Badge colorScheme={item.color} variant="subtle">
                          {item.badge}
                        </Badge>
                      )}
                    </VStack>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>

            {/* Back to Main */}
            <Box>
              <Link href="/ai-agent" style={{ textDecoration: 'none' }}>
                               <Button
                 leftIcon={<FiCode />}
                 colorScheme="blue"
                 variant="outline"
                 size="lg"
               >
                 العودة للصفحة الرئيسية
               </Button>
              </Link>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Box py={8}>
        {children}
      </Box>
    </Box>
  );
}
