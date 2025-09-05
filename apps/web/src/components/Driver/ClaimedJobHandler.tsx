'use client';

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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Progress,
  Spinner,
} from '@chakra-ui/react';
import {
  FiClock,
  FiCheck,
  FiX,
  FiMapPin,
  FiTruck,
  FiDollarSign,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface ClaimedJob {
  jobId: string;
  expiresAt: string;
  job: {
    id: string;
    reference: string;
    pickupAddress: string;
    dropoffAddress: string;
    scheduledAt: string;
    timeSlot?: string; // Made optional as field removed from schema
    vanSize?: string; // Made optional as field removed from schema
    totalGBP: number;
  };
}

interface ClaimedJobHandlerProps {
  onJobAccepted?: (jobId: string) => void;
  onJobDeclined?: (jobId: string) => void;
}

export default function ClaimedJobHandler({
  onJobAccepted,
  onJobDeclined,
}: ClaimedJobHandlerProps) {
  const [claimedJob, setClaimedJob] = useState<ClaimedJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    checkForClaimedJob();
    const interval = setInterval(checkForClaimedJob, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (claimedJob && claimedJob.expiresAt) {
      const updateTimeLeft = () => {
        const now = new Date().getTime();
        const expiry = new Date(claimedJob.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          // Job expired, refresh to check if it was auto-declined
          checkForClaimedJob();
        }
      };

      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [claimedJob]);

  const checkForClaimedJob = async () => {
    try {
      const response = await fetch('/api/driver/dashboard');
      if (response.ok) {
        const data = await response.json();

        // Check if there's a claimed assignment
        if (data.claimedJob) {
          setClaimedJob(data.claimedJob);
        } else {
          setClaimedJob(null);
        }
      }
    } catch (error) {
      console.error('Error checking for claimed job:', error);
    }
  };

  const acceptJob = async () => {
    if (!claimedJob) return;

    setActionLoading('accept');
    try {
      const response = await fetch(
        `/api/driver/jobs/${claimedJob.jobId}/accept`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Job Accepted!',
          description: data.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        if (onJobAccepted) {
          onJobAccepted(claimedJob.jobId);
        }

        setClaimedJob(null);

        // Redirect to active job page
        setTimeout(() => {
          router.push('/driver/jobs/active');
        }, 1000);
      } else {
        toast({
          title: 'Error',
          description: data.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error accepting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept job',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const declineJob = async () => {
    if (!claimedJob) return;

    setActionLoading('decline');
    try {
      const response = await fetch(
        `/api/driver/jobs/${claimedJob.jobId}/decline`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Job Declined',
          description: data.message,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });

        if (onJobDeclined) {
          onJobDeclined(claimedJob.jobId);
        }

        setClaimedJob(null);
      } else {
        toast({
          title: 'Error',
          description: data.error,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error declining job:', error);
      toast({
        title: 'Error',
        description: 'Failed to decline job',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTimeSlot = (timeSlot: string) => {
    const timeMap: { [key: string]: string } = {
      am: 'Morning',
      pm: 'Afternoon',
      evening: 'Evening',
    };
    return timeMap[timeSlot] || timeSlot;
  };

  if (!claimedJob) {
    return null;
  }

  const progressPercentage = claimedJob.expiresAt
    ? Math.max(0, Math.min(100, ((300 - timeLeft) / 300) * 100))
    : 0;

  return (
    <Card mb={6} borderColor="orange.200" borderWidth="2px">
      <CardBody>
        <VStack align="stretch" spacing={4}>
          {/* Header */}
          <HStack justify="space-between">
            <HStack>
              <Text fontWeight="bold" fontSize="lg">
                Job #{claimedJob.job.reference}
              </Text>
              <Badge colorScheme="orange">Claimed</Badge>
            </HStack>
            <Badge colorScheme="green" fontSize="lg">
              £{(claimedJob.job.totalGBP / 100).toFixed(2)}
            </Badge>
          </HStack>

          {/* Timer */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="medium">
                <FiClock /> Time to respond:
              </Text>
              <Text
                fontSize="lg"
                fontWeight="bold"
                color={timeLeft < 60 ? 'red.500' : 'orange.500'}
              >
                {formatTime(timeLeft)}
              </Text>
            </HStack>
            <Progress
              value={progressPercentage}
              colorScheme={timeLeft < 60 ? 'red' : 'orange'}
              size="sm"
            />
          </Box>

          {/* Job Details */}
          <VStack align="start" spacing={2}>
            <HStack>
              <FiMapPin color="gray" />
              <Text fontSize="sm" fontWeight="medium">
                Pickup
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.700" pl={6}>
              {claimedJob.job.pickupAddress}
            </Text>

            <HStack>
              <FiMapPin color="gray" />
              <Text fontSize="sm" fontWeight="medium">
                Dropoff
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.700" pl={6}>
              {claimedJob.job.dropoffAddress}
            </Text>

            <HStack>
              <FiClock color="gray" />
              <Text fontSize="sm" fontWeight="medium">
                Schedule
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.700" pl={6}>
              {formatDate(claimedJob.job.scheduledAt)} •{' '}
              {formatTimeSlot(claimedJob.job.timeSlot || '')}
            </Text>

            <HStack>
              <FiTruck color="gray" />
              <Text fontSize="sm" fontWeight="medium">
                Vehicle
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.700" pl={6}>
              {claimedJob.job.vanSize || 'N/A'}
            </Text>
          </VStack>

          {/* Actions */}
          <HStack spacing={4} justify="center">
            <Button
              leftIcon={<FiX />}
              colorScheme="red"
              variant="outline"
              onClick={declineJob}
              isLoading={actionLoading === 'decline'}
              loadingText="Declining..."
              size="lg"
            >
              Decline
            </Button>
            <Button
              leftIcon={<FiCheck />}
              colorScheme="green"
              onClick={acceptJob}
              isLoading={actionLoading === 'accept'}
              loadingText="Accepting..."
              size="lg"
            >
              Accept Job
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}
