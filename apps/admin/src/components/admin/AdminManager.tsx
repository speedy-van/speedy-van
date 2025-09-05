'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  FormHelperText,
  Alert,
  AlertIcon,
  useToast,
  Card,
  CardBody,
  Grid,
  Divider,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  InputGroup,
  InputRightElement,
  Icon,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiShield,
  FiUser,
  FiMail,
  FiMoreVertical,
  FiCheck,
  FiX,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
} from 'react-icons/fi';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  adminRole: string;
  isActive: boolean;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  permissions: string[];
}

interface Role {
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

const roles: Role[] = [
  {
    name: 'superadmin',
    description: 'Full system access and control',
    permissions: ['*'],
    color: 'red',
  },
  {
    name: 'ops',
    description: 'Operations management and dispatch',
    permissions: [
      'orders.read',
      'orders.write',
      'orders.delete',
      'drivers.read',
      'drivers.write',
      'dispatch.read',
      'dispatch.write',
      'customers.read',
      'customers.write',
    ],
    color: 'blue',
  },
  {
    name: 'support',
    description: 'Customer support and issue resolution',
    permissions: [
      'orders.read',
      'customers.read',
      'customers.write',
      'support.read',
      'support.write',
    ],
    color: 'green',
  },
  {
    name: 'reviewer',
    description: 'Driver applications and compliance review',
    permissions: [
      'drivers.read',
      'drivers.write',
      'compliance.read',
      'compliance.write',
    ],
    color: 'purple',
  },
  {
    name: 'finance',
    description: 'Financial operations and reporting',
    permissions: [
      'orders.read',
      'finance.read',
      'finance.write',
      'payouts.read',
      'payouts.write',
      'refunds.read',
      'refunds.write',
    ],
    color: 'orange',
  },
  {
    name: 'read_only',
    description: 'View-only access to all data',
    permissions: [
      'orders.read',
      'drivers.read',
      'customers.read',
      'finance.read',
      'analytics.read',
    ],
    color: 'gray',
  },
];

export default function AdminManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Use neon dark theme colors
  const bgColor = 'bg.surface';
  const borderColor = 'border.primary';

  // Fetch admin users
  const fetchAdminUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        throw new Error('Failed to fetch admin users');
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin users',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.adminRole.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.adminRole === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleInviteUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    onOpen();
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditing(true);
    onOpen();
  };

  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    onDeleteOpen();
  };

  const handleRemoveAdmin = () => {
    if (filteredUsers.length === 1) {
      // If only one user, directly select them
      setSelectedUser(filteredUsers[0]);
      onDeleteOpen();
    } else if (filteredUsers.length > 1) {
      // If multiple users, show a selection dialog or use the first one
      // For now, we'll use the first filtered user
      setSelectedUser(filteredUsers[0]);
      onDeleteOpen();
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== selectedUser.id));
        toast({
          title: 'User removed',
          description: 'The admin user has been removed successfully.',
          status: 'success',
        });
      } else {
        throw new Error('Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove user',
        status: 'error',
      });
    } finally {
      onDeleteClose();
      setSelectedUser(null);
    }
  };

  const handleSaveUser = async (userData: Partial<AdminUser>) => {
    try {
      const url =
        isEditing && selectedUser
          ? `/api/admin/users/${selectedUser.id}`
          : '/api/admin/users';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const savedUser = await response.json();

        if (isEditing && selectedUser) {
          setUsers(
            users.map(user => (user.id === selectedUser.id ? savedUser : user))
          );
          toast({
            title: 'User updated',
            description: 'The admin user has been updated successfully.',
            status: 'success',
          });
        } else {
          setUsers([...users, savedUser]);
          toast({
            title: 'User invited',
            description: 'An invitation has been sent to the user.',
            status: 'success',
          });
        }
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to save user';

        if (response.status === 409) {
          toast({
            title: 'User already exists',
            description: 'A user with this email address already exists.',
            status: 'error',
            duration: 5000,
          });
        } else {
          toast({
            title: 'Error',
            description: errorMessage,
            status: 'error',
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to save user. Please try again.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const getRoleColor = (role: string) => {
    const roleData = roles.find(r => r.name === role);
    return roleData?.color || 'gray';
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatCreatedAt = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const exportUsers = () => {
    if (typeof window === 'undefined') return;

    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', '2FA', 'Last Login', 'Created At'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.adminRole,
        user.isActive ? 'Active' : 'Inactive',
        user.twoFactorEnabled ? 'Yes' : 'No',
        formatLastLogin(user.lastLogin),
        formatCreatedAt(user.createdAt),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box p={6}>
        <VStack spacing={4} align="center" justify="center" minH="400px">
          <Spinner size="xl" />
          <Text>Loading admin users...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="start" spacing={6} w="full">
        {/* Header */}
        <HStack justify="space-between" w="full">
          <Box>
            <Heading size="lg" mb={2}>
              Admin Management
            </Heading>
            <Text color="text.secondary">
              Add, edit, and manage admin users with role-based permissions.
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<FiDownload />}
              variant="outline"
              onClick={exportUsers}
            >
              Export
            </Button>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              onClick={fetchAdminUsers}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              onClick={handleInviteUser}
            >
              Add Admin
            </Button>
            <Tooltip label="Remove the first admin user from the filtered list">
              <Button
                leftIcon={<FiTrash2 />}
                colorScheme="red"
                bg="red.500"
                background="#E53E3E"
                color="white"
                _hover={{ bg: 'red.600', background: '#C53030' }}
                onClick={handleRemoveAdmin}
                isDisabled={filteredUsers.length === 0}
              >
                Remove Admin
              </Button>
            </Tooltip>
          </HStack>
        </HStack>

        {/* Filters */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
              gap={4}
            >
              <FormControl>
                <FormLabel>Search</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="Search by name, email, or role..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <InputRightElement>
                    <Icon as={FiSearch} color="text.tertiary" />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
            </Grid>
          </CardBody>
        </Card>

        {/* Stats */}
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}
          gap={4}
          w="full"
        >
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="text.tertiary">
                  Total Admins
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {users.length}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="text.tertiary">
                  Active
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {users.filter(u => u.isActive).length}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="text.tertiary">
                  2FA Enabled
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {users.filter(u => u.twoFactorEnabled).length}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="text.tertiary">
                  Super Admins
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {users.filter(u => u.adminRole === 'superadmin').length}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Users Table */}
        <Card bg={bgColor} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <Heading size="md" mb={4}>
              Admin Users ({filteredUsers.length})
            </Heading>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>2FA</Th>
                  <Th>Last Login</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map(user => (
                  <Tr key={user.id}>
                    <Td>
                      <HStack>
                        <Icon as={FiUser} />
                        <Text fontWeight="medium">{user.name}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Icon as={FiMail} />
                        <Text>{user.email}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getRoleColor(user.adminRole)}>
                        {user.adminRole}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={user.isActive ? 'green' : 'red'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      {user.twoFactorEnabled ? (
                        <Icon as={FiCheck} color="green" />
                      ) : (
                        <Icon as={FiX} color="red" />
                      )}
                    </Td>
                    <Td>{formatLastLogin(user.lastLogin)}</Td>
                    <Td>{formatCreatedAt(user.createdAt)}</Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiEdit />}
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<FiTrash2 />}
                            color="red.500"
                            onClick={() => handleDeleteUser(user)}
                          >
                            Remove
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {filteredUsers.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text color="text.tertiary">No admin users found</Text>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* User Modal */}
        <UserModal
          isOpen={isOpen}
          onClose={onClose}
          user={selectedUser}
          isEditing={isEditing}
          roles={roles}
          onSave={handleSaveUser}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialogOverlay />
          <AlertDialogContent
            bg="bg.surface"
            background="#1A1A1A"
            borderColor="border.primary"
          >
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              bg="bg.surface"
              background="#1A1A1A"
              borderBottom="1px solid"
              borderColor="border.primary"
            >
              Remove Admin User
            </AlertDialogHeader>

            <AlertDialogBody bg="bg.surface" background="#1A1A1A">
              <Text color="white">
                Are you sure you want to remove{' '}
                <strong>{selectedUser?.name}</strong> from the admin team? This
                action cannot be undone.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter
              bg="bg.surface"
              background="#1A1A1A"
              borderTop="1px solid"
              borderColor="border.primary"
            >
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                bg="red.500"
                background="#E53E3E"
                color="white"
                _hover={{ bg: 'red.600', background: '#C53030' }}
                onClick={confirmDeleteUser}
                ml={3}
              >
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </VStack>
    </Box>
  );
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  isEditing: boolean;
  roles: Role[];
  onSave: (userData: Partial<AdminUser>) => void;
}

function UserModal({
  isOpen,
  onClose,
  user,
  isEditing,
  roles,
  onSave,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    adminRole: 'read_only',
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user && isEditing) {
      setFormData({
        name: user.name,
        email: user.email,
        adminRole: user.adminRole,
        isActive: user.isActive,
      });
      setPassword('');
    } else {
      setFormData({
        name: '',
        email: '',
        adminRole: 'read_only',
        isActive: true,
      });
      setPassword('');
    }
  }, [user, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = { ...formData };
    if (!isEditing && password) {
      (userData as any).password = password;
    }
    onSave(userData);
  };

  const selectedRole = roles.find(role => role.name === formData.adminRole);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent
        bg="bg.surface"
        background="#1A1A1A"
        borderColor="border.primary"
      >
        <form onSubmit={handleSubmit}>
          <ModalHeader
            bg="bg.surface"
            background="#1A1A1A"
            borderBottom="1px solid"
            borderColor="border.primary"
          >
            {isEditing ? 'Edit Admin User' : 'Add New Admin'}
          </ModalHeader>
          <ModalBody bg="bg.surface" background="#1A1A1A">
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </FormControl>

              {!isEditing && (
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        icon={<Icon as={showPassword ? FiEyeOff : FiEye} />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>Admin Role</FormLabel>
                <Select
                  value={formData.adminRole}
                  onChange={e =>
                    setFormData({ ...formData, adminRole: e.target.value })
                  }
                >
                  {roles.map(role => (
                    <option key={role.name} value={role.name}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </Select>
                {selectedRole && (
                  <FormHelperText>
                    <Text fontSize="sm" color="text.secondary" mt={2}>
                      <strong>Permissions:</strong>{' '}
                      {selectedRole.permissions.length === 1 &&
                      selectedRole.permissions[0] === '*'
                        ? 'All permissions'
                        : selectedRole.permissions.join(', ')}
                    </Text>
                  </FormHelperText>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Status</FormLabel>
                <HStack>
                  <Switch
                    isChecked={formData.isActive}
                    onChange={e =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  <Text>{formData.isActive ? 'Active' : 'Inactive'}</Text>
                </HStack>
                <FormHelperText>
                  Inactive users cannot access the admin panel.
                </FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter
            bg="bg.surface"
            background="#1A1A1A"
            borderTop="1px solid"
            borderColor="border.primary"
          >
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" colorScheme="brand">
              {isEditing ? 'Update User' : 'Create Admin'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
