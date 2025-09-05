'use client';

import { Box, Text, HStack, Button, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useSession } from 'next-auth/react';

export default function WelcomeBanner() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const bgColor = 'bg.surface.elevated';
  const borderColor = 'border.neon';

  if (!session?.user) {
    return null;
  }

  const { name, email, role } = user;
  const userName = name || email || 'there';

  const getRoleSpecificContent = () => {
    switch (role) {
      case 'driver':
        return {
          message: `Welcome back, ${userName}! Ready to find your next job?`,
          primaryAction: { label: '🚗 Dashboard', href: '/driver/dashboard' },
          secondaryAction: { label: '📦 View Jobs', href: '/driver/jobs' },
        };
      case 'admin':
        return {
          message: `Welcome back, ${userName}! Manage your operations efficiently.`,
          primaryAction: { label: '🛠️ Admin Panel', href: '/admin' },
          secondaryAction: { label: '📋 Orders', href: '/admin/orders' },
        };
      case 'customer':
      default:
        return {
          message: `Welcome back, ${userName}! How can we help you today?`,
          primaryAction: { label: '📋 My Orders', href: '/customer-portal' },
          secondaryAction: { label: '🚚 Book Van', href: '/book' },
        };
    }
  };

  const content = getRoleSpecificContent();

  return (
    <Box bg={bgColor} borderBottom="1px solid" borderColor={borderColor} py={4}>
      <Box maxW="6xl" mx="auto" px={4}>
        <HStack justify="space-between" align="center" spacing={4}>
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="semibold" color="text.primary">
              {content.message}
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              as={NextLink}
              href={content.primaryAction.href}
              size="md"
              variant="primary"
            >
              {content.primaryAction.label}
            </Button>
            <Button
              as={NextLink}
              href={content.secondaryAction.href}
              size="md"
              variant="secondary"
            >
              {content.secondaryAction.label}
            </Button>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
}
