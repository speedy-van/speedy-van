import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link as ChakraLink,
  Spinner,
  Center
} from "@chakra-ui/react";
import NextLink from "next/link";
import { PrismaClient } from "@prisma/client";
import { requireRole } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function PortalOrders() {
  const session = await requireRole("customer");
  const customerId = (session!.user as any).id as string;

  const [currentOrders, upcomingOrders, pastOrders, allOrders] = await Promise.all([
    // Current orders (confirmed, assigned, en route, etc.)
    prisma.booking.findMany({
      where: {
        customerId,
        status: {
          in: ["CONFIRMED"]
        }
      },
      orderBy: { scheduledAt: "asc" },
      include: {
        pickupAddress: true,
        dropoffAddress: true
      }
    }),
    // Upcoming orders (open, pending dispatch)
    prisma.booking.findMany({
      where: {
        customerId,
        status: {
          in: ["DRAFT"]
        }
      },
      orderBy: { scheduledAt: "asc" },
      include: {
        pickupAddress: true,
        dropoffAddress: true
      }
    }),
    // Past orders (completed, cancelled)
    prisma.booking.findMany({
      where: {
        customerId,
        status: {
          in: ["COMPLETED", "CANCELLED"]
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        pickupAddress: true,
        dropoffAddress: true
      }
    }),
    // All orders
    prisma.booking.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        pickupAddress: true,
        dropoffAddress: true
      }
    })
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      case 'en_route_dropoff': return 'blue';
      case 'loaded': return 'blue';
      case 'arrived': return 'yellow';
      case 'CONFIRMED': return 'orange';
      case 'CONFIRMED': return 'green';
      case 'pending_dispatch': return 'yellow';
      case 'DRAFT': return 'gray';
      default: return 'gray';
    }
  };

  const OrderTable = ({ orders }: { orders: any[] }) => (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Reference</Th>
            <Th>Date & Time</Th>
            <Th>Route</Th>
            <Th>Crew Size</Th>
            <Th>Price</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((order) => (
            <Tr key={order.id}>
              <Td>
                <Text fontWeight="medium">{order.reference}</Text>
              </Td>
              <Td>
                <Text fontSize="sm">
                  {order.scheduledAt ? 
                    new Date(order.scheduledAt).toLocaleDateString('en-GB') : 
                    "TBD"
                  }
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {order.timeSlot || "Time TBD"}
                </Text>
              </Td>
              <Td>
                <Text fontSize="sm" noOfLines={2}>
                  {order.pickupAddress?.label || 'Pickup TBD'} → {order.dropoffAddress?.label || 'Dropoff TBD'}
                </Text>
              </Td>
              <Td>
                <Text fontSize="sm">{order.crewSize || "TBD"}</Text>
              </Td>
              <Td>
                <Text fontSize="sm" fontWeight="medium">
                  {formatCurrency(order.totalGBP * 100)}
                </Text>
              </Td>
              <Td>
                <Badge
                  colorScheme={getStatusColor(order.status)}
                  variant="subtle"
                  fontSize="xs"
                >
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <Button
                    as={NextLink as any}
                    href={`/portal/orders/${order.reference}`}
                    size="sm"
                    variant="outline"
                  >
                    View
                  </Button>
                  {(order.status === "CONFIRMED") && (
                    <Button
                      as={NextLink as any}
                      href={`/portal/track/${order.reference}`}
                      size="sm"
                      colorScheme="blue"
                    >
                      Track
                    </Button>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );

  const EmptyState = ({ message, actionText, actionHref }: { message: string; actionText: string; actionHref: string }) => (
    <Center py={12}>
      <VStack spacing={4}>
        <Text fontSize="lg" color="gray.600">{message}</Text>
        <Button as={NextLink as any} href={actionHref} colorScheme="blue">
          {actionText}
        </Button>
      </VStack>
    </Center>
  );

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="lg" mb={2}>My Orders</Heading>
        <Text color="gray.600">Manage and track your Speedy Van bookings</Text>
      </Box>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>
            Current/Upcoming ({currentOrders.length + upcomingOrders.length})
          </Tab>
          <Tab>
            Past ({pastOrders.length})
          </Tab>
          <Tab>
            All ({allOrders.length})
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {currentOrders.length === 0 && upcomingOrders.length === 0 ? (
              <EmptyState 
                message="No current or upcoming orders"
                actionText="Book a Move"
                actionHref="/book"
              />
            ) : (
              <OrderTable orders={[...currentOrders, ...upcomingOrders]} />
            )}
          </TabPanel>

          <TabPanel>
            {pastOrders.length === 0 ? (
              <EmptyState 
                message="No past orders"
                actionText="Book a Move"
                actionHref="/book"
              />
            ) : (
              <OrderTable orders={pastOrders} />
            )}
          </TabPanel>

          <TabPanel>
            {allOrders.length === 0 ? (
              <EmptyState 
                message="No orders yet"
                actionText="Book a Move"
                actionHref="/book"
              />
            ) : (
              <OrderTable orders={allOrders} />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
