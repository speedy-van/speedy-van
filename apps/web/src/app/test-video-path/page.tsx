'use client';

import React from 'react';
import { Box, Container, VStack, Heading, Text, Button } from '@chakra-ui/react';

export default function TestVideoPathPage() {
  return (
    <Container maxW="container.xl" py={16}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={4}>
            Video Path Test
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Testing if the video file can be accessed directly.
          </Text>
        </Box>
        
        <Box bg="gray.100" p={6} borderRadius="lg">
          <Heading size="md" mb={3}>Video File Test:</Heading>
          <VStack align="start" spacing={4}>
            <Text>Video path: <code>/videos/background.mp4</code></Text>
            <Text>Full URL: <code>http://localhost:3000/videos/background.mp4</code></Text>
            
            <Box>
              <Text mb={2}>Direct video test:</Text>
              <video 
                controls 
                width="400" 
                height="225"
                style={{ border: '1px solid #ccc' }}
              >
                <source src="/videos/background.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
            
            <Box>
              <Text mb={2}>Video with autoplay (muted):</Text>
              <video 
                autoPlay
                muted
                loop
                playsInline
                width="400" 
                height="225"
                style={{ border: '1px solid #ccc' }}
              >
                <source src="/videos/background.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
          </VStack>
        </Box>
        
        <Box textAlign="center">
          <Button 
            colorScheme="blue" 
            size="lg"
            onClick={() => window.location.href = '/'}
          >
            Back to Home
          </Button>
        </Box>
      </VStack>
    </Container>
  );
}
