'use client';

import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Select,
  Textarea,
  Card,
  Badge,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Link,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';

export default function NeonDarkDesignTest() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={12} align="stretch">
        {/* Logo Showcase */}
        <Card p={8}>
          <Heading as="h2" size="xl" color="text.primary" mb={6}>
            Speedy Van Logo Suite
          </Heading>
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Text fontSize="lg" color="text.secondary" mb={4}>
                Primary Logo - Dark Background
              </Text>
              <img 
                src="/logo/speedy-van-logo-dark.svg" 
                alt="Speedy Van Logo Dark" 
                width="240" 
                height="80"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Box>
            
            <Box textAlign="center">
              <Text fontSize="lg" color="text.secondary" mb={4}>
                App Icon
              </Text>
              <img 
                src="/logo/speedy-van-icon.svg" 
                alt="Speedy Van Icon" 
                width="64" 
                height="64"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Box>
            
            <Box textAlign="center">
              <Text fontSize="lg" color="text.secondary" mb={4}>
                Minimal Icon
              </Text>
              <img 
                src="/logo/speedy-van-minimal-icon.svg" 
                alt="Speedy Van Minimal Icon" 
                width="48" 
                height="48"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Box>
          </VStack>
        </Card>

        {/* Hero Section */}
        <Box textAlign="center" py={16}>
          <Heading as="h1" size="2xl" color="text.primary" mb={6}>
            Neon Dark Design Language
          </Heading>
          <Text fontSize="xl" color="text.secondary" mb={8}>
            Speedy Van's premium design system featuring neon accents and dark surfaces
          </Text>
          <HStack spacing={4} justify="center">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </HStack>
        </Box>

        {/* Button Variants */}
        <Card p={8}>
          <Heading as="h2" size="xl" color="text.primary" mb={6}>
            Button Variants
          </Heading>
          <VStack spacing={6} align="stretch">
            <HStack spacing={4} wrap="wrap">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </HStack>
            <HStack spacing={4} wrap="wrap">
              <Button variant="primary" size="sm">Small Primary</Button>
              <Button variant="primary" size="lg">Large Primary</Button>
              <Button variant="outline" size="sm">Small Outline</Button>
              <Button variant="outline" size="lg">Large Outline</Button>
            </HStack>
          </VStack>
        </Card>

        {/* Form Elements */}
        <Card p={8}>
          <Heading as="h2" size="xl" color="text.primary" mb={6}>
            Form Elements
          </Heading>
          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel>Text Input</FormLabel>
              <Input placeholder="Enter your text here..." />
            </FormControl>
            
            <FormControl>
              <FormLabel>Select Dropdown</FormLabel>
              <Select placeholder="Choose an option">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Textarea</FormLabel>
              <Textarea placeholder="Enter your message here..." />
            </FormControl>
            
            <HStack spacing={4}>
              <Button variant="primary">Submit</Button>
              <Button variant="outline">Cancel</Button>
            </HStack>
          </VStack>
        </Card>

        {/* Cards and Surfaces */}
        <Card p={8}>
          <Heading as="h2" size="xl" color="text.primary" mb={6}>
            Cards and Surfaces
          </Heading>
          <HStack spacing={6} align="stretch">
            <Card variant="elevated" p={6} flex={1}>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="text.primary">Elevated Card</Heading>
                <Text color="text.secondary">
                  This card has an elevated surface with enhanced neon glow effects.
                </Text>
                <Button variant="primary" size="sm">Action</Button>
              </VStack>
            </Card>
            
            <Card variant="interactive" p={6} flex={1} cursor="pointer">
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="text.primary">Interactive Card</Heading>
                <Text color="text.secondary">
                  Hover over this card to see the interactive effects.
                </Text>
                <Button variant="outline" size="sm">Action</Button>
              </VStack>
            </Card>
          </HStack>
        </Card>

        {/* Badges and Status */}
        <Card p={8}>
          <Heading as="h2" size="xl" color="text.primary" mb={6}>
            Badges and Status
          </Heading>
          <HStack spacing={4} wrap="wrap">
            <Badge variant="solid">Primary Badge</Badge>
            <Badge variant="outline">Outline Badge</Badge>
            <Badge variant="subtle">Subtle Badge</Badge>
            <Badge colorScheme="green">Success</Badge>
            <Badge colorScheme="red">Error</Badge>
            <Badge colorScheme="yellow">Warning</Badge>
            <Badge colorScheme="blue">Info</Badge>
          </HStack>
        </Card>

        {/* Table */}
        <Card p={8}>
          <Heading as="h2" size="xl" color="text.primary" mb={6}>
            Data Table
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Status</Th>
                <Th>Amount</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>John Doe</Td>
                <Td><Badge colorScheme="green">Active</Badge></Td>
                <Td>£150.00</Td>
                <Td>
                  <Button variant="ghost" size="sm">View</Button>
                </Td>
              </Tr>
              <Tr>
                <Td>Jane Smith</Td>
                <Td><Badge colorScheme="yellow">Pending</Badge></Td>
                <Td>£75.50</Td>
                <Td>
                  <Button variant="ghost" size="sm">View</Button>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Card>

        {/* Modal Demo */}
        <Card p={8}>
          <Heading as="h2" size="xl" color="text.primary" mb={6}>
            Modal Component
          </Heading>
          <Button variant="primary" onClick={onOpen}>
            Open Modal
          </Button>
          
          <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Neon Dark Modal</ModalHeader>
              <ModalBody>
                <Text color="text.secondary">
                  This modal showcases the Neon Dark design language with neon borders and dark surfaces.
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={onClose}>
                  Confirm
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Card>

        {/* Links and Navigation */}
        <Card p={8}>
          <Heading as="h2" size="xl" color="text.primary" mb={6}>
            Links and Navigation
          </Heading>
          <VStack spacing={4} align="stretch">
            <Link href="#" variant="nav">Navigation Link</Link>
            <Link href="#" variant="nav">Another Nav Link</Link>
            <Link href="#" variant="nav">Third Nav Link</Link>
          </VStack>
        </Card>

        {/* Responsive Breakpoints */}
        <Card p={8}>
          <Heading as="h2" size="xl" color="text.primary" mb={6}>
            Responsive Design
          </Heading>
          <VStack spacing={4} align="stretch">
            <Text color="text.secondary">
              <strong>Mobile (≤420px):</strong> Single column layout, buttons ≥44px tall
            </Text>
            <Text color="text.secondary">
              <strong>Tablet (700px):</strong> Form layouts optimized for touch
            </Text>
            <Text color="text.secondary">
              <strong>Desktop (≥1280px):</strong> Full container width with optimal spacing
            </Text>
          </VStack>
        </Card>

        {/* Color Palette */}
        <Card p={8}>
          <Heading as="h2" size="xl" color="text.primary" mb={6}>
            Color Palette
          </Heading>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontWeight="semibold" color="text.primary" mb={3}>Neon Colors</Text>
              <HStack spacing={2} wrap="wrap">
                <Box w="60px" h="40px" bg="neon.500" borderRadius="md" />
                <Box w="60px" h="40px" bg="neon.400" borderRadius="md" />
                <Box w="60px" h="40px" bg="neon.600" borderRadius="md" />
              </HStack>
            </Box>
            
            <Box>
              <Text fontWeight="semibold" color="text.primary" mb={3}>Brand Colors</Text>
              <HStack spacing={2} wrap="wrap">
                <Box w="60px" h="40px" bg="brand.500" borderRadius="md" />
                <Box w="60px" h="40px" bg="brand.400" borderRadius="md" />
                <Box w="60px" h="40px" bg="brand.600" borderRadius="md" />
              </HStack>
            </Box>
            
            <Box>
              <Text fontWeight="semibold" color="text.primary" mb={3}>Surface Colors</Text>
              <HStack spacing={2} wrap="wrap">
                <Box w="60px" h="40px" bg="bg.surface" borderRadius="md" border="1px solid" borderColor="border.primary" />
                <Box w="60px" h="40px" bg="bg.surface.elevated" borderRadius="md" border="1px solid" borderColor="border.primary" />
                <Box w="60px" h="40px" bg="bg.input" borderRadius="md" border="1px solid" borderColor="border.primary" />
              </HStack>
            </Box>
          </VStack>
        </Card>
      </VStack>
    </Container>
  );
}
