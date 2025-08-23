import React from "react";
import {
  Box,
  VStack,
  HStack,
  Skeleton,
  SkeletonText,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Divider
} from "@chakra-ui/react";

export default function PortalDashboardSkeleton() {
  return (
    <VStack align="stretch" spacing={6}>
      {/* Welcome Section Skeleton */}
      <Box>
        <Skeleton height="32px" width="200px" mb={2} />
        <Skeleton height="20px" width="300px" />
      </Box>

      {/* Next Booking Card Skeleton */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Skeleton height="24px" width="120px" />
            <Skeleton height="20px" width="80px" />
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Skeleton height="20px" width="150px" mb={1} />
              <Skeleton height="16px" width="200px" />
            </Box>
            <Box>
              <Skeleton height="16px" width="60px" mb={1} />
              <Skeleton height="16px" width="250px" />
            </Box>
            <Box>
              <Skeleton height="16px" width="80px" mb={1} />
              <Skeleton height="16px" width="120px" />
            </Box>
            <HStack spacing={3}>
              <Skeleton height="32px" width="100px" />
              <Skeleton height="32px" width="60px" />
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Quick Actions Skeleton */}
      <Box>
        <Skeleton height="24px" width="120px" mb={4} />
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="100px" />
          ))}
        </SimpleGrid>
      </Box>

      {/* Recent Orders Skeleton */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Skeleton height="24px" width="120px" />
          <Skeleton height="20px" width="60px" />
        </HStack>
        <VStack align="stretch" spacing={3}>
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              borderWidth="1px"
              borderRadius="md"
              p={4}
              bg="white"
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Skeleton height="20px" width="100px" />
                  <Skeleton height="16px" width="80px" />
                </VStack>
                <HStack spacing={3}>
                  <Skeleton height="20px" width="60px" />
                  <Skeleton height="32px" width="50px" />
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Announcements Skeleton */}
      <Box p={4} bg="blue.50" borderRadius="md">
        <Skeleton height="20px" width="140px" mb={2} />
        <VStack align="start" spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="16px" width="100%" />
          ))}
        </VStack>
      </Box>
    </VStack>
  );
}
