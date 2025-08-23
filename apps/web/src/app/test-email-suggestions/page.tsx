'use client';

import React, { useState } from 'react';
import { Box, Container, VStack, Heading, Text, FormControl, FormLabel } from '@chakra-ui/react';
import EmailInputWithSuggestions from '@/components/booking/EmailInputWithSuggestions';

export default function TestEmailSuggestionsPage() {
  const [email, setEmail] = useState('');

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="2xl">
        <VStack spacing={8}>
                     <Box textAlign="center">
             <Heading size="xl" color="blue.600" mb={2}>
               Test Email Suggestions
             </Heading>
             <Text color="gray.600" fontSize="lg">
               Try the enhanced email input with domain suggestions
             </Text>
           </Box>

          <Box w="full" bg="white" p={6} borderRadius="lg" shadow="sm">
            <VStack spacing={6}>
                             <Text fontSize="lg" color="gray.700">
                 Try the email input field with domain suggestions
               </Text>
              
                             <FormControl>
                 <FormLabel>Email Address</FormLabel>
                 <EmailInputWithSuggestions
                   value={email}
                   onChange={setEmail}
                   placeholder="Enter your email address"
                 />
               </FormControl>

                             {email && (
                 <Box p={4} bg="blue.50" borderRadius="md" w="full">
                   <Text fontWeight="medium">Entered Email:</Text>
                   <Text color="blue.600" fontSize="lg">{email}</Text>
                 </Box>
               )}

                             <Box p={4} bg="green.50" borderRadius="md" w="full">
                 <Text fontWeight="medium" mb={2}>Features:</Text>
                 <VStack align="start" spacing={1}>
                   <Text fontSize="sm">• Over 80 email domain suggestions</Text>
                   <Text fontSize="sm">• Automatic suggestions while typing</Text>
                   <Text fontSize="sm">• Smart domain filtering</Text>
                   <Text fontSize="sm">• Popular domains from different countries</Text>
                   <Text fontSize="sm">• Temporary domains for testing</Text>
                 </VStack>
               </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
