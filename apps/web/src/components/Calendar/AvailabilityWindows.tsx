"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
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
  Checkbox,
  CheckboxGroup,
  Stack,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

interface AvailabilityWindow {
  id: string;
  startTime: string;
  endTime: string;
  recurringDays: string[];
  isActive: boolean;
}

interface AvailabilityWindowsProps {
  windows: AvailabilityWindow[];
  loading?: boolean;
  onSave?: (windows: AvailabilityWindow[]) => void;
}

export default function AvailabilityWindows({
  windows,
  loading = false,
  onSave
}: AvailabilityWindowsProps) {
  const [availabilityWindows, setAvailabilityWindows] = useState<AvailabilityWindow[]>(windows);
  const [editingWindow, setEditingWindow] = useState<AvailabilityWindow | null>(null);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    recurringDays: [] as string[]
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    setAvailabilityWindows(windows);
  }, [windows]);

  const openWindowModal = (window?: AvailabilityWindow) => {
    if (window) {
      setEditingWindow(window);
      setFormData({
        startTime: new Date(window.startTime).toISOString().slice(0, 16),
        endTime: new Date(window.endTime).toISOString().slice(0, 16),
        recurringDays: window.recurringDays
      });
    } else {
      setEditingWindow(null);
      setFormData({
        startTime: '',
        endTime: '',
        recurringDays: []
      });
    }
    onOpen();
  };

  const saveWindow = () => {
    if (!formData.startTime || !formData.endTime || formData.recurringDays.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);

    if (startTime >= endTime) {
      toast({
        title: "Validation Error",
        description: "End time must be after start time",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let updatedWindows: AvailabilityWindow[];

    if (editingWindow) {
      updatedWindows = availabilityWindows.map(window =>
        window.id === editingWindow.id
          ? {
              ...window,
              startTime: formData.startTime,
              endTime: formData.endTime,
              recurringDays: formData.recurringDays
            }
          : window
      );
    } else {
      const newWindow: AvailabilityWindow = {
        id: `temp-${Date.now()}`,
        startTime: formData.startTime,
        endTime: formData.endTime,
        recurringDays: formData.recurringDays,
        isActive: true
      };
      updatedWindows = [...availabilityWindows, newWindow];
    }

    setAvailabilityWindows(updatedWindows);
    onClose();

    toast({
      title: "Success",
      description: `Availability window ${editingWindow ? 'updated' : 'created'} successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    if (onSave) {
      onSave(updatedWindows);
    }
  };

  const deleteWindow = (windowId: string) => {
    const updatedWindows = availabilityWindows.filter(window => window.id !== windowId);
    setAvailabilityWindows(updatedWindows);

    toast({
      title: "Success",
      description: "Availability window deleted successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    if (onSave) {
      onSave(updatedWindows);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const getDaysText = (days: string[]) => {
    if (days.length === 0) return "No days selected";
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(", ");
  };

  const getDayColor = (day: string) => {
    const colors = {
      monday: 'blue',
      tuesday: 'green',
      wednesday: 'purple',
      thursday: 'orange',
      friday: 'red',
      saturday: 'pink',
      sunday: 'gray'
    };
    return colors[day as keyof typeof colors] || 'gray';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Text fontSize="xl" fontWeight="bold">Recurring Availability</Text>
            <Text color="gray.600">Set your regular working hours</Text>
          </Box>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={() => openWindowModal()}
          >
            Add Window
          </Button>
        </HStack>

        {availabilityWindows.length === 0 ? (
          <Card>
            <CardBody>
                             <VStack spacing={4} py={8}>
                 <FiClock size={32} color="gray.400" />
                <Text color="gray.600">No availability windows set</Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Add your regular working hours to help with job scheduling
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <VStack align="stretch" spacing={4}>
            {availabilityWindows.map((window) => (
              <Card key={window.id}>
                <CardBody>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Text fontWeight="bold">
                          {formatTime(window.startTime)} - {formatTime(window.endTime)}
                        </Text>
                        <Badge colorScheme={window.isActive ? "green" : "gray"}>
                          {window.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </HStack>
                      
                      <HStack spacing={2} flexWrap="wrap">
                        {window.recurringDays.map(day => (
                          <Badge
                            key={day}
                            colorScheme={getDayColor(day)}
                            variant="subtle"
                            size="sm"
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>
                    
                    <HStack>
                      <IconButton
                        aria-label="Edit window"
                        icon={<FiEdit />}
                        size="sm"
                        variant="ghost"
                        onClick={() => openWindowModal(window)}
                      />
                      <IconButton
                        aria-label="Delete window"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => deleteWindow(window.id)}
                      />
                    </HStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}

        {availabilityWindows.length > 0 && (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>Availability Windows</AlertTitle>
              <AlertDescription>
                These windows will be used to automatically schedule recurring shifts and help with job matching.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </VStack>

      {/* Window Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingWindow ? "Edit Availability Window" : "Add Availability Window"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Grid templateColumns="1fr 1fr" gap={4} w="full">
                <FormControl>
                  <FormLabel>Start Time</FormLabel>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>End Time</FormLabel>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel>Recurring Days</FormLabel>
                <CheckboxGroup
                  value={formData.recurringDays}
                  onChange={(values) => setFormData({ ...formData, recurringDays: values as string[] })}
                >
                  <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                    {[
                      { value: 'monday', label: 'Monday' },
                      { value: 'tuesday', label: 'Tuesday' },
                      { value: 'wednesday', label: 'Wednesday' },
                      { value: 'thursday', label: 'Thursday' },
                      { value: 'friday', label: 'Friday' },
                      { value: 'saturday', label: 'Saturday' },
                      { value: 'sunday', label: 'Sunday' }
                    ].map(({ value, label }) => (
                      <Checkbox key={value} value={value}>
                        {label}
                      </Checkbox>
                    ))}
                  </Grid>
                </CheckboxGroup>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={saveWindow}
            >
              {editingWindow ? "Update" : "Create"} Window
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
