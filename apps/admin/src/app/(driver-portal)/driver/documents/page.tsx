'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  VStack,
  HStack,
  Button,
  useToast,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Icon,
  Flex,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Progress,
} from '@chakra-ui/react';
import {
  FiUpload,
  FiDownload,
  FiEye,
  FiTrash2,
  FiFileText,
  FiShield,
  FiTruck,
  FiCalendar,
} from 'react-icons/fi';

interface Document {
  id: string;
  category: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
  expiresAt: string | null;
  verifiedAt?: string;
  verifiedBy?: string;
}

const DOCUMENT_CATEGORIES = {
  rtw: { label: 'Right to Work', icon: FiFileText, required: true },
  licence: { label: 'Driving License', icon: FiShield, required: true },
  insurance: { label: 'Insurance Certificate', icon: FiShield, required: true },
  mot: { label: 'MOT Certificate', icon: FiTruck, required: true },
  v5c: { label: 'V5C Log Book', icon: FiTruck, required: true },
  dbs: { label: 'DBS Certificate', icon: FiCalendar, required: true },
  other: { label: 'Other Documents', icon: FiFileText, required: false },
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    category: '',
    file: null as File | null,
    expiresAt: '',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/driver/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.category || !uploadForm.file) {
      toast({
        title: 'Error',
        description: 'Please select a category and file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('category', uploadForm.category);
      formData.append('file', uploadForm.file);
      if (uploadForm.expiresAt) {
        formData.append('expiresAt', uploadForm.expiresAt);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch('/api/driver/documents', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Document uploaded successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Reset form and close modal
        setUploadForm({ category: '', file: null, expiresAt: '' });
        onClose();

        // Refresh documents list
        await fetchDocuments();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to upload document',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'yellow', text: 'Pending Review' },
      verified: { color: 'green', text: 'Verified' },
      rejected: { color: 'red', text: 'Rejected' },
      expired: { color: 'gray', text: 'Expired' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: 'gray',
      text: status,
    };
    return <Badge colorScheme={config.color}>{config.text}</Badge>;
  };

  const getDocumentIcon = (category: string) => {
    const config =
      DOCUMENT_CATEGORIES[category as keyof typeof DOCUMENT_CATEGORIES];
    return config ? <Icon as={config.icon} /> : <Icon as={FiFileText} />;
  };

  const isDocumentExpired = (document: Document) => {
    if (!document.expiresAt) return false;
    return new Date(document.expiresAt) < new Date();
  };

  const getRequiredDocuments = () => {
    return Object.entries(DOCUMENT_CATEGORIES)
      .filter(([_, config]) => config.required)
      .map(([key, config]) => ({ key, ...config }));
  };

  const getUploadedDocuments = () => {
    return Object.keys(DOCUMENT_CATEGORIES).map(category => {
      const docs = documents.filter(doc => doc.category === category);
      return {
        category,
        ...DOCUMENT_CATEGORIES[category as keyof typeof DOCUMENT_CATEGORIES],
        documents: docs,
        latest: docs.length > 0 ? docs[0] : null,
      };
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="400px"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  const uploadedDocs = getUploadedDocuments();
  const missingRequired = uploadedDocs.filter(
    doc => doc.required && !doc.latest
  );

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Documents & Compliance</Heading>
        <Button leftIcon={<FiUpload />} colorScheme="blue" onClick={onOpen}>
          Upload Document
        </Button>
      </Flex>

      {/* Status Overview */}
      <Grid
        templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
        gap={6}
        mb={8}
      >
        {uploadedDocs.map(doc => (
          <Card key={doc.category}>
            <CardBody>
              <Flex align="center" mb={3}>
                <Icon as={doc.icon} mr={2} />
                <Heading size="sm">{doc.label}</Heading>
                {doc.required && (
                  <Badge colorScheme="red" ml={2} size="sm">
                    Required
                  </Badge>
                )}
              </Flex>

              {doc.latest ? (
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Uploaded:{' '}
                      {new Date(doc.latest.uploadedAt).toLocaleDateString()}
                    </Text>
                    {getStatusBadge(doc.latest.status)}
                  </HStack>

                  {doc.latest.expiresAt && (
                    <Text fontSize="sm" color="gray.600">
                      Expires:{' '}
                      {new Date(doc.latest.expiresAt).toLocaleDateString()}
                    </Text>
                  )}

                  {isDocumentExpired(doc.latest) && (
                    <Alert status="error" size="sm">
                      <AlertIcon />
                      <Text fontSize="xs">Document expired</Text>
                    </Alert>
                  )}

                  {doc.latest.verifiedAt && (
                    <Text fontSize="sm" color="green.600">
                      Verified:{' '}
                      {new Date(doc.latest.verifiedAt).toLocaleDateString()}
                    </Text>
                  )}
                </VStack>
              ) : (
                <Alert status="warning" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">No document uploaded</Text>
                </Alert>
              )}
            </CardBody>
          </Card>
        ))}
      </Grid>

      {/* Missing Required Documents Alert */}
      {missingRequired.length > 0 && (
        <Alert status="warning" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Missing Required Documents</AlertTitle>
            <AlertDescription>
              You need to upload the following required documents:{' '}
              {missingRequired.map(doc => doc.label).join(', ')}
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Documents Table */}
      <Card>
        <CardBody>
          <Heading size="md" mb={4}>
            Document History
          </Heading>

          {documents.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Document Type</Th>
                  <Th>Status</Th>
                  <Th>Uploaded</Th>
                  <Th>Expires</Th>
                  <Th>Verified</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {documents.map(doc => (
                  <Tr key={doc.id}>
                    <Td>
                      <HStack>
                        {getDocumentIcon(doc.category)}
                        <Text>
                          {DOCUMENT_CATEGORIES[
                            doc.category as keyof typeof DOCUMENT_CATEGORIES
                          ]?.label || doc.category}
                        </Text>
                      </HStack>
                    </Td>
                    <Td>{getStatusBadge(doc.status)}</Td>
                    <Td>{new Date(doc.uploadedAt).toLocaleDateString()}</Td>
                    <Td>
                      {doc.expiresAt
                        ? new Date(doc.expiresAt).toLocaleDateString()
                        : 'No expiry'}
                    </Td>
                    <Td>
                      {doc.verifiedAt ? (
                        <Text fontSize="sm">
                          {new Date(doc.verifiedAt).toLocaleDateString()}
                          {doc.verifiedBy && ` by ${doc.verifiedBy}`}
                        </Text>
                      ) : (
                        <Text fontSize="sm" color="gray.500">
                          Not verified
                        </Text>
                      )}
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="View document"
                          icon={<FiEye />}
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                        />
                        <IconButton
                          aria-label="Download document"
                          icon={<FiDownload />}
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text color="gray.600" textAlign="center" py={8}>
              No documents uploaded yet. Click "Upload Document" to get started.
            </Text>
          )}
        </CardBody>
      </Card>

      {/* Upload Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Document Type</FormLabel>
                <Select
                  value={uploadForm.category}
                  onChange={e =>
                    setUploadForm({ ...uploadForm, category: e.target.value })
                  }
                  placeholder="Select document type"
                >
                  {Object.entries(DOCUMENT_CATEGORIES).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label} {config.required && '(Required)'}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>File</FormLabel>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                />
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Accepted formats: PDF, JPEG, PNG, WebP (max 10MB)
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Expiry Date (Optional)</FormLabel>
                <Input
                  type="date"
                  value={uploadForm.expiresAt}
                  onChange={e =>
                    setUploadForm({ ...uploadForm, expiresAt: e.target.value })
                  }
                />
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Set if this document has an expiry date
                </Text>
              </FormControl>

              {uploading && (
                <Box>
                  <Text mb={2}>Uploading...</Text>
                  <Progress value={uploadProgress} colorScheme="blue" />
                </Box>
              )}

              <HStack spacing={4} justify="flex-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  isDisabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleUpload}
                  isLoading={uploading}
                  loadingText="Uploading..."
                  isDisabled={!uploadForm.category || !uploadForm.file}
                >
                  Upload Document
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
