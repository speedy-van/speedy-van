'use client';

import React, { useState } from 'react';
import { Box, Heading, VStack } from '@chakra-ui/react';
import JobFeed from '@/components/Driver/JobFeed';
import ClaimedJobHandler from '@/components/Driver/ClaimedJobHandler';
import ActiveJobHandler from '@/components/Driver/ActiveJobHandler';

export default function JobsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleJobClaimed = (jobId: string) => {
    // Trigger a refresh of the dashboard to show the claimed job
    setRefreshTrigger(prev => prev + 1);
  };

  const handleJobAccepted = (jobId: string) => {
    // Job was accepted, could redirect to active job page or refresh
    console.log('Job accepted:', jobId);
  };

  const handleJobDeclined = (jobId: string) => {
    // Job was declined, refresh the job feed
    setRefreshTrigger(prev => prev + 1);
  };

  const handleJobCompleted = (jobId: string) => {
    // Job was completed, refresh the job feed
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Jobs
      </Heading>

      <VStack spacing={6} align="stretch">
        {/* Active Job Handler - shows when driver has an active job */}
        <ActiveJobHandler onJobCompleted={handleJobCompleted} />

        {/* Claimed Job Handler - shows when driver has claimed a job */}
        <ClaimedJobHandler
          onJobAccepted={handleJobAccepted}
          onJobDeclined={handleJobDeclined}
        />

        {/* Job Feed */}
        <JobFeed
          onJobClaimed={handleJobClaimed}
          key={refreshTrigger} // Force refresh when needed
        />
      </VStack>
    </Box>
  );
}
