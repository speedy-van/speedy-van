import React, { useState, useEffect } from 'react';
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
  Select,
  Spinner,
} from '@chakra-ui/react';
import {
  FaBox,
  FaArrowRight,
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaSearch,
  FaFilter,
} from 'react-icons/fa';
import PricingDisplay from './PricingDisplay';
import BookingNavigationButtons from './BookingNavigationButtons';

// Define the API catalog item interface
interface APICatalogItem {
  id: string;
  canonicalName: string;
  category: string;
  synonyms: string;
  volumeFactor: number;
  requiresTwoPerson: boolean;
  isFragile: boolean;
  requiresDisassembly: boolean;
  basePriceHint: number;
}

// Define the component catalog item interface
interface CatalogItem {
  key: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  size: 'small' | 'medium' | 'large';
}

const ITEM_CATEGORIES = [
  {
    id: 'sofas',
    name: 'Sofas & Chairs',
    icon: '🪑',
    description: 'Sofas, chairs, and seating furniture',
  },
  {
    id: 'beds',
    name: 'Beds & Bedroom',
    icon: '🛏️',
    description: 'Beds, mattresses, and bedroom furniture',
  },
  {
    id: 'tables',
    name: 'Tables & Desks',
    icon: '🪑',
    description: 'Dining tables, desks, and work surfaces',
  },
  {
    id: 'storage',
    name: 'Storage & Cabinets',
    icon: '🗄️',
    description: 'Wardrobes, cabinets, and storage units',
  },
  {
    id: 'appliances',
    name: 'Appliances',
    icon: '🔌',
    description: 'Kitchen and home appliances',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '💻',
    description: 'Computers, TVs, and electronic devices',
  },
  {
    id: 'outdoor',
    name: 'Outdoor & Garden',
    icon: '🌿',
    description: 'Garden furniture and outdoor items',
  },
  {
    id: 'sports',
    name: 'Sports & Music',
    icon: '🎵',
    description: 'Sports equipment and musical instruments',
  },
  {
    id: 'boxes',
    name: 'Boxes & Containers',
    icon: '📦',
    description: 'Moving boxes and storage containers',
  },
  {
    id: 'misc',
    name: 'Miscellaneous',
    icon: '📋',
    description: 'Other items and custom objects',
  },
];

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
  onBack,
}: ItemSelectionStepProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('sofas');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState(20);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch catalog data from API
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/pricing/catalog');
        if (!response.ok) {
          throw new Error('Failed to fetch catalog');
        }
        const apiItems: APICatalogItem[] = await response.json();

        // Transform API items to component format
        const transformedItems: CatalogItem[] = apiItems.map(item => {
          // Map item IDs to available image files
          const imageMap: { [key: string]: string } = {
            'armchair-1seat': '/items/armchair.png',
            'sofa-2seat': '/items/sofa.png',
            'sofa-3seat': '/items/sofa.png',
            'sofa-4seat': '/items/sofa.png',
            'sofa-corner': '/items/sofa.png',
            recliner: '/items/armchair.png',
            'sofa-bed': '/items/sofa.png',
            loveseat: '/items/sofa.png',
            chesterfield: '/items/sofa.png',
            'bed-single': '/items/bed.png',
            'bed-double': '/items/bed.png',
            'bed-king': '/items/bed.png',
            'bed-superking': '/items/bed.png',
            'bed-frame': '/items/bed_frame.png',
            'mattress-single': '/items/mattress.png',
            'mattress-double': '/items/mattress.png',
            'mattress-king': '/items/mattress.png',
            wardrobe: '/items/wardrobe.png',
            'chest-drawers': '/items/filing_cabinet.png',
            bookshelf: '/items/bookshelf.png',
            bookcase: '/items/book_shelf.png',
            'dining-table': '/items/dining_table.png',
            'coffee-table': '/items/coffee_table.png',
            'side-table': '/items/small_table.png',
            desk: '/items/desk.png',
            'office-chair': '/items/office_chair.png',
            'dining-chairs': '/items/chairs.png',
            chair: '/items/chair.png',
            fridge: '/items/refrigerator.png',
            freezer: '/items/fridge_freezer.png',
            'washing-machine': '/items/washer.png',
            dryer: '/items/dryer.png',
            dishwasher: '/items/dishwasher.png',
            oven: '/items/oven.png',
            microwave: '/items/microwave.png',
            kettle: '/items/kettle.png',
            toaster: '/items/toaster.png',
            'vacuum-cleaner': '/items/vacuum_cleaner.png',
            tv: '/items/tv.png',
            television: '/items/television.png',
            computer: '/items/computer.png',
            monitor: '/items/computer_monitor.png',
            printer: '/items/printer_scanner.png',
            piano: '/items/piano.png',
            bicycle: '/items/bicycle.png',
            treadmill: '/items/treadmill.png',
            mirror: '/items/mirror.png',
            lamp: '/items/lamp.png',
            'box-small': '/items/small-box.png',
            'box-medium': '/items/medium-box.png',
            'box-large': '/items/large-box.png',
            suitcase: '/items/suitcase.png',
            'plastic-bin': '/items/plastic_bin.png',
            'plant-pot': '/items/plant_pot.png',
            'painting-frame': '/items/painting_frame.png',
            'patio-chair': '/items/patio_chair.png',
            'garden-table': '/items/garden_table.png',
            'bbq-grill': '/items/bbq_grill.png',
            'lawn-mower': '/items/lawn_mower.png',
            'air-conditioner': '/items/air_conditioner.png',
            fan: '/items/fan.png',
            stove: '/items/stove.png',
            'mini-fridge': '/items/mini_fridge.png',
            'kitchen-cabinet': '/items/kitchen_cabinet.png',
            'filing-cabinet': '/items/filing_cabinet.png',
            whiteboard: '/items/whiteboard.png',
          };

          return {
            key: item.id,
            name: item.canonicalName,
            price: item.basePriceHint,
            category: item.category,
            image:
              imageMap[item.id] ||
              `/items/${item.category}.png` ||
              '/items/placeholder.svg',
            description: item.synonyms,
            size:
              item.volumeFactor <= 1
                ? 'small'
                : item.volumeFactor <= 2
                  ? 'medium'
                  : 'large',
          };
        });

        setCatalogItems(transformedItems);
      } catch (error) {
        console.error('Error fetching catalog:', error);
        toast({
          title: 'Error loading catalog',
          description: 'Please refresh the page to try again',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [toast]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

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
    try {
      if (!item || !item.key) {
        console.error('Invalid item selected:', item);
        toast({
          title: 'Error',
          description: 'Invalid item selected. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setSelectedItem(item);
      setItemQuantity(1);
      onOpen();
    } catch (error) {
      console.error('Error handling item click:', error);
      toast({
        title: 'Error',
        description: 'Failed to select item. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const addItem = () => {
    try {
      if (!selectedItem || !selectedItem.key || !selectedItem.name) {
        console.error('Invalid selected item:', selectedItem);
        toast({
          title: 'Error',
          description: 'Invalid item data. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const newItem = {
        key: selectedItem.key,
        name: selectedItem.name,
        quantity: itemQuantity,
        price: selectedItem.price,
        category: selectedItem.category,
        image: selectedItem.image,
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
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
      image: '/items/misc/add_custom.svg',
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
    const updatedItems = bookingData.items.filter(
      (_: any, i: number) => i !== index
    );
    updateBookingData({ items: updatedItems });
  };

  const getTotalItems = () => {
    return (
      bookingData.items?.reduce((total: number, item: any) => {
        return total + item.quantity;
      }, 0) || 0
    );
  };

  const getTotalValue = () => {
    return (
      bookingData.items?.reduce((total: number, item: any) => {
        return total + item.price * item.quantity;
      }, 0) || 0
    );
  };

  // Filter items based on search and category
  const filteredItems = catalogItems.filter(item => {
    if (!item || !item.name) return false;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
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

  if (loading) {
    return (
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="xl"
        bg="bg.card"
        borderColor="border.primary"
        boxShadow="md"
        className="booking-step-card"
      >
        <VStack spacing={6} align="center" justify="center" minH="400px">
          <Spinner size="xl" color="neon.500" />
          <Text fontSize="lg" color="text.secondary">
            Loading catalog items...
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="xl"
      bg="bg.card"
      borderColor="border.primary"
      boxShadow="md"
      className="booking-step-card"
    >
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" color="neon.500">
            Step 3: Items to Move
          </Text>
          <Text fontSize="sm" color="text.secondary" mt={2}>
            Select the items you need to move from our catalog
          </Text>
        </Box>

        {/* Search and Filter */}
        <Box
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          bg="bg.surface"
          borderColor="border.primary"
        >
          <VStack spacing={4}>
            <HStack w="full">
              <Box flex={1}>
                <FormLabel fontSize="sm">Search Items</FormLabel>
                <HStack>
                  <Icon as={FaSearch} color="text.tertiary" />
                  <Input
                    placeholder="Search for items..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    size="md"
                  />
                </HStack>
              </Box>
              <Box>
                <FormLabel fontSize="sm">Category</FormLabel>
                <Select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
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
            <Badge colorScheme="neon" fontSize="md" p={2}>
              {filteredItems.length} items found
            </Badge>
          </HStack>

          {filteredItems.length > 0 ? (
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
              {filteredItems.map(renderItemCard)}
            </SimpleGrid>
          ) : (
            <Box textAlign="center" py={8}>
              <Icon as={FaBox} boxSize={12} color="text.tertiary" mb={4} />
              <Text color="text.secondary">
                No items found matching your search
              </Text>
            </Box>
          )}
        </Box>

        {/* Selected Items */}
        {bookingData.items && bookingData.items.length > 0 && (
          <Box>
            <HStack justify="space-between" mb={4}>
              <Text fontSize="lg" fontWeight="semibold">
                Selected Items ({bookingData.items.length})
              </Text>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<FaPlus />}
                onClick={onOpen}
              >
                Add More
              </Button>
            </HStack>

            <VStack spacing={3} align="stretch">
              {bookingData.items.map((item: any, index: number) => (
                <Box
                  key={index}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="bg.surface"
                  borderColor="border.primary"
                >
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Image
                        src={item.image || '/items/misc/add_custom.svg'}
                        alt={item.name}
                        boxSize="40px"
                        fallbackSrc="/items/misc/add_custom.svg"
                      />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">{item.name}</Text>
                        <Text fontSize="sm" color="text.tertiary">
                          Qty: {item.quantity} • £{item.price}
                        </Text>
                      </VStack>
                    </HStack>
                    <IconButton
                      aria-label="Remove item"
                      icon={<FaTrash />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => removeItem(index)}
                    />
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Add Item Button */}
        {(!bookingData.items || bookingData.items.length === 0) && (
          <Box textAlign="center" py={8}>
            <Button
              size="lg"
              variant="outline"
              leftIcon={<FaPlus />}
              onClick={onOpen}
            >
              Add Your First Item
            </Button>
          </Box>
        )}

        {/* Navigation Buttons */}
        <BookingNavigationButtons
          onNext={handleNext}
          onBack={onBack}
          nextText="Continue to Date & Time"
          nextDisabled={!bookingData.items || bookingData.items.length === 0}
          backVariant="secondary"
        />
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
                  <Text fontSize="lg" fontWeight="semibold">
                    {selectedItem.name}
                  </Text>
                  <Text fontSize="sm" color="text.secondary">
                    {selectedItem.description}
                  </Text>
                  <Badge colorScheme="brand" fontSize="md" mt={2}>
                    £{selectedItem.price}
                  </Badge>
                </Box>

                <FormControl>
                  <FormLabel>Quantity</FormLabel>
                  <NumberInput
                    min={1}
                    max={20}
                    value={itemQuantity}
                    onChange={value => setItemQuantity(parseInt(value) || 1)}
                    size="lg"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <Box
                  p={3}
                  bg="bg.surface"
                  borderRadius="md"
                  w="full"
                  borderWidth="1px"
                  borderColor="border.primary"
                >
                  <HStack justify="space-between">
                    <Text fontSize="sm">Total Price:</Text>
                    <Text fontSize="lg" fontWeight="bold" color="neon.500">
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
                    onChange={e => setCustomItemName(e.target.value)}
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
                      onChange={value => setItemQuantity(parseInt(value) || 1)}
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
                      onChange={value =>
                        setCustomItemPrice(parseFloat(value) || 20)
                      }
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

                <Box
                  p={3}
                  bg="bg.surface"
                  borderRadius="md"
                  w="full"
                  borderWidth="1px"
                  borderColor="border.primary"
                >
                  <HStack justify="space-between">
                    <Text fontSize="sm">Total Price:</Text>
                    <Text fontSize="lg" fontWeight="bold" color="neon.500">
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
