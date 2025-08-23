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
  Grid,
  GridItem,
  Flex,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi';
import { format, isSameDay, isToday, isSameMonth, addDays } from 'date-fns';
import {
  CalendarEvent,
  CalendarConflict,
  getCalendarDays,
  getEventsForDay,
  getEventColor,
  getEventIcon,
  formatEventTime,
  formatEventDate,
  formatEventDateTime,
  navigateCalendar,
  getViewTitle,
  groupEventsByDay,
  getTimeSlots
} from './CalendarUtils';

interface CalendarProps {
  events: CalendarEvent[];
  conflicts: CalendarConflict[];
  loading?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export default function Calendar({
  events,
  conflicts,
  loading = false,
  onEventClick,
  onDateClick
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const days = getCalendarDays(currentDate, view);
  const eventsByDay = groupEventsByDay(events, days);

  const handleNavigate = (direction: 'prev' | 'next') => {
    setCurrentDate(navigateCalendar(currentDate, direction, view));
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    onOpen();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const handleExportICS = async () => {
    try {
      const startDate = new Date();
      const endDate = addDays(startDate, 30);
      
      const response = await fetch(
        `/api/driver/schedule/export?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `driver-schedule-${format(new Date(), 'yyyy-MM-dd')}.ics`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Successful",
          description: "Calendar exported as ICS file",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export calendar",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const renderMonthView = () => (
    <Grid templateColumns="repeat(7, 1fr)" gap={1}>
      {/* Day headers */}
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
        <GridItem key={day} p={2} textAlign="center" fontWeight="bold" bg="gray.50">
          <Text fontSize="sm">{day}</Text>
        </GridItem>
      ))}
      
      {/* Calendar days */}
      {days.map(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayEvents = eventsByDay[dayKey] || [];
        const isCurrentDay = isToday(day);
        const isCurrentMonth = isSameMonth(day, currentDate);
        
        return (
          <GridItem
            key={dayKey}
            minH="120px"
            p={2}
            border="1px solid"
            borderColor="gray.200"
            bg={isCurrentDay ? "blue.50" : "white"}
            cursor="pointer"
            _hover={{ bg: "gray.50" }}
            onClick={() => handleDateClick(day)}
          >
            <Text
              fontSize="sm"
              fontWeight={isCurrentDay ? "bold" : "normal"}
              color={isCurrentMonth ? "black" : "gray.400"}
              mb={2}
            >
              {format(day, 'd')}
            </Text>
            
            <VStack align="stretch" spacing={1}>
              {dayEvents.slice(0, 3).map(event => (
                <Box
                  key={event.id}
                  p={1}
                  bg={getEventColor(event)}
                  color="white"
                  borderRadius="sm"
                  fontSize="xs"
                  cursor="pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                >
                  <Text noOfLines={1}>
                    {getEventIcon(event)} {event.title}
                  </Text>
                  <Text fontSize="xs" opacity={0.8}>
                    {formatEventTime(new Date(event.start))}
                  </Text>
                </Box>
              ))}
              
              {dayEvents.length > 3 && (
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  +{dayEvents.length - 3} more
                </Text>
              )}
            </VStack>
          </GridItem>
        );
      })}
    </Grid>
  );

  const renderWeekView = () => (
    <VStack align="stretch" spacing={0}>
      {/* Time slots */}
      {getTimeSlots().map(timeSlot => {
        const hour = parseInt(timeSlot.split(':')[0]);
        const dayEventsForHour = days.map(day => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay[dayKey] || [];
          return dayEvents.filter(event => {
            const eventStart = new Date(event.start);
            return eventStart.getHours() === hour;
          });
        });

        return (
          <HStack key={timeSlot} spacing={0} minH="60px">
            <Box w="80px" p={2} borderRight="1px solid" borderColor="gray.200" bg="gray.50">
              <Text fontSize="sm" fontWeight="bold">{timeSlot}</Text>
            </Box>
            
            {days.map((day, dayIndex) => {
              const dayEvents = dayEventsForHour[dayIndex];
              const isCurrentDay = isToday(day);
              
              return (
                <Box
                  key={format(day, 'yyyy-MM-dd')}
                  flex={1}
                  p={2}
                  borderRight="1px solid"
                  borderColor="gray.200"
                  bg={isCurrentDay ? "blue.50" : "white"}
                  minH="60px"
                >
                                     {dayEvents.map((event: CalendarEvent) => (
                    <Box
                      key={event.id}
                      p={1}
                      mb={1}
                      bg={getEventColor(event)}
                      color="white"
                      borderRadius="sm"
                      fontSize="xs"
                      cursor="pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <Text noOfLines={1}>
                        {getEventIcon(event)} {event.title}
                      </Text>
                      <Text fontSize="xs" opacity={0.8}>
                        {formatEventTime(new Date(event.start))}
                      </Text>
                    </Box>
                  ))}
                </Box>
              );
            })}
          </HStack>
        );
      })}
    </VStack>
  );

  const renderDayView = () => {
    const day = days[0];
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayEvents = eventsByDay[dayKey] || [];
    
    return (
      <VStack align="stretch" spacing={0}>
        {getTimeSlots().map(timeSlot => {
          const hour = parseInt(timeSlot.split(':')[0]);
          const hourEvents = dayEvents.filter(event => {
            const eventStart = new Date(event.start);
            return eventStart.getHours() === hour;
          });
          
          return (
            <HStack key={timeSlot} spacing={0} minH="80px">
              <Box w="80px" p={2} borderRight="1px solid" borderColor="gray.200" bg="gray.50">
                <Text fontSize="sm" fontWeight="bold">{timeSlot}</Text>
              </Box>
              
              <Box flex={1} p={2} borderRight="1px solid" borderColor="gray.200">
                {hourEvents.map(event => (
                  <Box
                    key={event.id}
                    p={2}
                    mb={2}
                    bg={getEventColor(event)}
                    color="white"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <Text fontWeight="bold">
                      {getEventIcon(event)} {event.title}
                    </Text>
                    <Text fontSize="sm" opacity={0.8}>
                      {formatEventTime(new Date(event.start))} - {formatEventTime(new Date(event.end))}
                    </Text>
                    {event.pickup && (
                      <Text fontSize="xs" mt={1}>
                        📍 {event.pickup}
                      </Text>
                    )}
                    {event.dropoff && (
                      <Text fontSize="xs">
                        🎯 {event.dropoff}
                      </Text>
                    )}
                  </Box>
                ))}
              </Box>
            </HStack>
          );
        })}
      </VStack>
    );
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
        {/* Header */}
        <HStack justify="space-between">
          <HStack spacing={4}>
            <IconButton
              aria-label="Previous"
              icon={<FiChevronLeft />}
              onClick={() => handleNavigate('prev')}
              size="sm"
            />
            
            <Text fontSize="xl" fontWeight="bold">
              {getViewTitle(currentDate, view)}
            </Text>
            
            <IconButton
              aria-label="Next"
              icon={<FiChevronRight />}
              onClick={() => handleNavigate('next')}
              size="sm"
            />
          </HStack>
          
          <HStack spacing={2}>
            <Select
              value={view}
              onChange={(e) => setView(e.target.value as 'month' | 'week' | 'day')}
              size="sm"
              w="120px"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
            </Select>
            
            <Button
              leftIcon={<FiDownload />}
              size="sm"
              onClick={handleExportICS}
            >
              Export
            </Button>
          </HStack>
        </HStack>

        {/* Conflicts Alert */}
        {conflicts.length > 0 && (
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle>Schedule Conflicts Detected</AlertTitle>
              <AlertDescription>
                You have {conflicts.length} overlapping events. Please review your schedule.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Calendar View */}
        <Card>
          <CardBody>
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </CardBody>
        </Card>

        {/* Summary */}
        <HStack justify="space-between" p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="bold">Summary</Text>
          <HStack spacing={4}>
            <Badge colorScheme="green">
              {events.filter(e => e.type === 'job').length} Jobs
            </Badge>
            <Badge colorScheme="orange">
              {events.filter(e => e.type === 'shift').length} Shifts
            </Badge>
            {conflicts.length > 0 && (
              <Badge colorScheme="red">
                {conflicts.length} Conflicts
              </Badge>
            )}
          </HStack>
        </HStack>
      </VStack>

      {/* Event Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedEvent?.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEvent && (
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Text fontWeight="bold">Type:</Text>
                  <Badge colorScheme={selectedEvent.type === 'job' ? 'green' : 'orange'}>
                    {selectedEvent.type === 'job' ? 'Job' : 'Shift'}
                  </Badge>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold">Date:</Text>
                  <Text>{formatEventDate(new Date(selectedEvent.start))}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold">Time:</Text>
                  <Text>
                    {formatEventTime(new Date(selectedEvent.start))} - {formatEventTime(new Date(selectedEvent.end))}
                  </Text>
                </HStack>
                
                {selectedEvent.pickup && (
                  <Box>
                    <Text fontWeight="bold">Pickup:</Text>
                    <Text>{selectedEvent.pickup}</Text>
                  </Box>
                )}
                
                {selectedEvent.dropoff && (
                  <Box>
                    <Text fontWeight="bold">Dropoff:</Text>
                    <Text>{selectedEvent.dropoff}</Text>
                  </Box>
                )}
                
                {selectedEvent.amount && (
                  <HStack>
                    <Text fontWeight="bold">Amount:</Text>
                    <Text>£{(selectedEvent.amount / 100).toFixed(2)}</Text>
                  </HStack>
                )}
                
                {selectedEvent.status && (
                  <HStack>
                    <Text fontWeight="bold">Status:</Text>
                    <Badge colorScheme={selectedEvent.status === 'in_progress' ? 'blue' : 'green'}>
                      {selectedEvent.status}
                    </Badge>
                  </HStack>
                )}
                
                {selectedEvent.isRecurring && (
                  <Box>
                    <Text fontWeight="bold">Recurring:</Text>
                    <Text>{selectedEvent.recurringDays?.join(', ')}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
