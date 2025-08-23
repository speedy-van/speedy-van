'use client';

import React from 'react';
import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  VStack,
  useColorModeValue,
  FormErrorMessage
} from '@chakra-ui/react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  error?: string;
}

interface IOSOptimizedFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  submitText?: string;
  loading?: boolean;
  className?: string;
}

export default function IOSOptimizedForm({
  fields,
  onSubmit,
  submitText = 'Submit',
  loading = false,
  className = ''
}: IOSOptimizedFormProps) {
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error when typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  // Validation
  const validateField = (field: FormField) => {
    if (field.required && !formData[field.name]) {
      return `Field is required`;
    }
    
    if (field.type === 'email' && formData[field.name]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData[field.name])) {
        return 'Invalid email address';
      }
    }
    
    if (field.type === 'tel' && formData[field.name]) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(formData[field.name])) {
        return 'Invalid phone number';
      }
    }
    
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const error = validateField(field);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({});
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      value: formData[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleFieldChange(field.name, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
      isInvalid: !!errors[field.name],
      fontSize: '16px', // Prevent auto-zoom in iOS
      minH: '44px', // Minimum touch height
      className: 'mobile-button',
      sx: {
        scrollMarginTop: '96px', // Prevent field from hiding under header
        '-webkit-appearance': 'none',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: errors[field.name] ? 'red.300' : borderColor,
        _focus: {
          borderColor: 'green.400',
          boxShadow: '0 0 0 1px var(--chakra-colors-green-400)',
        }
      }
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={4}
            resize="vertical"
          />
        );

      case 'select':
        return (
          <Select {...commonProps}>
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
            autoComplete={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'off'}
          />
        );
    }
  };

  return (
    <Box
      className={`ios-optimized-form ${className}`}
      as="form"
      onSubmit={handleSubmit}
      bg={bgColor}
      borderRadius="12px"
      p="6"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
      border="1px solid"
      borderColor={borderColor}
    >
      <VStack spacing="6" align="stretch">
        {fields.map((field) => (
          <FormControl
            key={field.name}
            id={field.name}
            isRequired={field.required}
            isInvalid={!!errors[field.name]}
          >
            <FormLabel
              fontSize="14px"
              fontWeight="500"
              color={useColorModeValue('gray.700', 'gray.200')}
              mb="2"
            >
              {field.label}
            </FormLabel>
            
            {renderField(field)}
            
            {errors[field.name] && (
              <FormErrorMessage fontSize="12px">
                {errors[field.name]}
              </FormErrorMessage>
            )}
          </FormControl>
        ))}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          loadingText="Sending..."
          minH="48px"
          fontSize="16px"
          className="mobile-button"
          sx={{
            touchAction: 'manipulation',
            '-webkit-tap-highlight-color': 'transparent'
          }}
        >
          {submitText}
        </Button>
      </VStack>
    </Box>
  );
}
