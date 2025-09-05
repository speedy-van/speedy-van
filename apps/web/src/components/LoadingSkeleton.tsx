import React from 'react';
import {
  Box,
  Skeleton,
  SkeletonText,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
} from '@chakra-ui/react';

interface LoadingSkeletonProps {
  type?: 'dashboard' | 'table' | 'card' | 'list';
  count?: number;
}

export function LoadingSkeleton({
  type = 'card',
  count = 3,
}: LoadingSkeletonProps) {
  const renderDashboardSkeleton = () => (
    <VStack spacing={6} align="stretch">
      {/* Welcome section */}
      <Box>
        <Skeleton height="32px" width="200px" mb={2} />
        <Skeleton height="20px" width="300px" />
      </Box>

      {/* Next booking card */}
      <Card>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Skeleton height="24px" width="120px" />
            <Skeleton height="20px" width="80px" />
          </HStack>
          <VStack spacing={3} align="stretch">
            <Box>
              <Skeleton height="18px" width="150px" mb={1} />
              <Skeleton height="16px" width="200px" />
            </Box>
            <Box>
              <Skeleton height="18px" width="60px" mb={1} />
              <Skeleton height="16px" width="250px" />
            </Box>
            <HStack spacing={3}>
              <Skeleton height="32px" width="100px" />
              <Skeleton height="32px" width="80px" />
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Quick actions */}
      <Box>
        <Skeleton height="24px" width="120px" mb={4} />
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="80px" borderRadius="md" />
          ))}
        </SimpleGrid>
      </Box>

      {/* Recent orders */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Skeleton height="24px" width="120px" />
          <Skeleton height="20px" width="60px" />
        </HStack>
        <VStack spacing={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Skeleton height="18px" width="100px" />
                    <Skeleton height="16px" width="80px" />
                  </VStack>
                  <HStack spacing={3}>
                    <Skeleton height="20px" width="60px" />
                    <Skeleton height="32px" width="60px" />
                  </HStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Box>
    </VStack>
  );

  const renderTableSkeleton = () => (
    <VStack spacing={4} align="stretch">
      <Skeleton height="40px" width="200px" />
      <Box overflow="hidden" borderRadius="md">
        <Box as="table" width="100%">
          <Box as="thead">
            <Box as="tr">
              {Array.from({ length: 5 }).map((_, i) => (
                <Box as="th" key={i} p={3}>
                  <Skeleton height="20px" />
                </Box>
              ))}
            </Box>
          </Box>
          <Box as="tbody">
            {Array.from({ length: count }).map((_, rowIndex) => (
              <Box as="tr" key={rowIndex}>
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <Box as="td" key={colIndex} p={3}>
                    <Skeleton height="16px" />
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </VStack>
  );

  const renderCardSkeleton = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Skeleton height="24px" width="60%" />
              <SkeletonText noOfLines={3} spacing={2} />
              <HStack spacing={2}>
                <Skeleton height="32px" width="80px" />
                <Skeleton height="32px" width="80px" />
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );

  const renderListSkeleton = () => (
    <VStack spacing={3} align="stretch">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardBody>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Skeleton height="18px" width="120px" />
                <Skeleton height="16px" width="200px" />
              </VStack>
              <HStack spacing={2}>
                <Skeleton height="20px" width="60px" />
                <Skeleton height="32px" width="60px" />
              </HStack>
            </HStack>
          </CardBody>
        </Card>
      ))}
    </VStack>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'dashboard':
        return renderDashboardSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <Box
      role="status"
      aria-label="Loading content"
      aria-live="polite"
      aria-busy="true"
    >
      {renderSkeleton()}
      <Box
        position="absolute"
        left="-10000px"
        width="1px"
        height="1px"
        overflow="hidden"
      >
        Loading content, please wait...
      </Box>
    </Box>
  );
}

// Individual skeleton components for specific use cases
export function CardSkeleton() {
  return (
    <Card>
      <CardBody>
        <VStack spacing={3} align="stretch">
          <Skeleton height="24px" width="60%" />
          <SkeletonText noOfLines={3} spacing={2} />
          <HStack spacing={2}>
            <Skeleton height="32px" width="80px" />
            <Skeleton height="32px" width="80px" />
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <Box as="tr">
      {Array.from({ length: columns }).map((_, i) => (
        <Box as="td" key={i} p={3}>
          <Skeleton height="16px" />
        </Box>
      ))}
    </Box>
  );
}

export function ButtonSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const height = size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px';
  const width = size === 'sm' ? '80px' : size === 'lg' ? '120px' : '100px';

  return <Skeleton height={height} width={width} borderRadius="md" />;
}
