'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Button, 
  Input, 
  FormControl, 
  FormLabel,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Icon,
  Spinner,
  SimpleGrid,
  Image,
  Card,
  CardBody,
  CardHeader,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider
} from '@chakra-ui/react';
import { FaBox, FaSearch, FaFilter, FaCheckCircle, FaInfoCircle, FaFlask, FaPoundSign } from 'react-icons/fa';
import { 
  ITEM_CATALOG, 
  ITEM_CATEGORIES, 
  getItemsByCategory, 
  getItemByKey,
  type CatalogItem 
} from '../../lib/pricing/item-catalog';

export default function TestItemCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Array<{item: CatalogItem, quantity: number}>>([]);
  const [testResults, setTestResults] = useState<any>(null);
  
  const toast = useToast();

  // Filter items based on search and category
  const filteredItems = ITEM_CATALOG.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addItemToTest = (item: CatalogItem) => {
    const existingItem = selectedItems.find(selected => selected.item.key === item.key);
    
    if (existingItem) {
      setSelectedItems(selectedItems.map(selected => 
        selected.item.key === item.key 
          ? { ...selected, quantity: selected.quantity + 1 }
          : selected
      ));
    } else {
      setSelectedItems([...selectedItems, { item, quantity: 1 }]);
    }

    toast({
      title: 'Item Added',
      description: `${item.name} added to test list`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const removeItemFromTest = (itemKey: string) => {
    setSelectedItems(selectedItems.filter(selected => selected.item.key !== itemKey));
  };

  const updateItemQuantity = (itemKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromTest(itemKey);
    } else {
      setSelectedItems(selectedItems.map(selected => 
        selected.item.key === itemKey 
          ? { ...selected, quantity }
          : selected
      ));
    }
  };

  const getTotalItems = () => {
    return selectedItems.reduce((total, selected) => total + selected.quantity, 0);
  };

  const getTotalValue = () => {
    return selectedItems.reduce((total, selected) => 
      total + (selected.item.price * selected.quantity), 0
    );
  };

  const testPricing = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please add some items to test pricing',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('/api/pricing/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          miles: 25,
          items: selectedItems.map(selected => ({
            key: selected.item.key,
            quantity: selected.quantity
          })),
          workersTotal: 2,
          pickup: { floors: 1, hasLift: false },
          dropoff: { floors: 1, hasLift: true },
          vatRegistered: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get pricing quote');
      }

      const data = await response.json();
      
      setTestResults({
        success: true,
        data: data,
        selectedItems: selectedItems
      });

      toast({
        title: 'Pricing Test Successful!',
        description: `Total: £${data.totalGBP}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error testing pricing:', error);
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: 'Pricing Test Failed',
        description: 'There was an issue testing the pricing system.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const renderItemCard = (item: CatalogItem) => (
    <Card 
      key={item.key} 
      cursor="pointer" 
      onClick={() => addItemToTest(item)}
      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
      transition="all 0.2s"
      border="1px"
      borderColor="gray.200"
    >
      <CardHeader p={3}>
        <Box textAlign="center">
          <Image 
            src={item.image} 
            alt={item.name}
            boxSize="60px"
            mx="auto"
            mb={2}
            fallbackSrc="/items/misc/add_custom.svg"
          />
          <Text fontSize="sm" fontWeight="semibold" noOfLines={2}>
            {item.name}
          </Text>
        </Box>
      </CardHeader>
      
      <CardBody p={3} pt={0}>
        <VStack spacing={2}>
          <Badge colorScheme="green" fontSize="xs">
            £{item.price}
          </Badge>
          <Text fontSize="xs" color="gray.600" textAlign="center" noOfLines={2}>
            {item.description}
          </Text>
          <Badge colorScheme="blue" fontSize="xs">
            {item.category}
          </Badge>
        </VStack>
      </CardBody>
    </Card>
  );

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="7xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Icon as={FaFlask} boxSize={16} color="blue.500" mb={4} />
            <Heading size="2xl" color="blue.600" mb={4}>
              Item Catalog Test
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Test the new item catalog with images, prices, and categories
            </Text>
          </Box>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Stat p={4} bg="white" borderRadius="lg" shadow="sm">
              <StatLabel>Total Items</StatLabel>
              <StatNumber>{ITEM_CATALOG.length}</StatNumber>
              <StatHelpText>In catalog</StatHelpText>
            </Stat>
            <Stat p={4} bg="white" borderRadius="lg" shadow="sm">
              <StatLabel>Categories</StatLabel>
              <StatNumber>{ITEM_CATEGORIES.length}</StatNumber>
              <StatHelpText>Available</StatHelpText>
            </Stat>
            <Stat p={4} bg="white" borderRadius="lg" shadow="sm">
              <StatLabel>Selected Items</StatLabel>
              <StatNumber>{getTotalItems()}</StatNumber>
              <StatHelpText>For testing</StatHelpText>
            </Stat>
            <Stat p={4} bg="white" borderRadius="lg" shadow="sm">
              <StatLabel>Total Value</StatLabel>
              <StatNumber>£{getTotalValue().toFixed(2)}</StatNumber>
              <StatHelpText>Selected items</StatHelpText>
            </Stat>
          </SimpleGrid>

          {/* Main Content */}
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>Browse Items</Tab>
              <Tab>Test Pricing</Tab>
              <Tab>Results</Tab>
            </TabList>

            <TabPanels>
              {/* Browse Items Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Search and Filter */}
                  <Box p={4} bg="white" borderRadius="lg" shadow="sm">
                    <VStack spacing={4}>
                      <HStack w="full">
                        <Box flex={1}>
                          <FormLabel fontSize="sm">Search Items</FormLabel>
                          <HStack>
                            <Icon as={FaSearch} color="gray.400" />
                            <Input
                              placeholder="Search for items..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              size="md"
                            />
                          </HStack>
                        </Box>
                        <Box>
                          <FormLabel fontSize="sm">Category</FormLabel>
                          <Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            size="md"
                          >
                            <option value="all">All Categories</option>
                            {ITEM_CATEGORIES.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.icon} {category.name}
                              </option>
                            ))}
                          </Select>
                        </Box>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Items Grid */}
                  <Box>
                    <HStack justify="space-between" mb={4}>
                      <Text fontSize="lg" fontWeight="semibold">
                        Available Items
                      </Text>
                      <Badge colorScheme="blue" fontSize="md" p={2}>
                        {filteredItems.length} items found
                      </Badge>
                    </HStack>

                    {filteredItems.length > 0 ? (
                      <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={4}>
                        {filteredItems.map(renderItemCard)}
                      </SimpleGrid>
                    ) : (
                      <Box p={8} textAlign="center" bg="white" borderRadius="lg" shadow="sm">
                        <Icon as={FaBox} color="gray.400" boxSize={12} mb={4} />
                        <Text color="gray.500" fontSize="lg">No items found</Text>
                        <Text color="gray.400" fontSize="sm">Try adjusting your search or category filter</Text>
                      </Box>
                    )}
                  </Box>
                </VStack>
              </TabPanel>

              {/* Test Pricing Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Box p={4} bg="white" borderRadius="lg" shadow="sm">
                    <VStack spacing={4}>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="lg" fontWeight="semibold">
                          Selected Items for Testing
                        </Text>
                        <Button
                          onClick={testPricing}
                          variant="primary"
                          leftIcon={<FaPoundSign />}
                          isDisabled={selectedItems.length === 0}
                        >
                          Test Pricing
                        </Button>
                      </HStack>

                      {selectedItems.length > 0 ? (
                        <VStack spacing={3} align="stretch" w="full">
                          {selectedItems.map((selected, index) => (
                            <HStack
                              key={selected.item.key}
                              p={4}
                              borderWidth="1px"
                              borderRadius="md"
                              bg="gray.50"
                              justify="space-between"
                            >
                              <HStack spacing={4}>
                                <Image 
                                  src={selected.item.image} 
                                  alt={selected.item.name}
                                  boxSize="40px"
                                  fallbackSrc="/items/misc/add_custom.svg"
                                />
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="semibold">{selected.item.name}</Text>
                                  <HStack spacing={2}>
                                    <Badge colorScheme="green">£{selected.item.price} each</Badge>
                                    <Badge colorScheme="blue">{selected.item.category}</Badge>
                                  </HStack>
                                </VStack>
                              </HStack>
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  onClick={() => updateItemQuantity(selected.item.key, selected.quantity - 1)}
                                >
                                  -
                                </Button>
                                <Text fontWeight="bold" minW="20px" textAlign="center">
                                  {selected.quantity}
                                </Text>
                                <Button
                                  size="sm"
                                  onClick={() => updateItemQuantity(selected.item.key, selected.quantity + 1)}
                                >
                                  +
                                </Button>
                                <Badge colorScheme="purple">
                                  £{(selected.item.price * selected.quantity).toFixed(2)}
                                </Badge>
                              </HStack>
                            </HStack>
                          ))}
                        </VStack>
                      ) : (
                        <Box p={8} textAlign="center" bg="gray.50" borderRadius="md">
                          <Icon as={FaBox} color="gray.400" boxSize={8} mb={2} />
                          <Text color="gray.500">No items selected</Text>
                          <Text color="gray.400" fontSize="sm">Go to Browse Items to add items for testing</Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Results Tab */}
              <TabPanel>
                {testResults ? (
                  <Box p={6} bg="white" borderRadius="lg" shadow="sm">
                    <Alert status={testResults.success ? "success" : "error"} borderRadius="lg" mb={6}>
                      <AlertIcon />
                      <Box>
                        <AlertTitle>
                          {testResults.success ? "Pricing Test Passed" : "Pricing Test Failed"}
                        </AlertTitle>
                        <AlertDescription>
                          {testResults.success 
                            ? `Total price: £${testResults.data.totalGBP}`
                            : testResults.error
                          }
                        </AlertDescription>
                      </Box>
                    </Alert>

                    {testResults.success && testResults.data && (
                      <VStack spacing={6} align="stretch">
                        <Box>
                          <Heading size="md" mb={4}>Pricing Breakdown</Heading>
                          <VStack spacing={2} align="stretch">
                            <HStack justify="space-between">
                              <Text>Base Rate:</Text>
                              <Text fontWeight="semibold">£{testResults.data.breakdown.baseRate}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Distance Cost:</Text>
                              <Text fontWeight="semibold">£{testResults.data.breakdown.distanceCost}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Items Cost:</Text>
                              <Text fontWeight="semibold">£{testResults.data.breakdown.itemsCost}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Workers Cost:</Text>
                              <Text fontWeight="semibold">£{testResults.data.breakdown.workersCost}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Stairs Cost:</Text>
                              <Text fontWeight="semibold">£{testResults.data.breakdown.stairsCost}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>Extras Cost:</Text>
                              <Text fontWeight="semibold">£{testResults.data.breakdown.extrasCost}</Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between">
                              <Text fontWeight="bold">Subtotal:</Text>
                              <Text fontWeight="bold">£{testResults.data.breakdown.subtotal}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text>VAT (20%):</Text>
                              <Text fontWeight="semibold">£{testResults.data.breakdown.vat}</Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text fontSize="lg" fontWeight="bold" color="blue.600">Total:</Text>
                              <Text fontSize="lg" fontWeight="bold" color="blue.600">£{testResults.data.breakdown.total}</Text>
                            </HStack>
                          </VStack>
                        </Box>

                        <Box>
                          <Heading size="md" mb={4}>Test Items Used</Heading>
                          <VStack spacing={2} align="stretch">
                            {testResults.selectedItems.map((selected: any) => (
                              <HStack key={selected.item.key} justify="space-between">
                                <Text>{selected.item.name} (x{selected.quantity})</Text>
                                <Text fontWeight="semibold">£{(selected.item.price * selected.quantity).toFixed(2)}</Text>
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      </VStack>
                    )}
                  </Box>
                ) : (
                  <Box p={8} textAlign="center" bg="white" borderRadius="lg" shadow="sm">
                    <Icon as={FaInfoCircle} color="gray.400" boxSize={12} mb={4} />
                    <Text color="gray.500" fontSize="lg">No test results yet</Text>
                    <Text color="gray.400" fontSize="sm">Go to Test Pricing to run a pricing test</Text>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Information */}
          <Box p={6} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
            <VStack spacing={4} align="start">
              <HStack>
                <Icon as={FaInfoCircle} color="blue.500" />
                <Text fontWeight="semibold" color="blue.700">Catalog Features:</Text>
              </HStack>
              <Text fontSize="sm" color="blue.600">
                • <strong>Realistic UK Pricing:</strong> Based on average moving company rates
              </Text>
              <Text fontSize="sm" color="blue.600">
                • <strong>Visual Catalog:</strong> Images for each item with descriptions
              </Text>
              <Text fontSize="sm" color="blue.600">
                • <strong>Category Organization:</strong> Furniture, Appliances, Electronics, etc.
              </Text>
              <Text fontSize="sm" color="blue.600">
                • <strong>Search & Filter:</strong> Find items quickly by name or category
              </Text>
              <Text fontSize="sm" color="blue.600">
                • <strong>Quantity Management:</strong> Add multiple quantities of each item
              </Text>
              <Text fontSize="sm" color="blue.600">
                • <strong>Pricing Integration:</strong> Seamlessly integrated with pricing engine
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
