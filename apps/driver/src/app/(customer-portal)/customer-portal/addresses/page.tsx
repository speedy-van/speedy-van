'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Grid,
  GridItem,
  IconButton,
  Tooltip,
  Badge,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { SingleAddressForm } from '@/components/SingleAddressForm';
import { ContactForm } from '@/components/ContactForm';

interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  floor?: string;
  flat?: string;
  lift?: boolean;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Contact {
  id: string;
  label: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>();
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [deleteAddress, setDeleteAddress] = useState<Address | null>(null);
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);

  const {
    isOpen: isAddressFormOpen,
    onOpen: onAddressFormOpen,
    onClose: onAddressFormClose,
  } = useDisclosure();
  const {
    isOpen: isContactFormOpen,
    onOpen: onContactFormOpen,
    onClose: onContactFormClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteAddressOpen,
    onOpen: onDeleteAddressOpen,
    onClose: onDeleteAddressClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteContactOpen,
    onOpen: onDeleteContactOpen,
    onClose: onDeleteContactClose,
  } = useDisclosure();

  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Fetch addresses and contacts
  const fetchData = async () => {
    try {
      const [addressesRes, contactsRes] = await Promise.all([
        fetch('/api/portal/addresses'),
        fetch('/api/portal/contacts'),
      ]);

      if (addressesRes.ok) {
        const addressesData = await addressesRes.json();
        setAddresses(addressesData.addresses);
      }

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData.contacts);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load addresses and contacts',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Address handlers
  const handleAddAddress = () => {
    setSelectedAddress(undefined);
    onAddressFormOpen();
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    onAddressFormOpen();
  };

  const handleSaveAddress = async (addressData: any) => {
    try {
      const method = selectedAddress ? 'PUT' : 'POST';
      const body = selectedAddress
        ? { ...addressData, id: selectedAddress.id }
        : addressData;

      const response = await fetch('/api/portal/addresses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save address');
      }

      await fetchData();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteAddress = (address: Address) => {
    setDeleteAddress(address);
    onDeleteAddressOpen();
  };

  const confirmDeleteAddress = async () => {
    if (!deleteAddress) return;

    try {
      const response = await fetch(
        `/api/portal/addresses?id=${deleteAddress.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      await fetchData();
      toast({
        title: 'Address deleted',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete address',
        status: 'error',
        duration: 5000,
      });
    } finally {
      onDeleteAddressClose();
      setDeleteAddress(null);
    }
  };

  // Contact handlers
  const handleAddContact = () => {
    setSelectedContact(undefined);
    onContactFormOpen();
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    onContactFormOpen();
  };

  const handleSaveContact = async (contactData: any) => {
    try {
      const method = selectedContact ? 'PUT' : 'POST';
      const body = selectedContact
        ? { ...contactData, id: selectedContact.id }
        : contactData;

      const response = await fetch('/api/portal/contacts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save contact');
      }

      await fetchData();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteContact = (contact: Contact) => {
    setDeleteContact(contact);
    onDeleteContactOpen();
  };

  const confirmDeleteContact = async () => {
    if (!deleteContact) return;

    try {
      const response = await fetch(
        `/api/portal/contacts?id=${deleteContact.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      await fetchData();
      toast({
        title: 'Contact deleted',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete contact',
        status: 'error',
        duration: 5000,
      });
    } finally {
      onDeleteContactClose();
      setDeleteContact(null);
    }
  };

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <VStack align="stretch" spacing={8}>
      <Box>
        <Heading size="lg" mb={2}>
          Addresses & Contacts
        </Heading>
        <Text color="gray.600">
          Manage your saved addresses and contacts for quick booking
        </Text>
      </Box>

      {/* Saved Addresses Section */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Saved Addresses</Heading>
          <Button size="sm" colorScheme="blue" onClick={handleAddAddress}>
            Add New Address
          </Button>
        </HStack>

        {addresses.length === 0 ? (
          <Box
            textAlign="center"
            py={8}
            borderWidth="1px"
            borderRadius="md"
            borderStyle="dashed"
          >
            <Text fontSize="lg" mb={2}>
              No saved addresses
            </Text>
            <Text color="gray.600" mb={4}>
              Save your frequently used addresses to speed up future bookings.
            </Text>
            <Button colorScheme="blue" size="sm" onClick={handleAddAddress}>
              Add Your First Address
            </Button>
          </Box>
        ) : (
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={4}
          >
            {addresses.map(address => (
              <GridItem key={address.id}>
                <Box
                  borderWidth="1px"
                  borderRadius="lg"
                  p={4}
                  bg="white"
                  shadow="sm"
                  position="relative"
                >
                  <HStack justify="space-between" mb={2}>
                    <HStack spacing={2}>
                      <Badge colorScheme="blue" variant="subtle">
                        {address.label}
                      </Badge>
                      {address.isDefault && (
                        <Badge colorScheme="green" variant="subtle" size="sm">
                          Default
                        </Badge>
                      )}
                    </HStack>
                    <HStack spacing={1}>
                      <Tooltip label="Edit address">
                        <IconButton
                          aria-label="Edit address"
                          icon={<span>✏️</span>}
                          size="xs"
                          variant="ghost"
                          onClick={() => handleEditAddress(address)}
                        />
                      </Tooltip>
                      <Tooltip label="Delete address">
                        <IconButton
                          aria-label="Delete address"
                          icon={<span>🗑️</span>}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDeleteAddress(address)}
                        />
                      </Tooltip>
                    </HStack>
                  </HStack>

                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">{address.line1}</Text>
                    {address.line2 && (
                      <Text fontSize="sm">{address.line2}</Text>
                    )}
                    <Text fontSize="sm">
                      {address.city}, {address.postcode}
                    </Text>
                    {(address.floor || address.flat) && (
                      <Text fontSize="sm" color="gray.600">
                        Floor: {address.floor || 'N/A'} | Flat:{' '}
                        {address.flat || 'N/A'}
                      </Text>
                    )}
                    {address.lift !== undefined && (
                      <Text fontSize="sm" color="gray.600">
                        Lift available: {address.lift ? 'Yes' : 'No'}
                      </Text>
                    )}
                    {address.notes && (
                      <Text fontSize="sm" color="gray.600" fontStyle="italic">
                        "{address.notes}"
                      </Text>
                    )}
                  </VStack>
                </Box>
              </GridItem>
            ))}
          </Grid>
        )}
      </Box>

      {/* Saved Contacts Section */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Saved Contacts</Heading>
          <Button size="sm" colorScheme="blue" onClick={handleAddContact}>
            Add New Contact
          </Button>
        </HStack>

        {contacts.length === 0 ? (
          <Box
            textAlign="center"
            py={8}
            borderWidth="1px"
            borderRadius="md"
            borderStyle="dashed"
          >
            <Text fontSize="lg" mb={2}>
              No saved contacts
            </Text>
            <Text color="gray.600" mb={4}>
              Save your contacts to prefill booking forms quickly.
            </Text>
            <Button colorScheme="blue" size="sm" onClick={handleAddContact}>
              Add Your First Contact
            </Button>
          </Box>
        ) : (
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={4}
          >
            {contacts.map(contact => (
              <GridItem key={contact.id}>
                <Box
                  borderWidth="1px"
                  borderRadius="lg"
                  p={4}
                  bg="white"
                  shadow="sm"
                  position="relative"
                >
                  <HStack justify="space-between" mb={2}>
                    <HStack spacing={2}>
                      <Badge colorScheme="green" variant="subtle">
                        {contact.label}
                      </Badge>
                      {contact.isDefault && (
                        <Badge colorScheme="blue" variant="subtle" size="sm">
                          Default
                        </Badge>
                      )}
                    </HStack>
                    <HStack spacing={1}>
                      <Tooltip label="Edit contact">
                        <IconButton
                          aria-label="Edit contact"
                          icon={<span>✏️</span>}
                          size="xs"
                          variant="ghost"
                          onClick={() => handleEditContact(contact)}
                        />
                      </Tooltip>
                      <Tooltip label="Delete contact">
                        <IconButton
                          aria-label="Delete contact"
                          icon={<span>🗑️</span>}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDeleteContact(contact)}
                        />
                      </Tooltip>
                    </HStack>
                  </HStack>

                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium">{contact.name}</Text>
                    <Text fontSize="sm">{contact.phone}</Text>
                    {contact.email && (
                      <Text fontSize="sm" color="blue.600">
                        {contact.email}
                      </Text>
                    )}
                    {contact.notes && (
                      <Text fontSize="sm" color="gray.600" fontStyle="italic">
                        "{contact.notes}"
                      </Text>
                    )}
                  </VStack>
                </Box>
              </GridItem>
            ))}
          </Grid>
        )}
      </Box>

      {/* Quick Actions */}
      <Box p={4} bg="blue.50" borderRadius="md">
        <Text fontSize="sm" color="blue.800">
          💡 <strong>Tip:</strong> Saved addresses and contacts will
          automatically prefill when you make new bookings, saving you time!
        </Text>
      </Box>

      {/* Address Form Modal */}
      <SingleAddressForm
        address={selectedAddress}
        isOpen={isAddressFormOpen}
        onClose={onAddressFormClose}
        onSave={handleSaveAddress}
        mode={selectedAddress ? 'edit' : 'create'}
      />

      {/* Contact Form Modal */}
      <ContactForm
        contact={selectedContact}
        isOpen={isContactFormOpen}
        onClose={onContactFormClose}
        onSave={handleSaveContact}
        mode={selectedContact ? 'edit' : 'create'}
      />

      {/* Delete Address Confirmation */}
      <AlertDialog
        isOpen={isDeleteAddressOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAddressClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Address
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{deleteAddress?.label}"? This
              action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAddressClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteAddress} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Delete Contact Confirmation */}
      <AlertDialog
        isOpen={isDeleteContactOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteContactClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Contact
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{deleteContact?.label}"? This
              action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteContactClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteContact} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
}
