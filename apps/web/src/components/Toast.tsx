'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Text, 
  Icon, 
  Flex, 
  Button, 
  Slide, 
  useColorModeValue,
  CloseButton,
  VStack,
  HStack,
  Badge,
  Progress
} from '@chakra-ui/react';
import { 
  CheckCircleIcon, 
  WarningIcon, 
  InfoIcon, 
  CloseIcon 
} from '@chakra-ui/icons';
// import { ToastNotification } from '@/lib/error-handling';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss, position = 'top-right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const shadow = useColorModeValue('lg', 'dark-lg');

  // Get icon and color based on toast type
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          color: 'green.500',
          bg: 'green.50',
          borderColor: 'green.200',
        };
      case 'error':
        return {
          icon: CloseIcon,
          color: 'red.500',
          bg: 'red.50',
          borderColor: 'red.200',
        };
      case 'warning':
        return {
          icon: WarningIcon,
          color: 'orange.500',
          bg: 'orange.50',
          borderColor: 'orange.200',
        };
      case 'info':
        return {
          icon: InfoIcon,
          color: 'blue.500',
          bg: 'blue.50',
          borderColor: 'blue.200',
        };
      default:
        return {
          icon: InfoIcon,
          color: 'gray.500',
          bg: 'gray.50',
          borderColor: 'gray.200',
        };
    }
  };

  const styles = getToastStyles();

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss with progress bar
  useEffect(() => {
    if (toast.duration !== undefined && toast.duration > 0) {
      const startTime = Date.now();
      const endTime = startTime + toast.duration;
      
      const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const newProgress = (remaining / (toast.duration || 0)) * 100;
        
        setProgress(newProgress);
        
        if (remaining > 0) {
          requestAnimationFrame(updateProgress);
        } else {
          onDismiss(toast.id);
        }
      };
      
      requestAnimationFrame(updateProgress);
    }
  }, [toast.duration, toast.id, onDismiss]);

  // Handle manual dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(toast.id), 300); // Wait for slide animation
  };

  // Handle action click
  const handleAction = () => {
    if (toast.action?.onClick) {
      toast.action.onClick();
    }
    handleDismiss();
  };

  return (
    <Slide direction="right" in={isVisible} style={{ zIndex: 9999 }}>
      <Box
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        boxShadow={shadow}
        maxW="400px"
        minW="300px"
        p={4}
        position="relative"
        overflow="hidden"
        _hover={{ transform: 'translateY(-2px)', transition: 'transform 0.2s' }}
      >
        {/* Progress bar */}
        {toast.duration && toast.duration > 0 && (
          <Progress
            value={progress}
            size="xs"
            colorScheme={toast.type === 'error' ? 'error' : toast.type === 'success' ? 'success' : 'info'}
            position="absolute"
            top={0}
            left={0}
            right={0}
            borderRadius="md"
          />
        )}

        <Flex align="start" justify="space-between">
          <Flex align="start" flex={1}>
            {/* Icon */}
            <Icon
              as={styles.icon}
              color={styles.color}
              boxSize={5}
              mt={0.5}
              mr={3}
              flexShrink={0}
            />

            {/* Content */}
            <VStack align="start" spacing={1} flex={1}>
              <HStack justify="space-between" w="full">
                <Text fontWeight="semibold" fontSize="sm">
                  {toast.title}
                </Text>
                {toast.type && (
                  <Badge
                    size="sm"
                    colorScheme={
                      toast.type === 'error' ? 'error' :
                      toast.type === 'success' ? 'success' :
                      toast.type === 'warning' ? 'warning' : 'info'
                    }
                    variant="subtle"
                  >
                    {toast.type}
                  </Badge>
                )}
              </HStack>
              
              {toast.message && (
                <Text fontSize="sm" color="gray.600" lineHeight="short">
                  {toast.message}
                </Text>
              )}

              {/* Action button */}
              {toast.action && (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme={
                    toast.type === 'error' ? 'error' :
                    toast.type === 'success' ? 'success' :
                    toast.type === 'warning' ? 'warning' : 'info'
                  }
                  onClick={handleAction}
                  mt={2}
                >
                  {toast.action.label}
                </Button>
              )}
            </VStack>
          </Flex>

          {/* Close button */}
          {toast.dismissible !== false && (
            <CloseButton
              size="sm"
              onClick={handleDismiss}
              ml={2}
              color="gray.400"
              _hover={{ color: 'gray.600' }}
            />
          )}
        </Flex>
      </Box>
    </Slide>
  );
};

// Toast container component
interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      pointerEvents: 'none' as const,
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: 4, right: 4 };
      case 'top-left':
        return { ...baseStyles, top: 4, left: 4 };
      case 'bottom-right':
        return { ...baseStyles, bottom: 4, right: 4 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 4, left: 4 };
      case 'top-center':
        return { ...baseStyles, top: 4, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...baseStyles, bottom: 4, left: '50%', transform: 'translateX(-50%)' };
      default:
        return { ...baseStyles, top: 4, right: 4 };
    }
  };

  const visibleToasts = toasts.slice(0, maxToasts);

  return (
    <Box {...getPositionStyles()}>
      <VStack spacing={3} align="stretch" pointerEvents="auto">
        {visibleToasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            position={position}
          />
        ))}
      </VStack>
    </Box>
  );
};

// Hook to use toast container
export const useToastContainer = () => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const newToast: ToastNotification = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random()}`,
    };
    setToasts(prev => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    dismissToast,
    clearToasts,
  };
};

export default Toast;
