'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  VStack,
  HStack,
  Checkbox,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import AddressAutocomplete from './AddressAutocomplete';

interface Address {
  id?: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  floor?: string;
  flat?: string;
  lift?: boolean;
  notes?: string;
  isDefault?: boolean;
}

interface SingleAddressFormProps {
  address?: Address;
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => Promise<void>;
  mode: 'create' | 'edit';
}

export function SingleAddressForm({
  address,
  isOpen,
  onClose,
  onSave,
  mode,
}: SingleAddressFormProps) {
  const [formData, setFormData] = useState<Address>({
    label: '',
    line1: '',
    line2: '',
    city: '',
    postcode: '',
    floor: '',
    flat: '',
    lift: false,
    notes: '',
    isDefault: false,
  });
  const [searchValue, setSearchValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (address && mode === 'edit') {
      setFormData(address);
      setSearchValue(address.label);
    } else {
      setFormData({
        label: '',
        line1: '',
        line2: '',
        city: '',
        postcode: '',
        floor: '',
        flat: '',
        lift: false,
        notes: '',
        isDefault: false,
      });
      setSearchValue('');
    }
    setErrors({});
  }, [address, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }
    if (!formData.line1.trim()) {
      newErrors.line1 = 'Address line 1 is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      toast({
        title: mode === 'create' ? 'Address created' : 'Address updated',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save address',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === 'create' ? 'Add New Address' : 'Edit Address'}
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.label}>
                <FormLabel>Address Label</FormLabel>
                <Input
                  value={formData.label}
                  onChange={e =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  placeholder="e.g., Home, Work, Grandma's House"
                />
                <FormErrorMessage>{errors.label}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Search Address</FormLabel>
                <AddressAutocomplete
                  value={searchValue}
                  onChange={setSearchValue}
                  onSelect={sel => {
                    // Ensure we have proper address data
                    let line1 =
                      sel.address.line1 || sel.label.split(',')[0] || sel.label;
                    let city = sel.address.city || '';
                    let postcode = sel.address.postcode || '';

                    // If we don't have proper city/postcode, try to extract from label
                    if (!city || !postcode) {
                      const parts = sel.label.split(',');
                      if (parts.length > 1) {
                        // Last part is usually postcode
                        postcode = postcode || parts[parts.length - 1].trim();
                        // Middle parts are usually city
                        city = city || parts.slice(1, -1).join(',').trim();
                      }
                    }

                    // Ensure line1 is not too short
                    if (!line1 || line1.length < 3) {
                      line1 = sel.label.split(',')[0] || sel.label;
                    }

                    const addressData = {
                      ...formData,
                      label: sel.label,
                      line1,
                      city,
                      postcode,
                    };

                    setFormData(addressData);
                    setSearchValue(sel.label);
                  }}
                  placeholder="Search for an address..."
                />
              </FormControl>

              <FormControl isInvalid={!!errors.line1}>
                <FormLabel>Address Line 1</FormLabel>
                <Input
                  value={formData.line1}
                  onChange={e =>
                    setFormData({ ...formData, line1: e.target.value })
                  }
                  placeholder="Street address"
                />
                <FormErrorMessage>{errors.line1}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Address Line 2 (Optional)</FormLabel>
                <Input
                  value={formData.line2 || ''}
                  onChange={e =>
                    setFormData({ ...formData, line2: e.target.value })
                  }
                  placeholder="Apartment, suite, etc."
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isInvalid={!!errors.city}>
                  <FormLabel>City</FormLabel>
                  <Input
                    value={formData.city}
                    onChange={e =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="City"
                  />
                  <FormErrorMessage>{errors.city}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.postcode}>
                  <FormLabel>Postcode</FormLabel>
                  <Input
                    value={formData.postcode}
                    onChange={e =>
                      setFormData({ ...formData, postcode: e.target.value })
                    }
                    placeholder="Postcode"
                  />
                  <FormErrorMessage>{errors.postcode}</FormErrorMessage>
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Floor (Optional)</FormLabel>
                  <Input
                    value={formData.floor || ''}
                    onChange={e =>
                      setFormData({ ...formData, floor: e.target.value })
                    }
                    placeholder="Floor number"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Flat/Apartment (Optional)</FormLabel>
                  <Input
                    value={formData.flat || ''}
                    onChange={e =>
                      setFormData({ ...formData, flat: e.target.value })
                    }
                    placeholder="Flat/Apartment number"
                  />
                </FormControl>
              </HStack>

              <Checkbox
                isChecked={formData.lift || false}
                onChange={e =>
                  setFormData({ ...formData, lift: e.target.checked })
                }
              >
                Lift available at this address
              </Checkbox>

              <FormControl>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <Textarea
                  value={formData.notes || ''}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any special instructions or notes about this address..."
                  rows={3}
                />
              </FormControl>

              <Checkbox
                isChecked={formData.isDefault || false}
                onChange={e =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
              >
                Set as default address
              </Checkbox>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
                loadingText={mode === 'create' ? 'Creating...' : 'Updating...'}
              >
                {mode === 'create' ? 'Create Address' : 'Update Address'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
