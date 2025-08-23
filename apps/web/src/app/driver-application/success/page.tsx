'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Icon,
  Alert,
  AlertIcon,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Container,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiMail, FiPhone, FiClock, FiFileText, FiShield } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const MotionBox = motion.create(Box);

export default function DriverApplicationSuccessPage() {
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="2xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={8} align="stretch">
          {/* Success Header */}
          <Box textAlign="center">
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Icon as={FiCheckCircle} boxSize={16} color="green.500" mb={4} />
            </MotionBox>
            <Heading size="lg" color="green.600" mb={2}>
              Application Submitted Successfully!
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Thank you for applying to join our team of professional drivers
            </Text>
          </Box>

          {/* Application Status */}
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="blue.600">
                  What happens next?
                </Heading>
                
                <List spacing={3}>
                  <ListItem>
                    <HStack align="start">
                      <ListIcon as={FiMail} color="blue.500" mt={1} />
                      <Box>
                        <Text fontWeight="medium">Email Confirmation</Text>
                        <Text fontSize="sm" color="gray.600">
                          You will receive a confirmation email within the next few minutes
                        </Text>
                      </Box>
                    </HStack>
                  </ListItem>
                  
                  <ListItem>
                    <HStack align="start">
                      <ListIcon as={FiFileText} color="blue.500" mt={1} />
                      <Box>
                        <Text fontWeight="medium">Document Review</Text>
                        <Text fontSize="sm" color="gray.600">
                          Our team will review your documents and verify all information
                        </Text>
                      </Box>
                    </HStack>
                  </ListItem>
                  
                  <ListItem>
                    <HStack align="start">
                      <ListIcon as={FiShield} color="blue.500" mt={1} />
                      <Box>
                        <Text fontWeight="medium">Background Check</Text>
                        <Text fontSize="sm" color="gray.600">
                          We will conduct necessary background and driving record checks
                        </Text>
                      </Box>
                    </HStack>
                  </ListItem>
                  
                  <ListItem>
                    <HStack align="start">
                      <ListIcon as={FiClock} color="blue.500" mt={1} />
                      <Box>
                        <Text fontWeight="medium">Processing Time</Text>
                        <Text fontSize="sm" color="gray.600">
                          You will hear back from us within 3-5 business days
                        </Text>
                      </Box>
                    </HStack>
                  </ListItem>
                </List>
              </VStack>
            </CardBody>
          </Card>

          {/* Important Information */}
          <Alert status="info">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Important Information</Text>
              <Text fontSize="sm">
                Your account will remain inactive until your application is approved by our admin team. 
                You will receive an email notification once your application has been reviewed.
              </Text>
            </Box>
          </Alert>

          {/* Contact Information */}
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="blue.600">
                  Need Help?
                </Heading>
                
                <Text fontSize="sm" color="gray.600">
                  If you have any questions about your application or need to provide additional information, 
                  please don't hesitate to contact us:
                </Text>
                
                <VStack spacing={2} align="start">
                  <HStack>
                    <Icon as={FiMail} color="blue.500" />
                    <Text fontSize="sm">
                      <strong>Email:</strong> support@speedyvan.com
                    </Text>
                  </HStack>
                  
                  <HStack>
                    <Icon as={FiPhone} color="blue.500" />
                    <Text fontSize="sm">
                      <strong>Phone:</strong> +44 (0) 20 1234 5678
                    </Text>
                  </HStack>
                  
                  <Text fontSize="sm" color="gray.500">
                    <strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM GMT
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <VStack spacing={4}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/')}
              w="full"
            >
              Return to Homepage
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/auth/login')}
              w="full"
            >
              Go to Login Page
            </Button>
          </VStack>

          {/* Additional Information */}
          <Box textAlign="center" py={4}>
            <Text fontSize="sm" color="gray.500">
              Application Reference: {Date.now().toString().slice(-8)}
            </Text>
            <Text fontSize="xs" color="gray.400" mt={2}>
              Please keep this reference number for your records
            </Text>
          </Box>
        </VStack>
      </MotionBox>
    </Container>
  );
}
