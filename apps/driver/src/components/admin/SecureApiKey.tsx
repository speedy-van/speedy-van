'use client';

import React, { useState } from 'react';
import {
  HStack,
  Input,
  Button,
  IconButton,
  useToast,
  Tooltip,
  Box,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiCopy, FiCheck } from 'react-icons/fi';

interface SecureApiKeyProps {
  value: string;
  label?: string;
  placeholder?: string;
  isReadOnly?: boolean;
  showCopyButton?: boolean;
  showToggleVisibility?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function SecureApiKey({
  value,
  label,
  placeholder = 'API Key',
  isReadOnly = true,
  showCopyButton = true,
  showToggleVisibility = true,
  size = 'md',
}: SecureApiKeyProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setHasCopied(true);
      toast({
        title: 'Copied!',
        description: 'API key copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy API key to clipboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const displayValue = isVisible
    ? value
    : '•'.repeat(Math.min(value.length, 32));

  return (
    <VStack align="stretch" spacing={2}>
      {label && (
        <Text fontSize="sm" fontWeight="medium" color="gray.700">
          {label}
        </Text>
      )}

      <HStack spacing={2}>
        <Input
          value={displayValue}
          placeholder={placeholder}
          isReadOnly={isReadOnly}
          size={size}
          fontFamily="mono"
          fontSize="sm"
          bg="gray.50"
          borderColor="gray.200"
          _readOnly={{
            bg: 'gray.50',
            cursor: 'default',
          }}
        />

        {showToggleVisibility && (
          <Tooltip label={isVisible ? 'Hide API key' : 'Show API key'}>
            <IconButton
              aria-label={isVisible ? 'Hide API key' : 'Show API key'}
              icon={isVisible ? <FiEyeOff /> : <FiEye />}
              onClick={toggleVisibility}
              size={size}
              variant="outline"
            />
          </Tooltip>
        )}

        {showCopyButton && (
          <Tooltip label={hasCopied ? 'Copied!' : 'Copy API key'}>
            <IconButton
              aria-label="Copy API key"
              icon={hasCopied ? <FiCheck /> : <FiCopy />}
              onClick={handleCopy}
              size={size}
              variant="outline"
              colorScheme={hasCopied ? 'green' : 'gray'}
            />
          </Tooltip>
        )}
      </HStack>

      <Text fontSize="xs" color="gray.500">
        {isVisible
          ? 'API key is visible - be careful with this information'
          : 'API key is hidden for security'}
      </Text>
    </VStack>
  );
}
