'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  IconButton,
  useColorModeValue,
  Progress,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion.create(Box);
import { motionVariants, getMotionVariants } from '@/lib/motion';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiX,
  FiClock,
  FiWifi,
  FiWifiOff,
} from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  timestamp: Date;
}

interface RealTimeToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxToasts?: number;
}

const toastIcons = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  warning: FiAlertCircle,
  info: FiInfo,
  loading: FiClock,
};

const toastColors = {
  success: { bg: 'green.50', color: 'green.600', border: 'green.200' },
  error: { bg: 'red.50', color: 'red.600', border: 'red.200' },
  warning: { bg: 'yellow.50', color: 'yellow.600', border: 'yellow.200' },
  info: { bg: 'blue.50', color: 'blue.600', border: 'blue.200' },
  loading: { bg: 'gray.50', color: 'gray.600', border: 'gray.200' },
};

export function RealTimeToast({ 
  toasts, 
  onDismiss, 
  position = 'top-right',
  maxToasts = 5 
}: RealTimeToastProps) {
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Auto-dismiss toasts with duration
  useEffect(() => {
    const timers: Record<string, NodeJS.Timeout> = {};

    toasts.forEach(toast => {
      if (toast.duration && !toast.persistent && !timers[toast.id]) {
        timers[toast.id] = setTimeout(() => {
          onDismiss(toast.id);
        }, toast.duration);

        // Start progress animation
        const startTime = Date.now();
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.max(0, 100 - (elapsed / toast.duration!) * 100);
          setProgressMap(prev => ({ ...prev, [toast.id]: progress }));
          
          if (progress <= 0) {
            clearInterval(progressInterval);
          }
        }, 50);
      }
    });

    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [toasts, onDismiss]);

  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return { top: 4, right: 4 };
      case 'top-left':
        return { top: 4, left: 4 };
      case 'bottom-right':
        return { bottom: 4, right: 4 };
      case 'bottom-left':
        return { bottom: 4, left: 4 };
      default:
        return { top: 4, right: 4 };
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      position="fixed"
      zIndex={9999}
      {...getPositionStyles()}
      maxW="400px"
      w="full"
    >
      <AnimatePresence>
        <VStack spacing={3} align="stretch">
        {toasts.slice(0, maxToasts).map((toast) => {
          const colors = toastColors[toast.type];
          const IconComponent = toastIcons[toast.type];

          return (
            <MotionBox
              key={toast.id}
              variants={getMotionVariants(motionVariants.fadeInUp)}
              initial="initial"
              animate="animate"
              exit="exit"
              bg={bgColor}
              border="1px solid"
              borderColor={colors.border}
              borderRadius="lg"
              boxShadow="lg"
              p={4}
              position="relative"
              overflow="hidden"
            >
                {/* Progress bar for auto-dismiss */}
                {toast.duration && !toast.persistent && (
                  <Progress
                    value={progressMap[toast.id] || 100}
                    size="xs"
                    colorScheme={toast.type === 'success' ? 'green' : 
                                toast.type === 'error' ? 'red' : 
                                toast.type === 'warning' ? 'yellow' : 'blue'}
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    borderRadius="lg"
                  />
                )}

                <HStack spacing={3} align="start">
                  <Icon
                    as={IconComponent}
                    boxSize={5}
                    color={colors.color}
                    flexShrink={0}
                  />
                  
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="semibold" fontSize="sm">
                        {toast.title}
                      </Text>
                      <HStack spacing={2}>
                        <Text fontSize="xs" color="gray.500">
                          {formatTime(toast.timestamp)}
                        </Text>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          icon={<Icon as={FiX} />}
                          onClick={() => onDismiss(toast.id)}
                          aria-label="Dismiss toast"
                        />
                      </HStack>
                    </HStack>
                    
                    {toast.message && (
                      <Text fontSize="sm" color="gray.600">
                        {toast.message}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </MotionBox>
            );
                    })}
        </VStack>
      </AnimatePresence>
    </Box>
  );
}

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id' | 'timestamp'>) => {
    const newToast: Toast = {
      ...toast,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setToasts(prev => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    dismissToast,
    clearAll,
  };
}

// Utility functions for common toast types
export const toastUtils = {
  success: (title: string, message?: string, duration = 5000) => ({
    type: 'success' as ToastType,
    title,
    message,
    duration,
  }),
  error: (title: string, message?: string, duration = 7000) => ({
    type: 'error' as ToastType,
    title,
    message,
    duration,
  }),
  warning: (title: string, message?: string, duration = 6000) => ({
    type: 'warning' as ToastType,
    title,
    message,
    duration,
  }),
  info: (title: string, message?: string, duration = 5000) => ({
    type: 'info' as ToastType,
    title,
    message,
    duration,
  }),
  loading: (title: string, message?: string) => ({
    type: 'loading' as ToastType,
    title,
    message,
    persistent: true,
  }),
};
