import React from 'react';
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  Select,
  Center,
} from '@chakra-ui/react';
import { requireRole } from '@/lib/auth';

export default async function PortalSupport() {
  const session = await requireRole('customer');

  const faqs = [
    {
      question: 'How do I track my delivery?',
      answer:
        "You can track your delivery in real-time from the Track page in your portal, or by clicking the 'Track' button on any active order.",
    },
    {
      question: 'Can I reschedule my booking?',
      answer:
        "Yes, you can reschedule your booking up to 24 hours before the scheduled time. Go to your order details and click 'Reschedule'.",
    },
    {
      question: 'What if I need to cancel my booking?',
      answer:
        'You can cancel your booking up to 24 hours before the scheduled time. Cancellations within 24 hours may incur a fee.',
    },
    {
      question: 'How do I pay for my booking?',
      answer:
        'We accept all major credit cards and debit cards. Payment is processed securely through Stripe.',
    },
    {
      question: 'What should I do if my driver is late?',
      answer:
        "If your driver is running late, you'll receive real-time updates. You can also contact support for immediate assistance.",
    },
  ];

  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="lg" mb={2}>
          Help & Support
        </Heading>
        <Text color="gray.600">
          Get help with your bookings and find answers to common questions
        </Text>
      </Box>

      <HStack spacing={6} align="start">
        <VStack align="stretch" spacing={6} flex={1}>
          <Card>
            <CardHeader>
              <Heading size="md">Frequently Asked Questions</Heading>
            </CardHeader>
            <CardBody>
              <Accordion allowToggle>
                {faqs.map((faq, index) => (
                  <AccordionItem key={index}>
                    <h2>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left">
                          {faq.question}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>{faq.answer}</AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
          </Card>
        </VStack>

        <VStack align="stretch" spacing={6} flex={1}>
          <Card>
            <CardHeader>
              <Heading size="md">Contact Support</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel>Subject</FormLabel>
                  <Select placeholder="Select a category">
                    <option value="booking">Booking Issue</option>
                    <option value="payment">Payment Problem</option>
                    <option value="tracking">Tracking Issue</option>
                    <option value="cancellation">Cancellation Request</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Order Reference (if applicable)</FormLabel>
                  <Input placeholder="e.g., SV123456789" />
                </FormControl>
                <FormControl>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    placeholder="Describe your issue in detail..."
                    rows={6}
                  />
                </FormControl>
                <Button colorScheme="blue" alignSelf="start">
                  Send Message
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Quick Contact</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm">
                  <strong>Phone:</strong> 07901846297
                </Text>
                <Text fontSize="sm">
                  <strong>Email:</strong> support@speedy-van.co.uk
                </Text>
                <Text fontSize="sm">
                  <strong>Hours:</strong> Mon-Fri 8am-8pm, Sat 9am-6pm
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </HStack>
    </VStack>
  );
}
