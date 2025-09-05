import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Link as ChakraLink,
  Text,
  Button,
  HStack,
  VStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Divider,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function PortalDashboard() {
  const session = await requireRole('customer');
  const customerId = (session!.user as any).id as string;
  const firstName = session!.user?.name?.split(' ')[0] || 'there';

  const [nextBooking, recentOrders, outstandingPayments] = await Promise.all([
    // Next booking (most recent active/upcoming)
    prisma.booking.findFirst({
      where: {
        customerId,
        status: {
          in: ['CONFIRMED'],
        },
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        pickupAddress: true,
        dropoffAddress: true,
        driver: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
    // Recent orders (last 3)
    prisma.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    // Outstanding payments
    prisma.booking.findMany({
      where: {
        customerId,
        status: { in: ['PENDING_PAYMENT', 'DRAFT'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'CANCELLED':
        return 'red';
      case 'en_route_dropoff':
        return 'blue';
      case 'loaded':
        return 'blue';
      case 'arrived':
        return 'yellow';
      case 'CONFIRMED':
        return 'orange';
      case 'CONFIRMED':
        return 'green';
      case 'pending_dispatch':
        return 'yellow';
      case 'DRAFT':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      {/* Welcome Section */}
      <Box>
        <Heading size="lg" mb={2}>
          Hello, {firstName}!
        </Heading>
        <Text color="gray.600">Welcome to your Speedy Van dashboard</Text>
      </Box>

      {/* Next Booking Card */}
      {nextBooking && (
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Next Booking</Heading>
              <Badge
                colorScheme={getStatusColor(nextBooking.status)}
                variant="subtle"
              >
                {nextBooking.status.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="medium" mb={1}>
                  Booking {nextBooking.reference}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {nextBooking.scheduledAt
                    ? new Date(nextBooking.scheduledAt).toLocaleDateString(
                        'en-GB'
                      )
                    : 'Date TBD'}{' '}
                  at{' '}
                  {nextBooking.scheduledAt
                    ? new Date(nextBooking.scheduledAt).toLocaleTimeString(
                        'en-GB',
                        { hour: '2-digit', minute: '2-digit' }
                      )
                    : 'Time TBD'}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>
                  Route
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {nextBooking.pickupAddress?.label || 'Pickup TBD'} →{' '}
                  {nextBooking.dropoffAddress?.label || 'Dropoff TBD'}
                </Text>
              </Box>

              {nextBooking.driver && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                    Your Driver
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {nextBooking.driver.user.name}
                  </Text>
                </Box>
              )}

              <HStack spacing={3}>
                <Button
                  as={NextLink as any}
                  href={`/portal/orders/${nextBooking.reference}`}
                  colorScheme="blue"
                  size="sm"
                >
                  View Details
                </Button>
                {nextBooking.status === 'CONFIRMED' && (
                  <Button
                    as={NextLink as any}
                    href={`/portal/track/${nextBooking.reference}`}
                    variant="outline"
                    size="sm"
                  >
                    Track
                  </Button>
                )}
                {nextBooking.status === 'DRAFT' && (
                  <Button
                    as={NextLink as any}
                    href={`/portal/orders/${nextBooking.reference}`}
                    variant="outline"
                    size="sm"
                  >
                    Reschedule
                  </Button>
                )}
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Quick Actions */}
      <Box>
        <Heading size="md" mb={4}>
          Quick Actions
        </Heading>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Button
            as={NextLink as any}
            href="/book"
            colorScheme="blue"
            size="lg"
            height="auto"
            py={6}
          >
            <VStack spacing={2}>
              <Text fontSize="2xl">📦</Text>
              <Text>New Booking</Text>
            </VStack>
          </Button>

          <Button
            as={NextLink as any}
            href="/portal/orders"
            variant="outline"
            size="lg"
            height="auto"
            py={6}
          >
            <VStack spacing={2}>
              <Text fontSize="2xl">📋</Text>
              <Text>My Orders</Text>
            </VStack>
          </Button>

          <Button
            as={NextLink as any}
            href="/portal/invoices"
            variant="outline"
            size="lg"
            height="auto"
            py={6}
          >
            <VStack spacing={2}>
              <Text fontSize="2xl">💰</Text>
              <Text>Invoices</Text>
            </VStack>
          </Button>

          <Button
            as={NextLink as any}
            href="/portal/addresses"
            variant="outline"
            size="lg"
            height="auto"
            py={6}
          >
            <VStack spacing={2}>
              <Text fontSize="2xl">📍</Text>
              <Text>Addresses</Text>
            </VStack>
          </Button>
        </SimpleGrid>
      </Box>

      {/* Recent Orders */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Recent Orders</Heading>
          <Button
            as={NextLink as any}
            href="/portal/orders"
            variant="link"
            size="sm"
          >
            View All
          </Button>
        </HStack>

        {recentOrders.length === 0 ? (
          <Box
            textAlign="center"
            py={8}
            borderWidth="1px"
            borderRadius="md"
            borderStyle="dashed"
          >
            <Text fontSize="lg" mb={2}>
              No orders yet
            </Text>
            <Text color="gray.600" mb={4}>
              Start by making your first booking.
            </Text>
            <Button as={NextLink as any} href="/book" colorScheme="blue">
              Book a Move
            </Button>
          </Box>
        ) : (
          <VStack align="stretch" spacing={3}>
            {recentOrders.map(order => (
              <Box
                key={order.id}
                borderWidth="1px"
                borderRadius="md"
                p={4}
                bg="white"
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">{order.reference}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {order.scheduledAt
                        ? new Date(order.scheduledAt).toLocaleDateString(
                            'en-GB'
                          )
                        : 'Date TBD'}
                    </Text>
                  </VStack>
                  <HStack spacing={3}>
                    <Badge
                      colorScheme={getStatusColor(order.status)}
                      variant="subtle"
                    >
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    <Button
                      as={NextLink as any}
                      href={`/portal/orders/${order.reference}`}
                      size="sm"
                      variant="outline"
                    >
                      View
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      {/* Outstanding Actions */}
      {outstandingPayments.length > 0 && (
        <Box>
          <Heading size="md" mb={4}>
            Outstanding Actions
          </Heading>
          <VStack align="stretch" spacing={3}>
            {outstandingPayments.map(order => (
              <Box
                key={order.id}
                borderWidth="1px"
                borderRadius="md"
                p={4}
                bg="yellow.50"
                borderColor="yellow.200"
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">{order.reference}</Text>
                    <Text fontSize="sm" color="gray.600">
                      Payment required: {formatCurrency(order.totalGBP * 100)}
                    </Text>
                  </VStack>
                  <Button
                    as={NextLink as any}
                    href={`/checkout?code=${order.reference}`}
                    colorScheme="blue"
                    size="sm"
                  >
                    Complete Payment
                  </Button>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* Announcements */}
      <Box p={4} bg="blue.50" borderRadius="md">
        <Heading size="sm" mb={2}>
          📢 Service Updates
        </Heading>
        <VStack align="start" spacing={2}>
          <Text fontSize="sm">
            • <strong>New Feature:</strong> Live tracking is now available for
            all active moves
          </Text>
          <Text fontSize="sm">
            • <strong>Holiday Hours:</strong> We'll be operating with reduced
            hours during the festive season
          </Text>
          <Text fontSize="sm">
            • <strong>Referral Bonus:</strong> Get £10 off your next move when
            you refer a friend
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
}
