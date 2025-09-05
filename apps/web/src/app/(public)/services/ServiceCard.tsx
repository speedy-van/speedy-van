'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { Truck, Users, Home, Package, Clock, Building } from 'lucide-react';
import Link from 'next/link';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    iconName: string;
    price: string;
    features: string[];
    popular: boolean;
    href: string;
  };
}

const iconMap = {
  Truck,
  Users,
  Home,
  Package,
  Clock,
  Building,
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const IconComponent =
    iconMap[service.iconName as keyof typeof iconMap] || Truck;

  return (
    <Box
      as={Link}
      href={service.href}
      bg="white"
      p={8}
      borderRadius="xl"
      shadow="lg"
      border="1px solid"
      borderColor="gray.100"
      position="relative"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'xl',
        borderColor: 'blue.200',
      }}
    >
      {service.popular && (
        <Box
          position="absolute"
          top={4}
          sx={{ right: '16px' }}
        >
          <Badge
            colorScheme="blue"
            variant="solid"
            borderRadius="full"
            px={3}
            py={1}
          >
            Popular
          </Badge>
        </Box>
      )}

      <VStack align="start" spacing={4}>
        <HStack spacing={3}>
          <Icon as={IconComponent} boxSize={8} color="blue.500" />
          <VStack align="start" spacing={1}>
            <Heading as="h3" size="md" color="gray.800">
              {service.title}
            </Heading>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              {service.price}
            </Text>
          </VStack>
        </HStack>

        <Text color="gray.600" lineHeight="tall">
          {service.description}
        </Text>

        <VStack align="start" spacing={2} w="full">
          {service.features.map((feature, index) => (
            <HStack key={index} spacing={2}>
              <Box w={2} h={2} bg="green.400" borderRadius="full" />
              <Text fontSize="sm" color="gray.600">
                {feature}
              </Text>
            </HStack>
          ))}
        </VStack>

        <HStack spacing={2} color="blue.600" fontWeight="medium" mt={4}>
          <Text>Learn More</Text>
          <Box as="span" fontSize="sm">
            →
          </Box>
        </HStack>
      </VStack>
    </Box>
  );
}
