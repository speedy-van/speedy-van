import React from "react";
import { Box, Heading, Text, VStack, HStack, Button, Badge, Container } from "@chakra-ui/react";
import { requireRole } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import NextLink from "next/link";

const prisma = new PrismaClient();

export default async function TrackPage() {
  const session = await requireRole("customer");
  const customerId = (session!.user as any).id as string;

  // Get active bookings that can be tracked
  const activeBookings = await prisma.booking.findMany({
    where: {
      customerId,
      status: {
        in: ["CONFIRMED"]
      }
    },
    orderBy: { createdAt: "desc" },
    include: {
      pickupAddress: true,
      dropoffAddress: true,
      driver: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      Assignment: {
        include: {
          JobEvent: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }
    }
  });

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="lg" mb={2}>Live Tracking</Heading>
        <Text color="gray.600">Track your active moves in real-time</Text>
      </Box>

      {activeBookings.length === 0 ? (
        <Box textAlign="center" py={12}>
          <Text fontSize="lg" mb={4}>No active moves to track</Text>
          <Text color="gray.600" mb={6}>
            You'll see tracking information here when you have an active booking.
          </Text>
          <Button as={NextLink as any} href="/book" colorScheme="blue">
            Book a Move
          </Button>
        </Box>
      ) : (
        <VStack align="stretch" spacing={4}>
          {activeBookings.map((booking) => (
            <Box
              key={booking.id}
              borderWidth="1px"
              borderRadius="lg"
              p={6}
              bg="white"
              shadow="sm"
            >
              <HStack justify="space-between" mb={4}>
                <VStack align="start" spacing={1}>
                  <Heading size="md">Booking {booking.reference}</Heading>
                  <Text color="gray.600">
                    {booking.pickupAddress?.label || 'Pickup TBD'} → {booking.dropoffAddress?.label || 'Dropoff TBD'}
                  </Text>
                </VStack>
                <Badge
                  colorScheme={
                    booking.Assignment?.JobEvent?.[0]?.step === "en_route_to_dropoff" ? "green" :
                    booking.Assignment?.JobEvent?.[0]?.step === "loading_completed" ? "blue" :
                    booking.Assignment?.JobEvent?.[0]?.step === "arrived_at_pickup" ? "yellow" :
                    "orange"
                  }
                  variant="subtle"
                  px={3}
                  py={1}
                >
                  {booking.Assignment?.JobEvent?.[0]?.step?.replace(/_/g, " ").toUpperCase() || "ASSIGNED"}
                </Badge>
              </HStack>

              {booking.driver && (
                <Box mb={4} p={4} bg="gray.50" borderRadius="md">
                  <Text fontWeight="medium" mb={2}>Your Driver</Text>
                  <Text>{booking.driver.user.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    Driver ID: {booking.driver.id}
                  </Text>
                </Box>
              )}

              <HStack spacing={4}>
                <Button
                  as={NextLink as any}
                  href={`/customer-portal/track/${booking.id}`}
                  colorScheme="blue"
                  size="sm"
                >
                  View Live Map
                </Button>
                <Button
                  as={NextLink as any}
                  href={`/customer-portal/orders/${booking.reference}`}
                  variant="outline"
                  size="sm"
                >
                  View Details
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  );
}
