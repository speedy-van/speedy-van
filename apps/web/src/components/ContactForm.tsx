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

interface Contact {
  id?: string;
  label: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  isDefault?: boolean;
}

interface ContactFormProps {
  contact?: Contact;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => Promise<void>;
  mode: 'create' | 'edit';
}

export function ContactForm({
  contact,
  isOpen,
  onClose,
  onSave,
  mode,
}: ContactFormProps) {
  const [formData, setFormData] = useState<Contact>({
    label: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
    isDefault: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (contact && mode === 'edit') {
      setFormData(contact);
    } else {
      setFormData({
        label: '',
        name: '',
        phone: '',
        email: '',
        notes: '',
        isDefault: false,
      });
    }
    setErrors({});
  }, [contact, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
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
        title: mode === 'create' ? 'Contact saved' : 'Contact updated',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save contact',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === 'create' ? 'Add New Contact' : 'Edit Contact'}
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.label}>
                <FormLabel>Label</FormLabel>
                <Input
                  placeholder="e.g., Myself, Partner, Work contact"
                  value={formData.label}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, label: e.target.value }))
                  }
                />
                <FormErrorMessage>{errors.label}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Full Name</FormLabel>
                <Input
                  placeholder="Full name"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.phone}>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, phone: e.target.value }))
                  }
                />
                <FormErrorMessage>{errors.phone}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email (Optional)</FormLabel>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, email: e.target.value }))
                  }
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Notes (Optional)</FormLabel>
                <Textarea
                  placeholder="Additional notes about this contact"
                  value={formData.notes}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <Checkbox
                  isChecked={formData.isDefault}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      isDefault: e.target.checked,
                    }))
                  }
                >
                  Set as default contact
                </Checkbox>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isLoading}
                loadingText={mode === 'create' ? 'Saving...' : 'Updating...'}
              >
                {mode === 'create' ? 'Save Contact' : 'Update Contact'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
