'use client';
import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import {
  FiUsers,
  FiSettings,
  FiShield,
  FiFileText,
  FiArrowRight,
} from 'react-icons/fi';

interface SettingsCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

function SettingsCard({ title, description, href, icon, badge }: SettingsCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <NextLink href={href}>
      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        _hover={{
          bg: hoverBg,
          borderColor: 'brand.500',
          transform: 'translateY(-2px)',
        }}
        transition="all 0.2s"
        cursor="pointer"
        h="full"
      >
        <CardBody>
          <VStack align="start" spacing={4}>
            <HStack justify="space-between" w="full">
              <Icon as={icon} boxSize={6} color="brand.500" />
              {badge && (
                <Badge colorScheme="blue" variant="subtle">
                  {badge}
                </Badge>
              )}
            </HStack>
            <Box flex={1}>
              <Heading size="md" mb={2}>
                {title}
              </Heading>
              <Text color="gray.600" fontSize="sm">
                {description}
              </Text>
            </Box>
            <HStack w="full" justify="end">
              <Icon as={FiArrowRight} boxSize={4} color="gray.400" />
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </NextLink>
  );
}

export default function AdminSettings() {
  const settingsCards: SettingsCardProps[] = [
    {
      title: 'Team & Roles',
      description: 'Manage admin users, roles, and permissions. Control who can access what features.',
      href: '/admin/settings/team',
      icon: FiUsers,
      badge: 'RBAC',
    },
    {
      title: 'Integrations',
      description: 'Configure Stripe, Pusher, Maps API, email providers, and webhooks.',
      href: '/admin/settings/integrations',
      icon: FiSettings,
      badge: 'API Keys',
    },
    {
      title: 'Security',
      description: '2FA settings, SSO configuration, session timeouts, and IP allowlists.',
      href: '/admin/settings/security',
      icon: FiShield,
      badge: 'Critical',
    },
    {
      title: 'Legal & Compliance',
      description: 'Company information, VAT settings, privacy policies, and cookie configuration.',
      href: '/admin/settings/legal',
      icon: FiFileText,
      badge: 'GDPR',
    },
  ];

  return (
    <Box p={6}>
      <VStack align="start" spacing={6} w="full">
        <Box>
          <Heading size="lg" mb={2}>
            Settings
          </Heading>
          <Text color="gray.600">
            Manage your admin team, integrations, security settings, and legal compliance.
          </Text>
        </Box>

        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(2, 1fr)' }}
          gap={6}
          w="full"
        >
          {settingsCards.map((card) => (
            <SettingsCard key={card.href} {...card} />
          ))}
        </Grid>
      </VStack>
    </Box>
  );
}


