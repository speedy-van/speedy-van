import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Center,
  IconButton,
  useDisclosure
} from "@chakra-ui/react";
import NextLink from "next/link";
import { requireRole } from "@/lib/auth";

export default async function PortalAddresses() {
  const session = await requireRole("customer");

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="lg" mb={2}>Addresses & Contacts</Heading>
        <Text color="gray.600">Manage your saved addresses and contact information</Text>
      </Box>

      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="medium">Saved Addresses</Text>
        <Button colorScheme="blue" size="sm">
          Add New Address
        </Button>
      </HStack>

      <Center py={12}>
        <VStack spacing={4}>
          <Text fontSize="lg" color="gray.600">No saved addresses yet</Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Save your frequently used addresses to speed up future bookings.
          </Text>
          <Button colorScheme="blue">
            Add Your First Address
          </Button>
        </VStack>
      </Center>

      <HStack justify="space-between" mt={8}>
        <Text fontSize="lg" fontWeight="medium">Saved Contacts</Text>
        <Button colorScheme="blue" size="sm">
          Add New Contact
        </Button>
      </HStack>

      <Center py={12}>
        <VStack spacing={4}>
          <Text fontSize="lg" color="gray.600">No saved contacts yet</Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Save contact information for quick access during bookings.
          </Text>
          <Button colorScheme="blue">
            Add Your First Contact
          </Button>
        </VStack>
      </Center>
    </VStack>
  );
}
