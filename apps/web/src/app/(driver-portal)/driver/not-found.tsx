import React from "react";
import { Box, Container, VStack, Heading, Text, Button } from "@chakra-ui/react";
import NextLink from "next/link";

export default function DriverNotFound() {
  return (
    <Container maxW="md" py={12}>
      <VStack spacing={6} textAlign="center">
        <Heading size="lg">Page Not Found</Heading>
        <Text color="gray.600">
          The page you're looking for doesn't exist in the driver portal.
        </Text>
        <Button as={NextLink} href="/driver" colorScheme="blue">
          Go to Dashboard
        </Button>
      </VStack>
    </Container>
  );
}
