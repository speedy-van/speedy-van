'use client';
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
  useToast,
  Spinner,
  Badge,
  Divider,
} from '@chakra-ui/react';
import {
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportGenerated: () => void;
}

export default function GenerateReportModal({
  isOpen,
  onClose,
  onReportGenerated,
}: GenerateReportModalProps) {
  const [title, setTitle] = useState('');
  const [periodType, setPeriodType] = useState('custom');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const toast = useToast();

  // Set default dates when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30); // Default to last 30 days
      
      setEndDate(end.toISOString().split('T')[0]);
      setStartDate(start.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handlePeriodTypeChange = (type: string) => {
    setPeriodType(type);
    const end = new Date();
    let start = new Date();

    switch (type) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'custom':
        start.setDate(start.getDate() - 30);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleGenerateReport = async () => {
    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a report title',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select start and end dates',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast({
        title: 'Validation Error',
        description: 'Start date must be before end date',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/errors/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          period: {
            start: new Date(startDate),
            end: new Date(endDate),
          },
          assignee: assignee.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Error report generated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onReportGenerated();
        onClose();
        resetForm();
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate error report',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setPeriodType('custom');
    setStartDate('');
    setEndDate('');
    setAssignee('');
    setDescription('');
  };

  const getPeriodDescription = () => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const getQuickPeriodOptions = () => [
    { value: '7d', label: 'Last 7 days', icon: <ClockIcon className="h-4 w-4" /> },
    { value: '30d', label: 'Last 30 days', icon: <CalendarIcon className="h-4 w-4" /> },
    { value: '90d', label: 'Last 90 days', icon: <CalendarIcon className="h-4 w-4" /> },
    { value: '1y', label: 'Last year', icon: <CalendarIcon className="h-4 w-4" /> },
    { value: 'custom', label: 'Custom period', icon: <CalendarIcon className="h-4 w-4" /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <DocumentTextIcon className="h-6 w-6 text-blue-500" />
            <Text>Generate Error Report</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Report Title */}
            <FormControl isRequired>
              <FormLabel>Report Title</FormLabel>
              <Input
                placeholder="Enter a descriptive title for the report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>

            {/* Period Selection */}
            <Card>
              <CardHeader>
                <Heading size="md">Report Period</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* Quick Period Options */}
                  <Grid templateColumns="repeat(5, 1fr)" gap={2}>
                    {getQuickPeriodOptions().map((option) => (
                      <Button
                        key={option.value}
                        size="sm"
                        variant={periodType === option.value ? 'solid' : 'outline'}
                        colorScheme={periodType === option.value ? 'blue' : 'gray'}
                        onClick={() => handlePeriodTypeChange(option.value)}
                        leftIcon={option.icon}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </Grid>

                  <Divider />

                  {/* Custom Date Range */}
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <FormControl>
                      <FormLabel>Start Date</FormLabel>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={endDate}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>End Date</FormLabel>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                  </Grid>

                  {/* Period Summary */}
                  {startDate && endDate && (
                    <Box p={3} bg="blue.50" borderRadius="md">
                      <HStack>
                        <ChartBarIcon className="h-5 w-5 text-blue-500" />
                        <Text fontSize="sm" color="blue.700">
                          Report will cover <strong>{getPeriodDescription()}</strong> from{' '}
                          <strong>{new Date(startDate).toLocaleDateString()}</strong> to{' '}
                          <strong>{new Date(endDate).toLocaleDateString()}</strong>
                        </Text>
                      </HStack>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Assignee */}
            <FormControl>
              <FormLabel>Assignee (Optional)</FormLabel>
              <Input
                placeholder="Enter developer name to assign the report"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            </FormControl>

            {/* Description */}
            <FormControl>
              <FormLabel>Description (Optional)</FormLabel>
              <Textarea
                placeholder="Enter additional notes or context for this report..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </FormControl>

            {/* Report Preview */}
            {title && startDate && endDate && (
              <Card>
                <CardHeader>
                  <Heading size="md">Report Preview</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Box>
                      <Text fontSize="sm" color="gray.600">Title</Text>
                      <Text fontWeight="medium">{title}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Period</Text>
                      <Text fontWeight="medium">
                        {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                      </Text>
                    </Box>
                    {assignee && (
                      <Box>
                        <Text fontSize="sm" color="gray.600">Assignee</Text>
                        <Text fontWeight="medium">{assignee}</Text>
                      </Box>
                    )}
                    {description && (
                      <Box>
                        <Text fontSize="sm" color="gray.600">Description</Text>
                        <Text fontWeight="medium">{description}</Text>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Action Buttons */}
            <HStack justify="end" spacing={4}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleGenerateReport}
                isLoading={isGenerating}
                loadingText="Generating..."
                isDisabled={!title || !startDate || !endDate}
                leftIcon={<DocumentTextIcon className="h-4 w-4" />}
              >
                Generate Report
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
