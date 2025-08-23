import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Button, 
  FormControl, 
  FormLabel, 
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Badge,
  Divider,
  Icon,
  useToast,
  SimpleGrid,
  Image,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Flex,
  Spacer,
  Select
} from '@chakra-ui/react';
import { FaBox, FaArrowRight, FaArrowLeft, FaPlus, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import PricingDisplay from './PricingDisplay';
import { 
  ITEM_CATALOG, 
  ITEM_CATEGORIES, 
  getItemsByCategory, 
  getItemByKey,
  type CatalogItem 
} from '../../lib/pricing/item-catalog';

interface ItemSelectionStepProps {
  bookingData: any;
  updateBookingData: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function ItemSelectionStep({ 
  bookingData, 
  updateBookingData, 
  onNext, 
  onBack 
}: ItemSelectionStepProps) {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('furniture');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState(20);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!bookingData.items || bookingData.items.length === 0) {
      newErrors.items = 'Please add at least one item to move';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext?.();
    } else {
      toast({
        title: 'Please add at least one item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleItemClick = (item: CatalogItem) => {
    setSelectedItem(item);
    setItemQuantity(1);
    onOpen();
  };

  const addItem = () => {
    if (!selectedItem) return;

    const newItem = {
      key: selectedItem.key,
      name: selectedItem.name,
      quantity: itemQuantity,
      price: selectedItem.price,
      category: selectedItem.category,
      image: selectedItem.image
    };

    const updatedItems = [...(bookingData.items || []), newItem];
    updateBookingData({ items: updatedItems });

    // Reset and close modal
    setSelectedItem(null);
    setItemQuantity(1);
    onClose();

    toast({
      title: 'Item Added',
      description: `${selectedItem.name} has been added to your list`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const addCustomItem = () => {
    if (!customItemName.trim()) {
      toast({
        title: 'Please enter a custom item name',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newItem = {
      key: 'custom',
      name: customItemName,
      quantity: itemQuantity,
      price: customItemPrice,
      category: 'misc',
      image: '/items/misc/add_custom.svg'
    };

    const updatedItems = [...(bookingData.items || []), newItem];
    updateBookingData({ items: updatedItems });

    // Reset form
    setCustomItemName('');
    setCustomItemPrice(20);
    setItemQuantity(1);
    onClose();

    toast({
      title: 'Custom Item Added',
      description: `${customItemName} has been added to your list`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = bookingData.items.filter((_: any, i: number) => i !== index);
    updateBookingData({ items: updatedItems });
  };

  const getTotalItems = () => {
    return bookingData.items?.reduce((total: number, item: any) => {
      return total + item.quantity;
    }, 0) || 0;
  };

  const getTotalValue = () => {
    return bookingData.items?.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity);
    }, 0) || 0;
  };

  // Filter items based on search and category
  const filteredItems = ITEM_CATALOG.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderItemCard = (item: CatalogItem) => (
    <Card 
      key={item.key} 
      cursor="pointer" 
      onClick={() => handleItemClick(item)}
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
        </VStack>
      </CardBody>
    </Card>
  );

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="blue.600">
            Step 3: Items to Move
          </Text>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Select the items you need to move from our catalog
          </Text>
        </Box>

        {/* Search and Filter */}
        <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
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
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
              {filteredItems.map(renderItemCard)}
            </SimpleGrid>
          ) : (
            <Box p={8} textAlign="center" bg="gray.50" borderRadius="md">
              <Icon as={FaBox} color="gray.400" boxSize={12} mb={4} />
              <Text color="gray.500" fontSize="lg">No items found</Text>
              <Text color="gray.400" fontSize="sm">Try adjusting your search or category filter</Text>
            </Box>
          )}
        </Box>

        {/* Selected Items */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold">
              Selected Items
            </Text>
            <HStack spacing={4}>
              <Badge colorScheme="green" fontSize="md" p={2}>
                {getTotalItems()} items
              </Badge>
              <Badge colorScheme="purple" fontSize="md" p={2}>
                £{getTotalValue().toFixed(2)}
              </Badge>
            </HStack>
          </HStack>

          {bookingData.items && bookingData.items.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {bookingData.items.map((item: any, index: number) => (
                <HStack
                  key={index}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  bg="white"
                  justify="space-between"
                  shadow="sm"
                >
                  <HStack spacing={4}>
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      boxSize="40px"
                      fallbackSrc="/items/misc/add_custom.svg"
                    />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">{item.name}</Text>
                      <HStack spacing={2}>
                        <Badge colorScheme="green">Qty: {item.quantity}</Badge>
                        <Badge colorScheme="blue">£{item.price} each</Badge>
                        <Badge colorScheme="purple">£{(item.price * item.quantity).toFixed(2)}</Badge>
                      </HStack>
                    </VStack>
                  </HStack>
                  <IconButton
                    aria-label="Remove item"
                    icon={<FaTrash />}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                  />
                </HStack>
              ))}
            </VStack>
          ) : (
            <Box p={4} textAlign="center" bg="gray.50" borderRadius="md">
              <Icon as={FaBox} color="gray.400" boxSize={8} mb={2} />
              <Text color="gray.500">No items added yet</Text>
            </Box>
          )}
        </Box>

        {errors.items && (
          <Text color="red.500" fontSize="sm">
            {errors.items}
          </Text>
        )}

        {/* Pricing Display */}
        <PricingDisplay bookingData={bookingData} compact={true} />

        {/* Navigation Buttons */}
        <HStack spacing={4} justify="space-between" pt={4}>
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            leftIcon={<FaArrowLeft />}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            variant="primary"
            size="lg"
            rightIcon={<FaArrowRight />}
          >
            Continue to Schedule
          </Button>
        </HStack>
      </VStack>

      {/* Add Item Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedItem ? `Add ${selectedItem.name}` : 'Add Custom Item'}
          </ModalHeader>
          <ModalBody>
            {selectedItem ? (
              <VStack spacing={4}>
                <Box textAlign="center">
                  <Image 
                    src={selectedItem.image} 
                    alt={selectedItem.name}
                    boxSize="80px"
                    mx="auto"
                    mb={3}
                    fallbackSrc="/items/misc/add_custom.svg"
                  />
                  <Text fontSize="lg" fontWeight="semibold">{selectedItem.name}</Text>
                  <Text fontSize="sm" color="gray.600">{selectedItem.description}</Text>
                  <Badge colorScheme="green" fontSize="md" mt={2}>£{selectedItem.price}</Badge>
                </Box>
                
                <FormControl>
                  <FormLabel>Quantity</FormLabel>
                  <NumberInput
                    min={1}
                    max={20}
                    value={itemQuantity}
                    onChange={(value) => setItemQuantity(parseInt(value) || 1)}
                    size="lg"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <Box p={3} bg="blue.50" borderRadius="md" w="full">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Total Price:</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      £{(selectedItem.price * itemQuantity).toFixed(2)}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            ) : (
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Custom Item Name</FormLabel>
                  <Input
                    placeholder="e.g., Piano, Large Mirror, Antique Clock"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    size="lg"
                  />
                </FormControl>
                
                <HStack spacing={4} w="full">
                  <FormControl>
                    <FormLabel>Quantity</FormLabel>
                    <NumberInput
                      min={1}
                      max={20}
                      value={itemQuantity}
                      onChange={(value) => setItemQuantity(parseInt(value) || 1)}
                      size="lg"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Price (£)</FormLabel>
                    <NumberInput
                      min={5}
                      max={500}
                      value={customItemPrice}
                      onChange={(value) => setCustomItemPrice(parseFloat(value) || 20)}
                      size="lg"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>

                <Box p={3} bg="blue.50" borderRadius="md" w="full">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Total Price:</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      £{(customItemPrice * itemQuantity).toFixed(2)}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={selectedItem ? addItem : addCustomItem}
              leftIcon={<FaPlus />}
            >
              Add Item
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
