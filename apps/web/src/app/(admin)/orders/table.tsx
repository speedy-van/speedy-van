'use client';
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  Flex,
  Spinner,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Tooltip,
  Icon,
  Divider,
  Grid,
  GridItem,
  useDisclosure,
  Progress,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaFilter,
  FaEllipsisV,
  FaEdit,
  FaUser,
  FaMapMarkerAlt,
  FaClock,
  FaPoundSign,
  FaCheck,
  FaTimes,
  FaDownload,
  FaEnvelope,
  FaEye,
  FaTruck,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { formatDistanceToNow, format, differenceInMinutes } from "date-fns";
import { AdminShell, ViewToggle, type ViewType, OrderDetailDrawer } from "@/components/admin";

interface Order {
  id: string;
  reference: string;
  status: string;
  scheduledAt: string;
  totalGBP: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupAddress?: {
    label: string;
    postcode: string;
  };
  dropoffAddress?: {
    label: string;
    postcode: string;
  };
  customer?: {
    name: string;
    email: string;
  };
  driver?: {
    user: {
      name: string;
    };
  };
  createdAt: string;
  paidAt?: string;
  durationSeconds?: number;
  assignment?: {
    status: string;
    claimedAt?: string;
  };
  preferredDate?: string;
  timeSlot?: string;
  distanceMeters?: number;
}

export default function OrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [viewMode, setViewMode] = useState<ViewType>('table');
  const [selectedOrderCode, setSelectedOrderCode] = useState<string | undefined>();
  const [showAllOrders, setShowAllOrders] = useState(true); // Ensure all orders are shown by default
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100, // Increased limit to show more orders
    total: 0,
    hasMore: false
  });
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const toast = useToast();
  
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose
  } = useDisclosure();

  const loadOrders = useCallback(async (refresh = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      if (paymentFilter) params.set("payment", paymentFilter);
      if (dateRange) params.set("dateRange", dateRange);
      if (driverFilter) params.set("driver", driverFilter);
      if (areaFilter) params.set("area", areaFilter);
      params.set("take", pagination.limit.toString());
      
      // Ensure we get all orders if no specific filters are applied
      if (!statusFilter && !paymentFilter && !dateRange && !driverFilter && !areaFilter && !searchQuery) {
        params.set("take", "500"); // Get maximum orders when no filters
      }
      
      if (!refresh && pagination.page > 1) {
        // For pagination, we'd need cursor-based pagination
        // For now, just reload all
      }
      
      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await response.json();
      
      if (refresh) {
        setOrders(data.items || data);
        
        // Count new orders (pending and confirmed without driver)
        const newOrders = (data.items || data).filter((order: Order) => 
          ['pending', 'CONFIRMED'].includes(order.status) && !order.driver
        );
        setNewOrdersCount(newOrders.length);
        
        setPagination(prev => ({
          ...prev,
          total: data.items?.length || 0,
          hasMore: data.nextCursor ? true : false
        }));
      } else {
        setOrders(prev => [...prev, ...(data.items || data)]);
      }
    } catch (error) {
      toast({
        title: "Error loading orders",
        description: "Failed to fetch orders data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, paymentFilter, dateRange, driverFilter, areaFilter, pagination.limit, toast]);

  useEffect(() => {
    // Prevent unnecessary API calls during hot reload
    if (typeof window !== 'undefined') {
      loadOrders(true);
    }
  }, [statusFilter, paymentFilter, dateRange, driverFilter, areaFilter, showAllOrders]);

  // Filter orders based on search query using useMemo for better performance
  const filteredOrders = useMemo(() => {
    if (!orders.length) return [];
    
    let filtered = orders;
    
    if (searchQuery) {
      filtered = filtered.filter(order => 
        String(order?.reference ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(order?.pickupAddress?.label ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(order?.dropoffAddress?.label ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(order?.customerName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(order?.customerEmail ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [orders, searchQuery]);

  const handleBulkAction = async (action: string) => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No orders selected",
        description: "Please select orders to perform bulk actions",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/orders/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: selectedOrders,
          action: action
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Bulk action completed",
          description: result.message || `${action} applied to ${selectedOrders.length} orders`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setSelectedOrders([]);
        loadOrders(true);
      } else {
        throw new Error('Bulk action failed');
      }
    } catch (error) {
      toast({
        title: "Bulk action failed",
        description: "Failed to perform bulk action",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleViewOrder = (orderCode: string) => {
    setSelectedOrderCode(orderCode);
    onDetailOpen();
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'gray';
    
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      case 'in_progress': return 'blue';
      case 'CONFIRMED': return 'yellow';
      case 'DRAFT': return 'gray';
      default: return 'gray';
    }
  };

  const getPaymentStatusColor = (status: string | undefined) => {
    if (!status) return 'gray';
    
    switch (status) {
      case 'paid': return 'green';
      case 'requires_action': return 'orange';
      case 'refunded': return 'red';
      default: return 'gray';
    }
  };

  const formatCurrency = (totalGBP: number) => {
    return `£${totalGBP.toFixed(2)}`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return '-';
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getSLAStatus = (order: Order) => {
    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      return { status: 'COMPLETED', message: 'Order completed' };
    }

    const now = new Date();
    const orderDate = order.scheduledAt ? new Date(order.scheduledAt) : new Date(order.createdAt);
    const minutesSinceOrder = differenceInMinutes(now, orderDate);
    
    if (minutesSinceOrder > 120) { // 2 hours
      return { status: 'overdue', message: `${minutesSinceOrder}min overdue` };
    } else if (minutesSinceOrder > 60) { // 1 hour
      return { status: 'warning', message: `${minutesSinceOrder}min old` };
    } else {
      return { status: 'ok', message: `${minutesSinceOrder}min old` };
    }
  };

  const handleCreateOrder = () => {
    window.open('/book', '_blank');
  };

  const renderOrdersTable = () => (
    <Card>
      <CardBody p={0}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th px={4}>
                <Checkbox
                  isChecked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  isIndeterminate={selectedOrders.length > 0 && selectedOrders.length < filteredOrders.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrders(filteredOrders.map(order => order.id));
                    } else {
                      setSelectedOrders([]);
                    }
                  }}
                />
              </Th>
              <Th>Code</Th>
              <Th>Customer</Th>
              <Th>Route</Th>
              <Th>Time Window</Th>
              <Th>Status</Th>
              <Th>Driver</Th>
              <Th>Price</Th>
              <Th>Payment</Th>
              <Th>SLA</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Tr key={`loading-${i}`}>
                  <Td colSpan={11}>
                    <Flex justify="center" py={8}>
                      <Spinner />
                    </Flex>
                  </Td>
                </Tr>
              ))
            ) : filteredOrders.length === 0 ? (
              <Tr>
                <Td colSpan={11}>
                  <Flex justify="center" py={8}>
                    <Text color="gray.500">No orders found</Text>
                  </Flex>
                </Td>
              </Tr>
            ) : (
              filteredOrders.map((order) => {
                const slaStatus = getSLAStatus(order);
                return (
                  <Tr key={order.id} _hover={{ bg: 'gray.50' }} cursor="pointer" onClick={() => handleViewOrder(order.reference)}>
                    <Td px={4} onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        isChecked={selectedOrders.includes(order.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order.id]);
                          } else {
                            setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                          }
                        }}
                      />
                    </Td>
                                         <Td>
                       <Text fontWeight="bold" color="blue.600">
                         #{order.reference || 'N/A'}
                       </Text>
                     </Td>
                                         <Td>
                       <VStack align="start" spacing={1}>
                         <Text fontWeight="medium">{order.customerName || 'Unknown Customer'}</Text>
                         <Text fontSize="sm" color="gray.600">{order.customer?.email || order.customerEmail || '-'}</Text>
                       </VStack>
                     </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Icon as={FaMapMarkerAlt} color="green.500" boxSize={3} />
                          <Text fontSize="sm" noOfLines={1} maxW="200px">
                            {order.pickupAddress?.label || '-'}
                          </Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaMapMarkerAlt} color="red.500" boxSize={3} />
                          <Text fontSize="sm" noOfLines={1} maxW="200px">
                            {order.dropoffAddress?.label || '-'}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          {formatDistance(order.distanceMeters)} • {formatDuration(order.durationSeconds)}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">
                          {order.scheduledAt ? format(new Date(order.scheduledAt), 'MMM dd') : '-'}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {order.timeSlot || '-'}
                        </Text>
                      </VStack>
                    </Td>
                                         <Td>
                       <Badge colorScheme={getStatusColor(order.status)}>
                         {order.status ? String(order.status).replace('_', ' ') : 'Unknown'}
                       </Badge>
                     </Td>
                    <Td>
                      <HStack>
                        {order.driver?.user.name ? (
                          <>
                            <Icon as={FaTruck} color="blue.500" boxSize={3} />
                            <Text fontSize="sm">
                              {order.driver.user.name}
                            </Text>
                          </>
                        ) : (
                          <Text fontSize="sm" color="gray.500">-</Text>
                        )}
                      </HStack>
                    </Td>
                                         <Td>
                       <Text fontWeight="bold">
                         £{order.totalGBP || 0}
                       </Text>
                     </Td>
                                         <Td>
                       <Badge colorScheme={getPaymentStatusColor(order.status)}>
                         {order.status ? String(order.status).replace('_', ' ') : 'Unknown'}
                       </Badge>
                     </Td>
                    <Td>
                      <Tooltip label={slaStatus.message}>
                        <HStack spacing={1}>
                          <Icon 
                            as={slaStatus.status === 'overdue' ? FaExclamationTriangle : 
                                slaStatus.status === 'warning' ? FaClock : FaCheckCircle} 
                            color={slaStatus.status === 'overdue' ? 'red.500' : 
                                   slaStatus.status === 'warning' ? 'orange.500' : 'green.500'}
                            boxSize={3}
                          />
                          <Text fontSize="xs" color={slaStatus.status === 'overdue' ? 'red.500' : 
                                                    slaStatus.status === 'warning' ? 'orange.500' : 'gray.500'}>
                            {slaStatus.message}
                          </Text>
                        </HStack>
                      </Tooltip>
                    </Td>
                    <Td onClick={(e) => e.stopPropagation()}>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FaEllipsisV />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem icon={<FaEye />} onClick={() => handleViewOrder(order.reference)}>
                            View Details
                          </MenuItem>
                          <MenuItem icon={<FaEdit />} onClick={() => handleBulkAction('edit')}>
                            Edit Order
                          </MenuItem>
                          <MenuItem icon={<FaUser />} onClick={() => handleBulkAction('assign')}>
                            Assign Driver
                          </MenuItem>
                          <MenuItem icon={<FaEnvelope />} onClick={() => handleBulkAction('email')}>
                            Email Customer
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );

  const renderOrdersCards = () => (
    <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <Card key={`loading-${i}`}>
            <CardBody>
              <Flex justify="center" py={8}>
                <Spinner />
              </Flex>
            </CardBody>
          </Card>
        ))
      ) : filteredOrders.length === 0 ? (
        <GridItem colSpan={1}>
          <Card>
            <CardBody>
              <Flex justify="center" py={8}>
                <Text color="gray.500">No orders found</Text>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      ) : (
        filteredOrders.map((order) => {
          const slaStatus = getSLAStatus(order);
          return (
            <Card 
              key={order.id} 
              _hover={{ shadow: 'md' }} 
              transition="shadow 0.2s" 
              cursor="pointer"
              onClick={() => handleViewOrder(order.reference)}
            >
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold" color="blue.600" fontSize="lg">
                      #{order.reference}
                    </Text>
                    <Checkbox
                      isChecked={selectedOrders.includes(order.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedOrders([...selectedOrders, order.id]);
                        } else {
                          setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                        }
                      }}
                    />
                  </HStack>
                  
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="medium">{order.customer?.name || order.customerName || '-'}</Text>
                    <Text fontSize="sm" color="gray.600">{order.customer?.email || order.customerEmail || '-'}</Text>
                  </VStack>

                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Icon as={FaMapMarkerAlt} color="green.500" boxSize={3} />
                      <Text fontSize="sm" noOfLines={1}>
                        {order.pickupAddress?.label || '-'}
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaMapMarkerAlt} color="red.500" boxSize={3} />
                      <Text fontSize="sm" noOfLines={1}>
                        {order.dropoffAddress?.label || '-'}
                      </Text>
                    </HStack>
                  </VStack>

                                     <HStack justify="space-between">
                     <Badge colorScheme={getStatusColor(order.status)}>
                       {order.status ? String(order.status).replace('_', ' ') : 'Unknown'}
                     </Badge>
                                         <Text fontWeight="bold">
                       £{order.totalGBP || 0}
                     </Text>
                  </HStack>

                  <HStack justify="space-between" fontSize="sm" color="gray.600">
                    <HStack>
                      {order.driver?.user.name ? (
                        <>
                          <Icon as={FaTruck} color="blue.500" boxSize={3} />
                          <Text>{order.driver.user.name}</Text>
                        </>
                      ) : (
                        <Text>No driver</Text>
                      )}
                    </HStack>
                    <HStack>
                      <Icon 
                        as={slaStatus.status === 'overdue' ? FaExclamationTriangle : 
                            slaStatus.status === 'warning' ? FaClock : FaCheckCircle} 
                        color={slaStatus.status === 'overdue' ? 'red.500' : 
                               slaStatus.status === 'warning' ? 'orange.500' : 'green.500'}
                        boxSize={3}
                      />
                      <Text fontSize="xs">{slaStatus.message}</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          );
        })
      )}
    </Grid>
  );

  const renderOrdersKanban = () => (
    <Grid templateColumns="repeat(5, 1fr)" gap={4}>
      {['DRAFT', 'CONFIRMED', 'in_progress', 'COMPLETED', 'CANCELLED'].map((status) => {
        const statusOrders = filteredOrders.filter(order => order.status === status);
        return (
          <Card key={status}>
            <CardHeader>
              <HStack justify="space-between">
                                 <Heading size="sm" textTransform="capitalize">
                   {status ? String(status).replace('_', ' ') : 'Unknown'}
                 </Heading>
                <Badge colorScheme="blue" borderRadius="full">
                  {statusOrders.length}
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={2} align="stretch">
                {statusOrders.map((order) => {
                  const slaStatus = getSLAStatus(order);
                  return (
                    <Card 
                      key={order.id} 
                      size="sm" 
                      variant="outline" 
                      cursor="pointer"
                      onClick={() => handleViewOrder(order.reference)}
                    >
                      <CardBody p={3}>
                        <VStack align="start" spacing={2}>
                          <Text fontWeight="bold" fontSize="sm">
                            #{order.reference}
                          </Text>
                          <Text fontSize="xs">{order.customerName}</Text>
                          <Text fontSize="xs" color="gray.600" noOfLines={1}>
                            {order.pickupAddress?.label || '-'}
                          </Text>
                          <HStack justify="space-between" w="full">
                                                         <Text fontWeight="bold" fontSize="xs">
                               £{order.totalGBP || 0}
                             </Text>
                            <Icon 
                              as={slaStatus.status === 'overdue' ? FaExclamationTriangle : 
                                  slaStatus.status === 'warning' ? FaClock : FaCheckCircle} 
                              color={slaStatus.status === 'overdue' ? 'red.500' : 
                                     slaStatus.status === 'warning' ? 'orange.500' : 'green.500'}
                              boxSize={3}
                            />
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </VStack>
            </CardBody>
          </Card>
        );
      })}
    </Grid>
  );

  return (
    <>
      <AdminShell
        title="Orders"
        subtitle="Manage and track all orders"
        showCreateButton={true}
        onCreateClick={handleCreateOrder}
        actions={
          <HStack spacing={3}>
            {newOrdersCount > 0 && (
              <Alert status="warning" borderRadius="md" py={2} px={3}>
                <AlertIcon />
                <Text fontSize="sm" fontWeight="semibold">
                  {newOrdersCount} new order{newOrdersCount > 1 ? 's' : ''} pending assignment
                </Text>
              </Alert>
            )}
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <Button
              leftIcon={<FaDownload />}
              variant="outline"
              onClick={() => handleBulkAction('export')}
              isDisabled={selectedOrders.length === 0}
            >
              Export ({selectedOrders.length})
            </Button>
            <Button
              leftIcon={<FaEnvelope />}
              variant="outline"
              onClick={() => handleBulkAction('email')}
              isDisabled={selectedOrders.length === 0}
            >
              Email Customers
            </Button>
          </HStack>
        }
      >
        <Box>
          {/* Filters */}
          <Card mb={6}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Search and Quick Filters */}
                <Flex gap={4} wrap="wrap">
                  <Box flex="1" minW="300px">
                    <InputGroup>
                      <InputLeftElement>
                        <FaSearch />
                      </InputLeftElement>
                      <Input
                        placeholder="Search by code, address, customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </InputGroup>
                  </Box>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    placeholder="All Status"
                    minW="150px"
                  >
                    <option value="open">Open</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                  <Select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    placeholder="All Payments"
                    minW="150px"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="requires_action">Requires Action</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </Select>
                  <Select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    placeholder="Date Range"
                    minW="150px"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </Select>
                </Flex>

                {/* Additional Filters */}
                <Flex gap={4} wrap="wrap">
                  <Input
                    placeholder="Filter by driver name..."
                    value={driverFilter}
                    onChange={(e) => setDriverFilter(e.target.value)}
                    minW="200px"
                  />
                  <Input
                    placeholder="Filter by area..."
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    minW="200px"
                  />
                </Flex>

                {/* Bulk Actions */}
                {selectedOrders.length > 0 && (
                  <Alert status="info">
                    <AlertIcon />
                    <HStack justify="space-between" w="full">
                      <Text>
                        {selectedOrders.length} orders selected
                      </Text>
                      <HStack spacing={2}>
                        <Button size="sm" onClick={() => handleBulkAction('assign')}>
                          Assign Driver
                        </Button>
                        <Button size="sm" onClick={() => handleBulkAction('status')}>
                          Change Status
                        </Button>
                        <Button size="sm" onClick={() => setSelectedOrders([])}>
                          Clear Selection
                        </Button>
                      </HStack>
                    </HStack>
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Orders View */}
          {viewMode === 'table' && renderOrdersTable()}
          {viewMode === 'card' && renderOrdersCards()}
          {viewMode === 'kanban' && renderOrdersKanban()}

          {/* Pagination and Summary */}
          <Flex justify="space-between" align="center" mt={4}>
            <Text color="gray.600">
              Showing {filteredOrders.length} of {orders.length} orders
            </Text>
            <HStack spacing={2}>
              <Button 
                size="sm" 
                variant="outline" 
                isDisabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                isDisabled={!pagination.hasMore}
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                  loadOrders();
                }}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </Box>
      </AdminShell>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        orderCode={selectedOrderCode}
      />
    </>
  );
}


