import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Tooltip,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Input,
  useColorModeValue,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';
import { FaCheck, FaEye, FaPlus, FaMinus, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { ImageCardProps } from '../../types/image-selection';

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  isSelected,
  onSelect,
  onDeselect,
  showQuantity = true,
  showCustomNotes = false,
  maxQuantity = 10,
  onImageClick
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [customNotes, setCustomNotes] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBorderColor = useColorModeValue('blue.300', 'blue.400');

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
  };

  const handleCardClick = () => {
    onImageClick?.(image);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelected) {
      onDeselect(image.id);
    } else {
      onSelect(image.id, quantity);
    }
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    const clampedValue = Math.max(1, Math.min(maxQuantity, numValue));
    setQuantity(clampedValue);
    
    if (isSelected) {
      onSelect(image.id, clampedValue);
    }
  };

  const handleCustomNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const notes = e.target.value;
    setCustomNotes(notes);
    // In a real implementation, you'd call a callback to update the selection
  };

  return (
    <Box
      border="2px solid"
      borderColor={isSelected ? 'blue.400' : borderColor}
      borderRadius="xl"
      bg={bgColor}
      overflow="hidden"
      position="relative"
      cursor="pointer"
      _hover={{
        borderColor: isSelected ? 'blue.500' : hoverBorderColor,
        transform: 'translateY(-2px)',
        boxShadow: 'lg'
      }}
      transition="all 0.2s"
      onClick={handleCardClick}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <Box
          position="absolute"
          top={2}
          right={2}
          zIndex={2}
          width={6}
          height={6}
          borderRadius="full"
          bg="blue.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="md"
        >
                     <FaCheck color="white" size={12} />
        </Box>
      )}

      {/* Image Container */}
      <Box
        position="relative"
        width="100%"
        height="200px"
        bg="gray.100"
        overflow="hidden"
      >
        {isLoading && (
          <Skeleton
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={1}
          />
        )}
        
        <Image
          src={image.path}
          alt={image.name}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          onLoad={handleImageLoad}
          onError={handleImageError}
          unoptimized
        />

        {/* Overlay on hover */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="black"
          opacity={0}
          _hover={{ opacity: 0.1 }}
          transition="opacity 0.2s"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Tooltip label="View details">
            <IconButton
              aria-label="View details"
              icon={<FaEye />}
              size="sm"
              colorScheme="white"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            />
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <VStack spacing={3} p={4} align="stretch">
        {/* Title and Tags */}
        <VStack spacing={2} align="start">
          <Text
            fontSize="md"
            fontWeight="semibold"
            noOfLines={2}
            lineHeight="1.2"
          >
            {image.name}
          </Text>
          
          {image.description && (
            <Text
              fontSize="sm"
              color="gray.600"
              noOfLines={2}
              lineHeight="1.3"
            >
              {image.description}
            </Text>
          )}

          <HStack spacing={1} wrap="wrap">
            {image.tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                size="sm"
                variant="subtle"
                colorScheme="gray"
                fontSize="xs"
              >
                {tag}
              </Badge>
            ))}
            {image.tags.length > 2 && (
              <Badge
                size="sm"
                variant="subtle"
                colorScheme="gray"
                fontSize="xs"
              >
                +{image.tags.length - 2}
              </Badge>
            )}
          </HStack>
        </VStack>

        {/* Quantity Input */}
        {showQuantity && (
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Quantity
            </Text>
            <NumberInput
              value={quantity}
              onChange={handleQuantityChange}
              min={1}
              max={maxQuantity}
              size="sm"
              onClick={(e) => e.stopPropagation()}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </VStack>
        )}

        {/* Custom Notes */}
        {showCustomNotes && (
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Notes
            </Text>
            <Input
              value={customNotes}
              onChange={handleCustomNotesChange}
              placeholder="Add notes..."
              size="sm"
              onClick={(e) => e.stopPropagation()}
            />
          </VStack>
        )}

        {/* Action Button */}
        <Tooltip label={isSelected ? 'Remove from selection' : 'Add to selection'}>
          <IconButton
            aria-label={isSelected ? 'Remove from selection' : 'Add to selection'}
            icon={isSelected ? <FaTimes /> : <FaPlus />}
            colorScheme={isSelected ? 'red' : 'blue'}
            variant={isSelected ? 'solid' : 'outline'}
            size="sm"
            width="100%"
            onClick={handleSelectClick}
            _hover={{
              transform: 'scale(1.02)'
            }}
            transition="all 0.2s"
          >
            {isSelected ? 'Remove' : 'Add'}
          </IconButton>
        </Tooltip>
      </VStack>
    </Box>
  );
};

export default ImageCard;
