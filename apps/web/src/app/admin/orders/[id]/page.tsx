import React from "react";
import { Box, Heading, Badge, HStack, VStack, Text, Button, Tabs, TabList, TabPanels, Tab, TabPanel, Card, CardBody, Grid, GridItem, Divider, List, ListItem, ListIcon } from "@chakra-ui/react";
import { FiMapPin, FiClock, FiUser, FiTruck, FiDollarSign, FiMessageSquare, FiFile, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  // Mock order data - in real implementation, this would come from API
  const order = {
    id: params.id,
    ref: `ORD-${params.id}`,
    status: "in-transit",
    customer: {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+44 7700 900123"
    },
    pickup: {
      address: "123 High Street, London SW1A 1AA",
      time: "14:00 - 16:00",
      contact: "Jane Doe",
      phone: "+44 7700 900456"
    },
    dropoff: {
      address: "456 Oxford Street, London W1C 1AP",
      time: "16:00 - 18:00",
      contact: "Bob Wilson",
      phone: "+44 7700 900789"
    },
    items: [
      { name: "Sofa", quantity: 1, size: "Large" },
      { name: "Dining Table", quantity: 1, size: "Medium" },
      { name: "Boxes", quantity: 5, size: "Small" }
    ],
    crew: 2,
    floors: 3,
    lift: true,
    price: 125.00,
    paymentStatus: "paid",
    driver: {
      name: "Sarah Johnson",
      phone: "+44 7700 900999",
      rating: 4.8
    },
    timeline: [
      { time: "09:30", event: "Order created", user: "Customer" },
      { time: "10:15", event: "Payment confirmed", user: "System" },
      { time: "11:00", event: "Assigned to driver", user: "Admin" },
      { time: "13:45", event: "Driver en route", user: "Sarah J." },
      { time: "14:30", event: "Arrived at pickup", user: "Sarah J." },
      { time: "15:15", event: "Loaded items", user: "Sarah J." },
      { time: "15:30", event: "En route to dropoff", user: "Sarah J." }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "yellow";
      case "confirmed": return "blue";
      case "in-transit": return "green";
      case "completed": return "green";
      case "cancelled": return "red";
      default: return "gray";
    }
  };

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="lg">{order.ref}</Heading>
          <Text color="gray.600">Order Details</Text>
        </VStack>
        <HStack spacing={3}>
          <Badge colorScheme={getStatusColor(order.status)} size="lg">
            {order.status.replace("-", " ").toUpperCase()}
          </Badge>
          <Button colorScheme="blue" size="sm">Assign Driver</Button>
          <Button variant="outline" size="sm">Update Time</Button>
          <Button variant="outline" size="sm">Refund</Button>
          <Button variant="outline" size="sm">Chat</Button>
        </HStack>
      </HStack>

      <Tabs>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Timeline</Tab>
          <Tab>Payment</Tab>
          <Tab>Communications</Tab>
          <Tab>Files</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
              <VStack spacing={6} align="stretch">
                {/* Route Information */}
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Route</Heading>
                    <VStack spacing={4} align="stretch">
                      <HStack>
                        <FiMapPin />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">Pickup</Text>
                          <Text>{order.pickup.address}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {order.pickup.time} • {order.pickup.contact} ({order.pickup.phone})
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack>
                        <FiMapPin />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">Dropoff</Text>
                          <Text>{order.dropoff.address}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {order.dropoff.time} • {order.dropoff.contact} ({order.dropoff.phone})
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Items */}
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Items</Heading>
                    <List spacing={3}>
                      {order.items.map((item, index) => (
                        <ListItem key={index}>
                          <HStack justify="space-between">
                            <Text>{item.name} (x{item.quantity})</Text>
                            <Badge variant="outline">{item.size}</Badge>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  </CardBody>
                </Card>
              </VStack>

              <VStack spacing={6} align="stretch">
                {/* Customer Info */}
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Customer</Heading>
                    <VStack spacing={3} align="stretch">
                      <HStack>
                        <FiUser />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">{order.customer.name}</Text>
                          <Text fontSize="sm">{order.customer.email}</Text>
                          <Text fontSize="sm">{order.customer.phone}</Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Driver Info */}
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Driver</Heading>
                    <VStack spacing={3} align="stretch">
                      <HStack>
                        <FiTruck />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">{order.driver.name}</Text>
                          <Text fontSize="sm">{order.driver.phone}</Text>
                          <Text fontSize="sm">Rating: {order.driver.rating} ⭐</Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Service Details */}
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Service Details</Heading>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text>Crew Size</Text>
                        <Text fontWeight="bold">{order.crew} people</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Floors</Text>
                        <Text fontWeight="bold">{order.floors}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Lift Available</Text>
                        <Text fontWeight="bold">{order.lift ? "Yes" : "No"}</Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </Grid>
          </TabPanel>

          {/* Timeline Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Order Timeline</Heading>
                <VStack spacing={4} align="stretch">
                  {order.timeline.map((event, index) => (
                    <HStack key={index} spacing={4}>
                      <Text fontSize="sm" color="gray.600" minW="60px">
                        {event.time}
                      </Text>
                      <Box
                        w="12px"
                        h="12px"
                        borderRadius="full"
                        bg={index === order.timeline.length - 1 ? "blue.500" : "gray.300"}
                      />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{event.event}</Text>
                        <Text fontSize="sm" color="gray.600">by {event.user}</Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Payment Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Payment Information</Heading>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text>Status</Text>
                    <Badge colorScheme={order.paymentStatus === "paid" ? "green" : "yellow"}>
                      {order.paymentStatus.toUpperCase()}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Amount</Text>
                    <Text fontWeight="bold">£{order.price.toFixed(2)}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Payment Method</Text>
                    <Text>Card ending in 1234</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Transaction ID</Text>
                    <Text fontSize="sm" color="gray.600">txn_123456789</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Communications Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Communications</Heading>
                <Text color="gray.500">Chat and email logs will be displayed here</Text>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Files Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Files</Heading>
                <Text color="gray.500">Photos, POD, and invoice PDFs will be displayed here</Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
