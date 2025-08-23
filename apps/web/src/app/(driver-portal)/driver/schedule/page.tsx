"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Checkbox,
  CheckboxGroup,
  Stack,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import { format } from "date-fns";
import Calendar from "@/components/Calendar/Calendar";
import AvailabilityWindows from "@/components/Calendar/AvailabilityWindows";
import { CalendarEvent, CalendarConflict } from "@/components/Calendar/CalendarUtils";

interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringDays: string[];
  isActive: boolean;
}

interface LocationStatus {
  hasConsent: boolean;
  lastSeen?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface ScheduleData {
  events: CalendarEvent[];
  conflicts: CalendarConflict[];
  dateRange: {
    start: string;
    end: string;
    view: string;
  };
  summary: {
    totalJobs: number;
    totalShifts: number;
    conflicts: number;
  };
}

interface AvailabilityWindow {
  id: string;
  startTime: string;
  endTime: string;
  recurringDays: string[];
  isActive: boolean;
}

export default function SchedulePage() {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [availabilityWindows, setAvailabilityWindows] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationConsent, setLocationConsent] = useState(false);
  const [locationUpdating, setLocationUpdating] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    isRecurring: false,
    recurringDays: [] as string[]
  });
  const toast = useToast();

  useEffect(() => {
    fetchScheduleData();
    fetchAvailabilityWindows();
  }, []);

  const fetchScheduleData = async () => {
    try {
      const response = await fetch('/api/driver/schedule');
      if (response.ok) {
        const data = await response.json();
        setScheduleData(data);
      } else {
        throw new Error('Failed to fetch schedule data');
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      toast({
        title: "Error",
        description: "Failed to load schedule data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilityWindows = async () => {
    try {
      const response = await fetch('/api/driver/availability/windows');
      if (response.ok) {
        const data = await response.json();
        setAvailabilityWindows(data.availabilityWindows || []);
      }
    } catch (error) {
      console.error('Error fetching availability windows:', error);
    }
  };

  const handleLocationConsent = async () => {
    setLocationUpdating(true);
    try {
      const response = await fetch('/api/driver/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          availability: 'online',
          locationConsent: !locationConsent 
        }),
      });

      if (response.ok) {
        setLocationConsent(!locationConsent);
        await fetchScheduleData();
        toast({
          title: "Success",
          description: `Location sharing ${!locationConsent ? 'enabled' : 'disabled'}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to update location consent');
      }
    } catch (error) {
      console.error('Error updating location consent:', error);
      toast({
        title: "Error",
        description: "Failed to update location consent",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLocationUpdating(false);
    }
  };

  const openShiftModal = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        startTime: new Date(shift.startTime).toISOString().slice(0, 16),
        endTime: new Date(shift.endTime).toISOString().slice(0, 16),
        isRecurring: shift.isRecurring,
        recurringDays: shift.recurringDays
      });
    } else {
      setEditingShift(null);
      setFormData({
        startTime: "",
        endTime: "",
        isRecurring: false,
        recurringDays: []
      });
    }
    onOpen();
  };

  const saveShift = async () => {
    setSaving(true);
    try {
      const url = editingShift 
        ? `/api/driver/shifts/${editingShift.id}`
        : '/api/driver/shifts';
      
      const method = editingShift ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchScheduleData();
        await fetchAvailabilityWindows();
        onClose();
        toast({
          title: "Success",
          description: `Shift ${editingShift ? 'updated' : 'created'} successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to save shift');
      }
    } catch (error) {
      console.error('Error saving shift:', error);
      toast({
        title: "Error",
        description: "Failed to save shift",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteShift = async (shiftId: string) => {
    try {
      const response = await fetch(`/api/driver/shifts/${shiftId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchScheduleData();
        await fetchAvailabilityWindows();
        toast({
          title: "Success",
          description: "Shift deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to delete shift');
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({
        title: "Error",
        description: "Failed to delete shift",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatShiftTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecurringDaysText = (days: string[]) => {
    if (days.length === 0) return "One-time";
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(", ");
  };

  const handleAvailabilityWindowsSave = async (windows: AvailabilityWindow[]) => {
    try {
      const response = await fetch('/api/driver/availability/windows', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ windows }),
      });

      if (response.ok) {
        setAvailabilityWindows(windows);
        await fetchScheduleData();
        toast({
          title: "Success",
          description: "Availability windows updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to update availability windows');
      }
    } catch (error) {
      console.error('Error updating availability windows:', error);
      toast({
        title: "Error",
        description: "Failed to update availability windows",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Handle event click - could navigate to job details or show more info
    console.log('Event clicked:', event);
  };

  const handleDateClick = (date: Date) => {
    // Handle date click - could open shift creation modal
    console.log('Date clicked:', date);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Schedule & Calendar</Heading>
          <Text color="gray.600">Manage your schedule, view upcoming jobs, and set availability</Text>
        </Box>

        {/* Location Status */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Box>
                  <Heading size="md">Location Sharing</Heading>
                  <Text color="gray.600">
                    Share your location while online to help with job matching
                  </Text>
                </Box>
                <Switch
                  isChecked={locationConsent}
                  onChange={handleLocationConsent}
                  isDisabled={locationUpdating}
                  colorScheme="green"
                  size="lg"
                />
              </HStack>
              
              <Alert status={locationConsent ? "success" : "info"}>
                <AlertIcon />
                <Box>
                  <AlertTitle>
                    Location Status: {locationConsent ? "Enabled" : "Disabled"}
                  </AlertTitle>
                  <AlertDescription>
                    {locationConsent 
                      ? "Your location will be shared while you're online"
                      : "Enable location sharing to improve job matching"
                    }
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* Main Content Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <FiCalendar />
                <Text>Calendar View</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FiClock />
                <Text>Availability Windows</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <AddIcon />
                <Text>Individual Shifts</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Calendar View Tab */}
            <TabPanel>
              {scheduleData ? (
                <Calendar
                  events={scheduleData.events}
                  conflicts={scheduleData.conflicts}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateClick}
                />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
                  <Spinner size="xl" />
                </Box>
              )}
            </TabPanel>

            {/* Availability Windows Tab */}
            <TabPanel>
              <AvailabilityWindows
                windows={availabilityWindows}
                onSave={handleAvailabilityWindowsSave}
              />
            </TabPanel>

            {/* Individual Shifts Tab */}
            <TabPanel>
              <Card>
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <Heading size="md">Individual Shifts</Heading>
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      onClick={() => openShiftModal()}
                    >
                      Add Shift
                    </Button>
                  </HStack>

                  {scheduleData && scheduleData.events.filter(e => e.type === 'shift' && !e.isRecurring).length > 0 ? (
                    <VStack align="stretch" spacing={3}>
                      {scheduleData.events
                        .filter(e => e.type === 'shift' && !e.isRecurring)
                        .map((shift) => (
                          <Box
                            key={shift.id}
                            p={4}
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="md"
                            _hover={{ bg: "gray.50" }}
                          >
                            <HStack justify="space-between" mb={2}>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold">
                                  {formatShiftTime(shift.start.toISOString())} - {formatShiftTime(shift.end.toISOString())}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {format(shift.start, 'EEE, MMM d, yyyy')}
                                </Text>
                              </VStack>
                              <HStack>
                                <Badge colorScheme="orange">One-time Shift</Badge>
                                <IconButton
                                  aria-label="Edit shift"
                                  icon={<EditIcon />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openShiftModal({
                                    id: shift.id,
                                    startTime: shift.start.toISOString(),
                                    endTime: shift.end.toISOString(),
                                    isRecurring: false,
                                    recurringDays: [],
                                    isActive: true
                                  } as Shift)}
                                />
                                <IconButton
                                  aria-label="Delete shift"
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => deleteShift(shift.id)}
                                />
                              </HStack>
                            </HStack>
                          </Box>
                        ))}
                    </VStack>
                  ) : (
                    <Text color="gray.600">
                      No individual shifts scheduled. Add your first shift to get started.
                    </Text>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Shift Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingShift ? "Edit Shift" : "Add New Shift"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Recurring Shift</FormLabel>
                <Switch
                  isChecked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                />
              </FormControl>

              {formData.isRecurring && (
                <FormControl>
                  <FormLabel>Recurring Days</FormLabel>
                  <CheckboxGroup
                    value={formData.recurringDays}
                    onChange={(values) => setFormData({ ...formData, recurringDays: values as string[] })}
                  >
                    <Stack spacing={2}>
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <Checkbox key={day} value={day}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={saveShift}
              isLoading={saving}
              loadingText="Saving..."
            >
              {editingShift ? "Update" : "Create"} Shift
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
