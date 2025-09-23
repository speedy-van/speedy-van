'use client';

import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Switch,
  FormControl,
  FormLabel,
  Button,
  Divider,
  HStack,
  Badge,
  useBreakpointValue,
  Stack,
} from '@chakra-ui/react';
import { FiSettings, FiBell, FiShield, FiMail } from 'react-icons/fi';

export default function DriverSettings() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  return (
    <Container maxW="container.xl" py={{ base: 4, md: 8 }}>
      <VStack spacing={{ base: 6, md: 8 }} align="stretch">
        {/* Header */}
        <VStack spacing={{ base: 3, md: 4 }} textAlign="center">
          <Heading size={{ base: "lg", md: "2xl" }} color="blue.600">
            ⚙️ Driver Settings
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
            Customize your driver experience
          </Text>
        </VStack>

        {/* Settings Sections */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 6 }}>
          {/* Notifications */}
          <Card>
            <CardBody p={{ base: 4, md: 6 }}>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <Heading size={{ base: "sm", md: "md" }} mb={{ base: 2, md: 4 }}>
                  <FiBell style={{ display: 'inline', marginRight: '8px' }} />
                  Notifications
                </Heading>
                
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0" fontSize={{ base: "sm", md: "md" }}>Job Notifications</FormLabel>
                  <Switch colorScheme="blue" isChecked isDisabled size={{ base: "sm", md: "md" }} />
                </FormControl>
                
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0" fontSize={{ base: "sm", md: "md" }}>Email Notifications</FormLabel>
                  <Switch colorScheme="blue" isChecked isDisabled size={{ base: "sm", md: "md" }} />
                </FormControl>
                
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0" fontSize={{ base: "sm", md: "md" }}>SMS Notifications</FormLabel>
                  <Switch colorScheme="blue" isDisabled size={{ base: "sm", md: "md" }} />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Security */}
          <Card>
            <CardBody p={{ base: 4, md: 6 }}>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                <Heading size={{ base: "sm", md: "md" }} mb={{ base: 2, md: 4 }}>
                  <FiShield style={{ display: 'inline', marginRight: '8px' }} />
                  Security
                </Heading>
                
                <Button variant="outline" isDisabled size={{ base: "sm", md: "md" }} width={{ base: "full", md: "auto" }}>
                  Change Password
                </Button>
                
                <Button variant="outline" isDisabled size={{ base: "sm", md: "md" }} width={{ base: "full", md: "auto" }}>
                  Two-Factor Authentication
                </Button>
                
                <Button variant="outline" colorScheme="red" isDisabled size={{ base: "sm", md: "md" }} width={{ base: "full", md: "auto" }}>
                  Delete Account
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Account Status */}
        <Card>
          <CardBody p={{ base: 4, md: 6 }}>
            <VStack spacing={{ base: 3, md: 4 }}>
              <Heading size={{ base: "sm", md: "md" }}>
                <FiSettings style={{ display: 'inline', marginRight: '8px' }} />
                Account Status
              </Heading>
              
              <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 2, md: 4 }} wrap="wrap" justify="center">
                <Badge colorScheme="green" size={{ base: "md", md: "lg" }} px={{ base: 3, md: 4 }} py={{ base: 1, md: 2 }}>
                  ✅ Account Active
                </Badge>
                <Badge colorScheme="blue" size={{ base: "md", md: "lg" }} px={{ base: 3, md: 4 }} py={{ base: 1, md: 2 }}>
                  🚚 Driver Approved
                </Badge>
                <Badge colorScheme="purple" size={{ base: "md", md: "lg" }} px={{ base: 3, md: 4 }} py={{ base: 1, md: 2 }}>
                  📋 Documents Verified
                </Badge>
              </Stack>
            </VStack>
          </CardBody>
        </Card>

        {/* Coming Soon */}
        <Card>
          <CardBody textAlign="center" py={{ base: 6, md: 8 }}>
            <VStack spacing={{ base: 3, md: 4 }}>
              <Text fontSize={{ base: "3xl", md: "4xl" }}>🚧</Text>
              <Heading size={{ base: "sm", md: "md" }}>Advanced Settings Coming Soon</Heading>
              <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                More customization options will be available soon.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
