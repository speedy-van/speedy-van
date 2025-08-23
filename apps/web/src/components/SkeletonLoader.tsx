'use client';

import { Box, Skeleton, VStack, HStack, Grid, GridItem } from '@chakra-ui/react';

interface SkeletonLoaderProps {
  type: 'orders' | 'dashboard' | 'track' | 'invoices' | 'settings';
  count?: number;
}

export function SkeletonLoader({ type, count = 3 }: SkeletonLoaderProps) {
  const renderOrdersSkeleton = () => (
    <VStack spacing={4} align="stretch" w="full">
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          border="1px"
          borderColor="gray.200"
          borderRadius="lg"
          p={4}
          data-testid="orders-skeleton"
        >
          <HStack justify="space-between" mb={3}>
            <Skeleton height="20px" width="120px" />
            <Skeleton height="16px" width="80px" />
          </HStack>
          <VStack align="stretch" spacing={2}>
            <Skeleton height="16px" width="60%" />
            <Skeleton height="16px" width="40%" />
            <HStack justify="space-between">
              <Skeleton height="16px" width="100px" />
              <Skeleton height="16px" width="80px" />
            </HStack>
          </VStack>
        </Box>
      ))}
    </VStack>
  );

  const renderDashboardSkeleton = () => (
    <VStack spacing={6} align="stretch" w="full">
      {/* Welcome section */}
      <Box>
        <Skeleton height="32px" width="200px" mb={2} />
        <Skeleton height="16px" width="300px" />
      </Box>

      {/* Next booking card */}
      <Box border="1px" borderColor="gray.200" borderRadius="lg" p={6}>
        <Skeleton height="24px" width="150px" mb={4} />
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <Skeleton height="16px" width="100px" />
            <Skeleton height="16px" width="80px" />
          </HStack>
          <Skeleton height="16px" width="80%" />
          <Skeleton height="16px" width="60%" />
          <HStack spacing={3} mt={4}>
            <Skeleton height="40px" width="100px" />
            <Skeleton height="40px" width="100px" />
          </HStack>
        </VStack>
      </Box>

      {/* Quick actions */}
      <Box>
        <Skeleton height="24px" width="120px" mb={4} />
        <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={4}>
          {Array.from({ length: 4 }).map((_, index) => (
            <GridItem key={index}>
              <Box border="1px" borderColor="gray.200" borderRadius="lg" p={4} textAlign="center">
                <Skeleton height="40px" width="40px" mx="auto" mb={2} />
                <Skeleton height="16px" width="80px" mx="auto" />
              </Box>
            </GridItem>
          ))}
        </Grid>
      </Box>

      {/* Recent orders */}
      <Box>
        <Skeleton height="24px" width="140px" mb={4} />
        {renderOrdersSkeleton()}
      </Box>
    </VStack>
  );

  const renderTrackSkeleton = () => (
    <VStack spacing={6} align="stretch" w="full">
      {/* Map placeholder */}
      <Box
        border="1px"
        borderColor="gray.200"
        borderRadius="lg"
        height="400px"
        position="relative"
        data-testid="tracking-map"
      >
        <Skeleton height="100%" width="100%" />
        <Box position="absolute" top={4} left={4} right={4}>
          <HStack justify="space-between">
            <Skeleton height="32px" width="120px" />
            <Skeleton height="32px" width="100px" />
          </HStack>
        </Box>
      </Box>

      {/* Status and progress */}
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Skeleton height="24px" width="100px" />
          <Skeleton height="24px" width="80px" />
        </HStack>
        <Skeleton height="8px" width="100%" borderRadius="full" />
        <HStack justify="space-between">
          <Skeleton height="16px" width="120px" />
          <Skeleton height="16px" width="80px" />
        </HStack>
      </VStack>

      {/* Contact button */}
      <Skeleton height="48px" width="100%" borderRadius="lg" />
    </VStack>
  );

  const renderInvoicesSkeleton = () => (
    <VStack spacing={4} align="stretch" w="full">
      {/* Header */}
      <HStack justify="space-between" mb={4}>
        <Skeleton height="32px" width="150px" />
        <Skeleton height="40px" width="120px" />
      </HStack>

      {/* Table */}
      <Box border="1px" borderColor="gray.200" borderRadius="lg" overflow="hidden">
        {/* Table header */}
        <HStack bg="gray.50" p={4} spacing={4}>
          <Skeleton height="16px" width="100px" />
          <Skeleton height="16px" width="80px" />
          <Skeleton height="16px" width="100px" />
          <Skeleton height="16px" width="80px" />
          <Skeleton height="16px" width="100px" />
        </HStack>

        {/* Table rows */}
        {Array.from({ length: count }).map((_, index) => (
          <HStack key={index} p={4} borderTop="1px" borderColor="gray.200" spacing={4}>
            <Skeleton height="16px" width="100px" />
            <Skeleton height="16px" width="80px" />
            <Skeleton height="16px" width="100px" />
            <Skeleton height="16px" width="80px" />
            <Skeleton height="32px" width="80px" />
          </HStack>
        ))}
      </Box>
    </VStack>
  );

  const renderSettingsSkeleton = () => (
    <VStack spacing={6} align="stretch" w="full">
      {/* Profile section */}
      <Box border="1px" borderColor="gray.200" borderRadius="lg" p={6}>
        <Skeleton height="24px" width="120px" mb={4} />
        <VStack align="stretch" spacing={4}>
          <Skeleton height="40px" width="100%" />
          <Skeleton height="40px" width="100%" />
          <Skeleton height="40px" width="100%" />
          <Skeleton height="40px" width="200px" />
        </VStack>
      </Box>

      {/* Notifications section */}
      <Box border="1px" borderColor="gray.200" borderRadius="lg" p={6}>
        <Skeleton height="24px" width="140px" mb={4} />
        <VStack align="stretch" spacing={3}>
          {Array.from({ length: 3 }).map((_, index) => (
            <HStack key={index} justify="space-between">
              <Skeleton height="16px" width="200px" />
              <Skeleton height="24px" width="48px" />
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* Security section */}
      <Box border="1px" borderColor="gray.200" borderRadius="lg" p={6}>
        <Skeleton height="24px" width="100px" mb={4} />
        <VStack align="stretch" spacing={4}>
          <Skeleton height="40px" width="200px" />
          <Skeleton height="40px" width="200px" />
        </VStack>
      </Box>
    </VStack>
  );

  switch (type) {
    case 'orders':
      return renderOrdersSkeleton();
    case 'dashboard':
      return renderDashboardSkeleton();
    case 'track':
      return renderTrackSkeleton();
    case 'invoices':
      return renderInvoicesSkeleton();
    case 'settings':
      return renderSettingsSkeleton();
    default:
      return <Skeleton height="200px" width="100%" />;
  }
}
