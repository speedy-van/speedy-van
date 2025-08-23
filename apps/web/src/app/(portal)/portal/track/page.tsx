import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Center
} from "@chakra-ui/react";
import NextLink from "next/link";
import { PrismaClient } from "@prisma/client";
import { requireRole } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function PortalTrack() {
  const session = await requireRole("customer");
  const customerId = (session!.user as any).id as string;

  const trackableOrders = await prisma.booking.findMany({
    where: {
      customerId,
      status: {
        in: ["CONFIRMED"]
      }
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      pickupAddress: true,
      dropoffAddress: true,
      driver: {
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_route_dropoff': return 'blue';
      case 'loaded': return 'blue';
      case 'arrived': return 'yellow';
      case 'CONFIRMED': return 'orange';
      case 'en_route_pickup': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="lg" mb={2}>Live Tracking</Heading>
        <Text color="gray.600">Track your active Speedy Van deliveries in real-time</Text>
      </Box>

      {trackableOrders.length === 0 ? (
        <Center py={12}>
          <VStack spacing={4}>
            <Text fontSize="lg" color="gray.600">No active orders to track</Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Once your booking is assigned to a driver, you'll be able to track it here.
            </Text>
            <Button as={NextLink as any} href="/portal/orders" colorScheme="blue">
              View My Orders
            </Button>
          </VStack>
        </Center>
      ) : (
        <VStack align="stretch" spacing={4}>
          {trackableOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="md">Booking {order.reference}</Heading>
                    <Text fontSize="sm" color="gray.600">
                      {order.scheduledAt ? 
                        new Date(order.scheduledAt).toLocaleDateString('en-GB') : 
                        "Date TBD"
                      } at {order.scheduledAt ? new Date(order.scheduledAt).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'}) : "Time TBD"}
                    </Text>
                  </VStack>
                  <Badge
                    colorScheme={getStatusColor(order.status)}
                    variant="subtle"
                    fontSize="sm"
                  >
                    {order.status.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Route</Text>
                    <Text fontSize="sm" color="gray.600">
                      {order.pickupAddress?.label || 'Pickup TBD'} → {order.dropoffAddress?.label || 'Dropoff TBD'}
                    </Text>
                  </Box>

                  {order.driver && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={1}>Your Driver</Text>
                      <Text fontSize="sm" color="gray.600">{order.driver.user.name}</Text>
                    </Box>
                  )}

                  <HStack spacing={3}>
                    <Button
                      as={NextLink as any}
                      href={`/portal/track/${order.reference}`}
                      colorScheme="blue"
                      size="sm"
                    >
                      Track Live
                    </Button>
                    <Button
                      as={NextLink as any}
                      href={`/portal/orders/${order.reference}`}
                      variant="outline"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </VStack>
  );
}
