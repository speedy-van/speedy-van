"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Checkbox,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge,
  Icon,
  useToast,
  Container,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Link,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
} from "@chakra-ui/react";
import {
  FaQuestionCircle,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaFileAlt,
  FaPaperclip,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaEye,
  FaHistory,
} from "react-icons/fa";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string;
  category: string;
  orderRef?: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  responses: SupportTicketResponse[];
}

interface SupportTicketResponse {
  id: string;
  message: string;
  createdAt: string;
  isFromSupport: boolean;
}

const faqData: FAQItem[] = [
  {
    question: "How do I book a moving service?",
    answer: "You can book a moving service through our website by clicking 'Book Now' on the homepage. Fill in your pickup and delivery addresses, select your items, choose your preferred time slot, and complete the payment.",
    category: "Booking"
  },
  {
    question: "What items can you move?",
    answer: "We can move most household items including furniture, appliances, electronics, boxes, and personal belongings. We cannot move hazardous materials, perishable food, or live animals.",
    category: "Services"
  },
  {
    question: "How far in advance should I book?",
    answer: "We recommend booking at least 24-48 hours in advance to ensure availability. For weekend moves or during peak season, booking 1-2 weeks ahead is advised.",
    category: "Booking"
  },
  {
    question: "Can I reschedule my booking?",
    answer: "Yes, you can reschedule your booking up to 24 hours before your scheduled time. Log into your customer portal and go to 'My Orders' to make changes.",
    category: "Booking"
  },
  {
    question: "What if I need to cancel my booking?",
    answer: "Cancellations made more than 24 hours before your scheduled time are free. Cancellations within 24 hours may incur a fee. Please contact support for urgent cancellations.",
    category: "Booking"
  },
  {
    question: "How do I track my delivery?",
    answer: "You can track your delivery in real-time through the 'Track' section in your customer portal. You'll receive updates via email and SMS as well.",
    category: "Tracking"
  },
  {
    question: "What if my items are damaged during the move?",
    answer: "We take great care with all items, but if damage occurs, please report it within 24 hours of delivery. Take photos and contact our support team immediately.",
    category: "Issues"
  },
  {
    question: "Do you provide packing materials?",
    answer: "We offer packing materials for purchase including boxes, bubble wrap, and tape. You can add these to your booking or purchase them separately.",
    category: "Services"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and digital wallets. Payment is processed securely at the time of booking.",
    category: "Payment"
  },
  {
    question: "Can I get a receipt for my payment?",
    answer: "Yes, you can download receipts and invoices from the 'Invoices & Payments' section in your customer portal.",
    category: "Payment"
  }
];

const contactCategories = [
  "Booking Issues",
  "Payment Problems", 
  "Delivery Concerns",
  "Damage Claims",
  "Account Issues",
  "General Inquiry",
  "Complaint",
  "Other"
];

const slaInfo = [
  {
    category: "Urgent Issues",
    response: "2-4 hours",
    description: "Active delivery problems, safety concerns",
    icon: FaExclamationTriangle,
    color: "red"
  },
  {
    category: "Standard Support",
    response: "24 hours",
    description: "General inquiries, booking changes",
    icon: FaInfoCircle,
    color: "blue"
  },
  {
    category: "Claims & Complaints",
    response: "48 hours",
    description: "Damage claims, formal complaints",
    icon: FaFileAlt,
    color: "orange"
  }
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'DRAFT': return 'blue';
    case 'in_progress': return 'orange';
    case 'resolved': return 'green';
    case 'closed': return 'gray';
    default: return 'gray';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'low': return 'green';
    case 'normal': return 'blue';
    case 'high': return 'orange';
    case 'urgent': return 'red';
    default: return 'blue';
  }
};

export default function CustomerSupportPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Load support tickets on component mount
  useEffect(() => {
    loadSupportTickets();
  }, []);

  const loadSupportTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const response = await fetch('/api/customer/support');
      if (response.ok) {
        const data = await response.json();
        setSupportTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Failed to load support tickets:', error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = {
        category: selectedCategory,
        orderRef: orderRef || undefined,
        description,
        email,
        phone: phone || undefined,
        attachments: [], // TODO: Implement file upload
      };

      const response = await fetch('/api/customer/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: "Support request submitted",
          description: `Ticket #${result.ticketId} created successfully. We'll get back to you within 24 hours.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Reset form
        setSelectedCategory("");
        setOrderRef("");
        setDescription("");
        setEmail("");
        setPhone("");
        setAttachments([]);
        setShowContactForm(false);

        // Reload tickets
        await loadSupportTickets();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit support request');
      }
    } catch (error) {
      toast({
        title: "Error submitting request",
        description: error instanceof Error ? error.message : "Please try again or contact us directly.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Container maxW="1200px" py={6}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Help & Support</Heading>
          <Text color="gray.600">
            Find answers to common questions or contact our support team
          </Text>
        </Box>

        {/* Quick Contact Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <CardBody textAlign="center">
              <Icon as={FaEnvelope} boxSize={6} color="blue.500" mb={3} />
              <Heading size="sm" mb={2}>Email Support</Heading>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Get help via email
              </Text>
              <Button size="sm" colorScheme="blue" variant="outline" onClick={onOpen}>
                support@speedyvan.com
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Icon as={FaPhone} boxSize={6} color="green.500" mb={3} />
              <Heading size="sm" mb={2}>Phone Support</Heading>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Call us directly
              </Text>
              <Button size="sm" colorScheme="green" variant="outline">
                1-800-SPEEDY
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Icon as={FaClock} boxSize={6} color="purple.500" mb={3} />
              <Heading size="sm" mb={2}>Response Times</Heading>
              <Text fontSize="sm" color="gray.600" mb={3}>
                See our SLAs
              </Text>
              <Button size="sm" colorScheme="purple" variant="outline" onClick={() => setShowContactForm(!showContactForm)}>
                View SLAs
              </Button>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* SLA Information */}
        {showContactForm && (
          <Card>
            <CardHeader>
              <Heading size="md">Response Time Commitments</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {slaInfo.map((sla, index) => (
                  <Box key={index} p={4} borderWidth="1px" borderRadius="md">
                    <HStack mb={3}>
                      <Icon as={sla.icon} color={`${sla.color}.500`} />
                      <Heading size="sm">{sla.category}</Heading>
                    </HStack>
                    <Badge colorScheme={sla.color} mb={2}>
                      {sla.response}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      {sla.description}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs variant="enclosed">
          <TabList>
            <Tab>
              <HStack>
                <Icon as={FaQuestionCircle} />
                <Text>FAQ</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FaEnvelope} />
                <Text>Contact Support</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Icon as={FaHistory} />
                <Text>My Tickets</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* FAQ Tab */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Frequently Asked Questions</Heading>
                </CardHeader>
                <CardBody>
                  <Accordion allowMultiple>
                    {faqData.map((faq, index) => (
                      <AccordionItem key={index}>
                        <AccordionButton py={4}>
                          <Box flex="1" textAlign="left">
                            <Text fontWeight="medium">{faq.question}</Text>
                            <Badge size="sm" colorScheme="blue" mt={1}>
                              {faq.category}
                            </Badge>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <Text color="gray.700">{faq.answer}</Text>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Contact Support Tab */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Contact Support</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Can't find what you're looking for? Send us a message and we'll get back to you.
                  </Text>
                </CardHeader>
                <CardBody>
                  <form onSubmit={handleSubmit}>
                    <VStack spacing={4} align="stretch">
                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                        <FormControl isRequired>
                          <FormLabel>Category</FormLabel>
                          <Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            placeholder="Select a category"
                          >
                            {contactCategories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Order Reference (if applicable)</FormLabel>
                          <Input
                            value={orderRef}
                            onChange={(e) => setOrderRef(e.target.value)}
                            placeholder="e.g., SV077353305"
                          />
                        </FormControl>
                      </Grid>

                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                        <FormControl isRequired>
                          <FormLabel>Email</FormLabel>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Phone (optional)</FormLabel>
                          <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                        </FormControl>
                      </Grid>

                      <FormControl isRequired>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Please describe your issue or question in detail..."
                          rows={6}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Attachments (optional)</FormLabel>
                        <Input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          Accepted formats: PDF, JPG, PNG, DOC (max 5 files, 10MB each)
                        </Text>
                      </FormControl>

                      {attachments.length > 0 && (
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>
                            Attached files:
                          </Text>
                          <VStack align="stretch" spacing={2}>
                            {attachments.map((file, index) => (
                              <HStack key={index} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                                <HStack>
                                  <Icon as={FaPaperclip} color="gray.500" />
                                  <Text fontSize="sm">{file.name}</Text>
                                  <Text fontSize="xs" color="gray.500">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </Text>
                                </HStack>
                                <IconButton
                                  size="sm"
                                  icon={<FaCheckCircle />}
                                  aria-label="Remove file"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => removeAttachment(index)}
                                />
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      <Button
                        type="submit"
                        colorScheme="blue"
                        size="lg"
                        isLoading={isSubmitting}
                        loadingText="Submitting..."
                      >
                        Submit Support Request
                      </Button>
                    </VStack>
                  </form>
                </CardBody>
              </Card>
            </TabPanel>

            {/* My Tickets Tab */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">My Support Tickets</Heading>
                  <Text fontSize="sm" color="gray.600">
                    View and track your support requests
                  </Text>
                </CardHeader>
                <CardBody>
                  {isLoadingTickets ? (
                    <Box textAlign="center" py={8}>
                      <Spinner size="lg" />
                      <Text mt={4}>Loading your tickets...</Text>
                    </Box>
                  ) : supportTickets.length === 0 ? (
                    <Box textAlign="center" py={8}>
                      <Icon as={FaEnvelope} boxSize={12} color="gray.300" mb={4} />
                      <Text fontSize="lg" color="gray.500" mb={2}>
                        No support tickets yet
                      </Text>
                      <Text color="gray.400">
                        When you submit a support request, it will appear here.
                      </Text>
                    </Box>
                  ) : (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Ticket ID</Th>
                          <Th>Category</Th>
                          <Th>Status</Th>
                          <Th>Priority</Th>
                          <Th>Created</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {supportTickets.map((ticket) => (
                          <Tr key={ticket.id}>
                            <Td>
                              <Text fontWeight="medium">#{ticket.id.slice(-8)}</Text>
                              {ticket.orderRef && (
                                <Text fontSize="sm" color="gray.500">
                                  Order: {ticket.orderRef}
                                </Text>
                              )}
                            </Td>
                            <Td>{ticket.category}</Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(ticket.status)}>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontSize="sm">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(ticket.createdAt).toLocaleTimeString()}
                              </Text>
                            </Td>
                            <Td>
                              <Button size="sm" leftIcon={<FaEye />} variant="outline">
                                View
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Additional Help */}
        <Card>
          <CardHeader>
            <Heading size="md">Additional Resources</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Heading size="sm" mb={3}>Self-Service Options</Heading>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    <Link href="/customer-portal/orders" color="blue.500">
                      View your order history
                    </Link>
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    <Link href="/customer-portal/invoices" color="blue.500">
                      Download invoices and receipts
                    </Link>
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    <Link href="/customer-portal/settings" color="blue.500">
                      Update your account settings
                    </Link>
                  </ListItem>
                </List>
              </Box>
              <Box>
                <Heading size="sm" mb={3}>Business Hours</Heading>
                <Text fontSize="sm" color="gray.600">
                  <strong>Monday - Friday:</strong> 8:00 AM - 8:00 PM EST<br />
                  <strong>Saturday:</strong> 9:00 AM - 6:00 PM EST<br />
                  <strong>Sunday:</strong> 10:00 AM - 4:00 PM EST<br />
                  <br />
                  <strong>Emergency Support:</strong> 24/7 for active deliveries
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>

      {/* Email Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Email Support</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Email us directly</AlertTitle>
                  <AlertDescription>
                    Send an email to <strong>support@speedyvan.com</strong> with your inquiry.
                  </AlertDescription>
                </Box>
              </Alert>
              <Text fontSize="sm" color="gray.600">
                Please include:
              </Text>
              <List spacing={1} fontSize="sm">
                <ListItem>• Your order reference (if applicable)</ListItem>
                <ListItem>• A clear description of your issue</ListItem>
                <ListItem>• Any relevant screenshots or documents</ListItem>
                <ListItem>• Your preferred contact method</ListItem>
              </List>
              <Button colorScheme="blue" onClick={onClose}>
                Got it
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}


