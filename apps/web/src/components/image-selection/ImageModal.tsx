import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Divider,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react';
import { FaTimes, FaCheck, FaPlus } from 'react-icons/fa';
import Image from 'next/image';
import { ImageModalProps } from '../../types/image-selection';

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  image,
  onSelect,
  isSelected = false
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!image) return null;

  const handleSelect = () => {
    onSelect?.(image.id);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor} borderRadius="xl" overflow="hidden">
        {/* Header */}
        <ModalHeader pb={2}>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold">
                {image.name}
              </Text>
              <HStack spacing={2}>
                <Badge colorScheme="blue" variant="subtle">
                  {image.category}
                </Badge>
                <Badge colorScheme="gray" variant="outline">
                  {image.dimensions.width} × {image.dimensions.height}
                </Badge>
              </HStack>
            </VStack>
            
            <IconButton
              aria-label="Close modal"
              icon={<FaTimes />}
              variant="ghost"
              onClick={handleClose}
              size="lg"
            />
          </HStack>
        </ModalHeader>

        <Divider />

        {/* Body */}
        <ModalBody p={0}>
          <HStack spacing={0} align="stretch" minH="400px">
            {/* Image Section */}
            <Box flex={1} position="relative" minH="400px">
              <Image
                src={image.path}
                alt={image.name}
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </Box>

            {/* Details Section */}
            <Box
              flex={1}
              p={6}
              borderLeft="1px solid"
              borderColor={borderColor}
              bg="gray.50"
            >
              <VStack spacing={6} align="stretch">
                {/* Description */}
                <VStack align="start" spacing={3}>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                    Description
                  </Text>
                  <Text fontSize="md" color="gray.600" lineHeight="1.6">
                    {image.description || 'No description available for this item.'}
                  </Text>
                </VStack>

                <Divider />

                {/* Tags */}
                <VStack align="start" spacing={3}>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                    Tags
                  </Text>
                  <HStack spacing={2} wrap="wrap">
                    {image.tags.length > 0 ? (
                      image.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          colorScheme="blue"
                          variant="subtle"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No tags available
                      </Text>
                    )}
                  </HStack>
                </VStack>

                <Divider />

                {/* Specifications */}
                <VStack align="start" spacing={3}>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                    Specifications
                  </Text>
                  <VStack align="start" spacing={2} width="100%">
                    <HStack justify="space-between" width="100%">
                      <Text fontSize="sm" color="gray.600">Category:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between" width="100%">
                      <Text fontSize="sm" color="gray.600">Dimensions:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {image.dimensions.width} × {image.dimensions.height} px
                      </Text>
                    </HStack>
                    {image.fileSize && (
                      <HStack justify="space-between" width="100%">
                        <Text fontSize="sm" color="gray.600">File Size:</Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {(image.fileSize / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </VStack>

                <Divider />

                {/* Usage Information */}
                <VStack align="start" spacing={3}>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                    Usage
                  </Text>
                  <Text fontSize="sm" color="gray.600" lineHeight="1.5">
                    This item is commonly used for moving and storage purposes. 
                    Select it to add to your moving list with the desired quantity.
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </HStack>
        </ModalBody>

        {/* Footer */}
        <ModalFooter pt={4}>
          <HStack spacing={3}>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            
            {onSelect && (
              <Button
                colorScheme={isSelected ? 'red' : 'blue'}
                leftIcon={isSelected ? <FaTimes /> : <FaPlus />}
                onClick={handleSelect}
              >
                {isSelected ? 'Remove from Selection' : 'Add to Selection'}
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ImageModal;
