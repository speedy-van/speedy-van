import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Divider,
  Badge,
  Image,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Input,
  Textarea,
  useColorModeValue,
  Collapse,
  useDisclosure,
  Spacer
} from '@chakra-ui/react';
import { FaTrash, FaChevronDown, FaChevronUp, FaEye } from 'react-icons/fa';
import { SelectionPanelProps } from '../../types/image-selection';

const SelectionPanel: React.FC<SelectionPanelProps> = ({
  selections,
  images,
  onQuantityChange,
  onRemove,
  onCustomNotesChange,
  showCustomNotes = false
}) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Calculate totals
  const totalItems = Array.from(selections.values()).reduce((sum, selection) => sum + selection.quantity, 0);
  const totalUniqueItems = selections.size;

  const handleQuantityChange = (imageId: string, value: string) => {
    const numValue = parseInt(value) || 1;
    if (numValue > 0) {
      onQuantityChange(imageId, numValue);
    }
  };

  const handleRemove = (imageId: string) => {
    onRemove(imageId);
  };

  const handleCustomNotesChange = (imageId: string, notes: string) => {
    onCustomNotesChange(imageId, notes);
  };

  return (
    <Box
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      bg={bgColor}
      overflow="hidden"
    >
      {/* Header */}
      <Box
        p={4}
        bg="blue.50"
        borderBottom="1px solid"
        borderColor={borderColor}
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: 'blue.100' }}
        transition="background-color 0.2s"
      >
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Text fontSize="lg" fontWeight="semibold">
              Selected Items
            </Text>
            <Badge colorScheme="blue" variant="solid">
              {totalUniqueItems} items
            </Badge>
            <Badge colorScheme="green" variant="subtle">
              {totalItems} total
            </Badge>
          </HStack>
          
          <IconButton
            aria-label="Toggle selection panel"
            icon={isOpen ? <FaChevronUp /> : <FaChevronDown />}
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          />
        </HStack>
      </Box>

      {/* Content */}
      <Collapse in={isOpen}>
        <VStack spacing={0} align="stretch" maxH="400px" overflowY="auto">
          {Array.from(selections.entries()).map(([imageId, selection], index) => {
            const image = images.get(imageId);
            if (!image) return null;

            return (
              <Box key={imageId}>
                <HStack spacing={4} p={4} align="start">
                  {/* Image */}
                  <Box
                    position="relative"
                    width="60px"
                    height="60px"
                    borderRadius="md"
                    overflow="hidden"
                    flexShrink={0}
                    bg="gray.100"
                  >
                    <Image
                      src={image.path}
                      alt={image.name}
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover' }}
                    />
                  </Box>

                  {/* Content */}
                  <VStack align="start" flex={1} spacing={2}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="md" fontWeight="semibold" noOfLines={1}>
                        {image.name}
                      </Text>
                      {image.description && (
                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                          {image.description}
                        </Text>
                      )}
                    </VStack>

                    {/* Quantity and Actions */}
                    <HStack spacing={3} align="center" width="100%">
                      <VStack spacing={1} align="start">
                        <Text fontSize="xs" color="gray.500" fontWeight="medium">
                          Quantity
                        </Text>
                        <NumberInput
                          value={selection.quantity}
                          onChange={(value) => handleQuantityChange(imageId, value)}
                          min={1}
                          max={99}
                          size="sm"
                          width="80px"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </VStack>

                      <Spacer />

                      <HStack spacing={2}>
                        <IconButton
                          aria-label="View item details"
                          icon={<FaEye />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                        />
                        <IconButton
                          aria-label="Remove item"
                          icon={<FaTrash />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleRemove(imageId)}
                        />
                      </HStack>
                    </HStack>

                    {/* Custom Notes */}
                    {showCustomNotes && (
                      <VStack align="start" spacing={1} width="100%">
                        <Text fontSize="xs" color="gray.500" fontWeight="medium">
                          Notes
                        </Text>
                        <Textarea
                          value={selection.customNotes || ''}
                          onChange={(e) => handleCustomNotesChange(imageId, e.target.value)}
                          placeholder="Add notes about this item..."
                          size="sm"
                          rows={2}
                          resize="vertical"
                        />
                      </VStack>
                    )}
                  </VStack>
                </HStack>
                
                {index < selections.size - 1 && <Divider />}
              </Box>
            );
          })}
        </VStack>

        {/* Footer */}
        <Box
          p={4}
          bg="gray.50"
          borderTop="1px solid"
          borderColor={borderColor}
        >
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.600">
                Total Items: {totalItems}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Unique Items: {totalUniqueItems}
              </Text>
            </VStack>
            
            <Button
              colorScheme="red"
              variant="outline"
              size="sm"
              onClick={() => {
                // Clear all selections
                Array.from(selections.keys()).forEach(imageId => {
                  onRemove(imageId);
                });
              }}
            >
              Clear All
            </Button>
          </HStack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default SelectionPanel;
