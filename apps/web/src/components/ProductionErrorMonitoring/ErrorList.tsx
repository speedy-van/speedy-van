'use client';
import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  Flex,
  Spacer,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Alert,
  AlertIcon,
  Spinner,
  Pagination,
} from '@chakra-ui/react';
import {
  EyeIcon,
  PencilIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { ProductionError, ErrorFilter } from '../../agent/types';

interface ErrorListProps {
  errors: ProductionError[];
  filter: ErrorFilter;
  onFilterChange: (filter: Partial<ErrorFilter>) => void;
  onErrorSelect: (error: ProductionError) => void;
  onRefresh: () => void;
}

export default function ErrorList({
  errors,
  filter,
  onFilterChange,
  onErrorSelect,
  onRefresh,
}: ErrorListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortField, setSortField] = useState<keyof ProductionError>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { isOpen: isFilterModalOpen, onOpen: onFilterModalOpen, onClose: onFilterModalClose } = useDisclosure();

  // Filter and sort errors
  const filteredAndSortedErrors = useMemo(() => {
    let filtered = errors.filter(error => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          error.message.toLowerCase().includes(searchLower) ||
          error.source.toLowerCase().includes(searchLower) ||
          error.category.toLowerCase().includes(searchLower) ||
          (error.context as any)?.url?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    // Sort errors
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [errors, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedErrors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedErrors = filteredAndSortedErrors.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof ProductionError) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'red';
      case 'error': return 'orange';
      case 'warning': return 'yellow';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'blue';
      case 'investigating': return 'yellow';
      case 'in_progress': return 'orange';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Flex mb={6} gap={4} align="end">
        <FormControl maxW="300px">
          <FormLabel>Search</FormLabel>
          <Input
            placeholder="Search errors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
          />
        </FormControl>

        <FormControl maxW="200px">
          <FormLabel>Level</FormLabel>
          <Select
            value={filter.level?.join(',') || ''}
            onChange={(e) => onFilterChange({ level: e.target.value ? e.target.value.split(',') as any : undefined })}
            placeholder="All levels"
          >
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </Select>
        </FormControl>

        <FormControl maxW="200px">
          <FormLabel>Category</FormLabel>
          <Select
            value={filter.category?.join(',') || ''}
            onChange={(e) => onFilterChange({ category: e.target.value ? e.target.value.split(',') as any : undefined })}
            placeholder="All categories"
          >
            <option value="database">Database</option>
            <option value="api">API</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="external">External</option>
            <option value="performance">Performance</option>
            <option value="security">Security</option>
            <option value="other">Other</option>
          </Select>
        </FormControl>

        <FormControl maxW="200px">
          <FormLabel>Status</FormLabel>
          <Select
            value={filter.status?.join(',') || ''}
            onChange={(e) => onFilterChange({ status: e.target.value ? e.target.value.split(',') as any : undefined })}
            placeholder="All statuses"
          >
            <option value="new">New</option>
            <option value="investigating">Investigating</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </Select>
        </FormControl>

        <Button
          leftIcon={<FunnelIcon className="h-4 w-4" />}
          variant="outline"
          onClick={onFilterModalOpen}
        >
          Advanced Filters
        </Button>

        <Spacer />

        <Button onClick={onRefresh} variant="outline">
          Refresh
        </Button>
      </Flex>

      {/* Results Summary */}
      <Text mb={4} color="gray.600">
        Showing {paginatedErrors.length} of {filteredAndSortedErrors.length} errors
        {searchTerm && ` matching "${searchTerm}"`}
      </Text>

      {/* Errors Table */}
      <Box overflowX="auto" borderWidth={1} borderRadius="lg">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th cursor="pointer" onClick={() => handleSort('timestamp')}>
                <HStack>
                  <Text>Timestamp</Text>
                  {sortField === 'timestamp' && (
                    <Text>{sortDirection === 'asc' ? '↑' : '↓'}</Text>
                  )}
                </HStack>
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('level')}>
                <HStack>
                  <Text>Level</Text>
                  {sortField === 'level' && (
                    <Text>{sortDirection === 'asc' ? '↑' : '↓'}</Text>
                  )}
                </HStack>
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('category')}>
                <HStack>
                  <Text>Category</Text>
                  {sortField === 'category' && (
                    <Text>{sortDirection === 'asc' ? '↑' : '↓'}</Text>
                  )}
                </HStack>
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('source')}>
                <HStack>
                  <Text>Source</Text>
                  {sortField === 'source' && (
                    <Text>{sortDirection === 'asc' ? '↑' : '↓'}</Text>
                  )}
                </HStack>
              </Th>
              <Th>Message</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedErrors.map((error) => (
              <Tr key={error.id} _hover={{ bg: 'gray.50' }}>
                <Td fontSize="sm">{formatTimestamp(error.timestamp)}</Td>
                <Td>
                  <Badge colorScheme={getLevelColor(error.level)} variant="solid">
                    {error.level}
                  </Badge>
                </Td>
                <Td>
                  <Badge variant="outline">{error.category}</Badge>
                </Td>
                <Td fontSize="sm">{error.source}</Td>
                <Td maxW="300px">
                  <Tooltip label={error.message}>
                    <Text>{truncateText(error.message)}</Text>
                  </Tooltip>
                </Td>
                <Td>
                  <Badge colorScheme={getPriorityColor(error.metadata.priority)} variant="subtle">
                    {error.metadata.priority}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme={getStatusColor(error.metadata.status)} variant="subtle">
                    {error.metadata.status}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Tooltip label="View Details">
                      <IconButton
                        aria-label="View error details"
                        icon={<EyeIcon className="h-4 w-4" />}
                        size="sm"
                        variant="ghost"
                        onClick={() => onErrorSelect(error)}
                      />
                    </Tooltip>
                    <Tooltip label="Update Status">
                      <IconButton
                        aria-label="Update error status"
                        icon={<PencilIcon className="h-4 w-4" />}
                        size="sm"
                        variant="ghost"
                        onClick={() => onErrorSelect(error)}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="center" mt={6}>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              isDisabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? 'solid' : 'outline'}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
          </HStack>
        </Flex>
      )}

      {/* Advanced Filters Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={onFilterModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Advanced Filters</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Date Range</FormLabel>
                <HStack>
                  <Input
                    type="date"
                    value={filter.dateRange?.start?.toISOString().split('T')[0] || ''}
                    onChange={(e) => onFilterChange({
                      dateRange: {
                        start: new Date(e.target.value),
                        end: filter.dateRange?.end || new Date()
                      }
                    })}
                  />
                  <Text>to</Text>
                  <Input
                    type="date"
                    value={filter.dateRange?.end?.toISOString().split('T')[0] || ''}
                    onChange={(e) => onFilterChange({
                      dateRange: {
                        start: filter.dateRange?.start || new Date(),
                        end: new Date(e.target.value)
                      }
                    })}
                  />
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Assignee</FormLabel>
                <Input
                  placeholder="Filter by assignee"
                  value={filter.assignee || ''}
                  onChange={(e) => onFilterChange({ assignee: e.target.value || undefined })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Input
                  placeholder="Comma-separated tags"
                  value={filter.tags?.join(',') || ''}
                  onChange={(e) => onFilterChange({ tags: e.target.value ? e.target.value.split(',') : undefined })}
                />
              </FormControl>

              <Button colorScheme="blue" onClick={onFilterModalClose}>
                Apply Filters
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
