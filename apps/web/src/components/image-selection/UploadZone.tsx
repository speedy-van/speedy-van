import React, { useState, useRef, useCallback } from 'react';
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
  Box,
  Input,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Progress,
  Icon,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { FaCloudUploadAlt, FaTimes, FaImage } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { ImageUploadData } from '../../types/image-selection';

interface UploadZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: ImageUploadData) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  maxFiles?: number;
  category?: string;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  isOpen,
  onClose,
  onUpload,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1,
  category,
}) => {
  const [uploadData, setUploadData] = useState<Partial<ImageUploadData>>({
    category: category || 'misc',
    name: '',
    description: '',
    tags: [],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setErrors(prev => ({ ...prev, file: '' }));

        // Auto-generate name from filename
        if (!uploadData.name) {
          const name = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
          setUploadData(prev => ({ ...prev, name }));
        }
      }
    },
    [uploadData.name]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles,
    multiple: false,
  });

  const handleInputChange = (field: keyof ImageUploadData, value: string) => {
    setUploadData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setUploadData(prev => ({ ...prev, tags }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedFile) {
      newErrors.file = 'Please select a file to upload';
    }

    if (!uploadData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!uploadData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (!validateForm() || !selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      const uploadDataComplete: ImageUploadData = {
        file: selectedFile,
        category: uploadData.category!,
        name: uploadData.name!,
        description: uploadData.description || '',
        tags: uploadData.tags || [],
      };

      onUpload(uploadDataComplete);

      toast({
        title: 'Upload successful',
        description: 'Your image has been uploaded successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      handleClose();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description:
          'There was an error uploading your image. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setUploadData({
      category: category || 'misc',
      name: '',
      description: '',
      tags: [],
    });
    setSelectedFile(null);
    setErrors({});
    setUploadProgress(0);
    setIsUploading(false);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor} borderRadius="xl">
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FaCloudUploadAlt} color="blue.500" />
            <Text>Upload Custom Image</Text>
          </HStack>
        </ModalHeader>

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* File Upload Area */}
            <FormControl isInvalid={!!errors.file}>
              <FormLabel>Image File</FormLabel>
              <Box
                {...getRootProps()}
                border="2px dashed"
                borderColor={isDragActive ? 'blue.400' : borderColor}
                borderRadius="lg"
                p={8}
                textAlign="center"
                cursor="pointer"
                bg={isDragActive ? 'blue.50' : 'gray.50'}
                _hover={{
                  borderColor: 'blue.400',
                  bg: 'blue.50',
                }}
                transition="all 0.2s"
              >
                <input {...getInputProps()} />
                <VStack spacing={3}>
                  <Icon as={FaImage} boxSize="3xl" color="gray.400" />
                  {isDragActive ? (
                    <Text color="blue.600" fontWeight="medium">
                      Drop the image here...
                    </Text>
                  ) : (
                    <VStack spacing={2}>
                      <Text color="gray.600" fontWeight="medium">
                        Drag & drop an image here, or click to select
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Supported formats: JPEG, PNG, WebP (max{' '}
                        {formatFileSize(maxSize)})
                      </Text>
                    </VStack>
                  )}
                </VStack>
              </Box>
              {selectedFile && (
                <Box
                  mt={3}
                  p={3}
                  bg="green.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="green.200"
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium" color="green.800">
                        {selectedFile.name}
                      </Text>
                      <Text fontSize="xs" color="green.600">
                        {formatFileSize(selectedFile.size)}
                      </Text>
                    </VStack>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => setSelectedFile(null)}
                    >
                      <FaTimes />
                    </Button>
                  </HStack>
                </Box>
              )}
              <FormErrorMessage>{errors.file}</FormErrorMessage>
            </FormControl>

            <Divider />

            {/* Image Details */}
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Image Name</FormLabel>
                <Input
                  value={uploadData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="Enter image name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.category}>
                <FormLabel>Category</FormLabel>
                <Select
                  value={uploadData.category}
                  onChange={e => handleInputChange('category', e.target.value)}
                >
                  <option value="furniture">Furniture</option>
                  <option value="appliances">Appliances</option>
                  <option value="electronics">Electronics</option>
                  <option value="boxes">Boxes & Containers</option>
                  <option value="misc">Miscellaneous</option>
                </Select>
                <FormErrorMessage>{errors.category}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Description (Optional)</FormLabel>
                <Textarea
                  value={uploadData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Describe this item..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tags (Optional)</FormLabel>
                <Input
                  value={uploadData.tags?.join(', ') || ''}
                  onChange={e => handleTagsChange(e.target.value)}
                  placeholder="Enter tags separated by commas"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Example: living room, comfortable, seating
                </Text>
              </FormControl>
            </VStack>

            {/* Upload Progress */}
            {isUploading && (
              <VStack spacing={2} align="stretch">
                <Text fontSize="sm" fontWeight="medium">
                  Uploading...
                </Text>
                <Progress value={uploadProgress} colorScheme="blue" size="sm" />
                <Text fontSize="xs" color="gray.500">
                  {uploadProgress}% complete
                </Text>
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={handleClose}
              isDisabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleUpload}
              isLoading={isUploading}
              loadingText="Uploading..."
              isDisabled={!selectedFile || isUploading}
            >
              Upload Image
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadZone;
