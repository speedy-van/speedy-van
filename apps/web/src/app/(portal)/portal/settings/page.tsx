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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Divider
} from "@chakra-ui/react";
import { requireRole } from "@/lib/auth";

export default async function PortalSettings() {
  const session = await requireRole("customer");

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="lg" mb={2}>Settings</Heading>
        <Text color="gray.600">Manage your account preferences and security settings</Text>
      </Box>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Profile</Tab>
          <Tab>Notifications</Tab>
          <Tab>Security</Tab>
          <Tab>Privacy</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <Card>
                <CardHeader>
                  <Heading size="md">Profile Information</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <FormControl>
                      <FormLabel>Full Name</FormLabel>
                      <Input defaultValue={session?.user?.name || ""} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input defaultValue={session?.user?.email || ""} type="email" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input placeholder="Enter your phone number" />
                    </FormControl>
                    <Button colorScheme="blue" alignSelf="start">
                      Save Changes
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <Card>
                <CardHeader>
                  <Heading size="md">Notification Preferences</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="medium">Email Notifications</Text>
                        <Text fontSize="sm" color="gray.600">Receive updates about your bookings via email</Text>
                      </Box>
                      <Switch defaultChecked />
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="medium">SMS Notifications</Text>
                        <Text fontSize="sm" color="gray.600">Receive text messages for urgent updates</Text>
                      </Box>
                      <Switch />
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="medium">Push Notifications</Text>
                        <Text fontSize="sm" color="gray.600">Get real-time updates in your browser</Text>
                      </Box>
                      <Switch defaultChecked />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <Card>
                <CardHeader>
                  <Heading size="md">Security Settings</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Button variant="outline" alignSelf="start">
                      Change Password
                    </Button>
                    <HStack justify="space-between">
                      <Box>
                        <Text fontWeight="medium">Two-Factor Authentication</Text>
                        <Text fontSize="sm" color="gray.600">Add an extra layer of security to your account</Text>
                      </Box>
                      <Switch />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <Card>
                <CardHeader>
                  <Heading size="md">Privacy & Data</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Button variant="outline" alignSelf="start">
                      Download My Data
                    </Button>
                    <Button variant="outline" alignSelf="start" colorScheme="red">
                      Delete My Account
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
