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
  success: { bg: 'success.500', color: 'white', border: 'success.400' },
  error: { bg: 'error.500', color: 'white', border: 'error.400' },
  warning: { bg: 'warning.500', color: 'white', border: 'warning.400' },
  info: { bg: 'info.500', color: 'white', border: 'info.400' },
  loading: { bg: 'neon.500', color: 'dark.900', border: 'neon.400' },
};

export function RealTimeToast({
  toasts,
  onDismiss,
  position = 'top-right',
  maxToasts = 5,
}: RealTimeToastProps) {
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  // Use neon dark theme colors
  const bgColor = 'bg.surface';
  const borderColor = 'border.primary';

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-dismiss toasts with duration
  useEffect(() => {
    if (!mounted) return;

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
  }, [toasts, onDismiss, mounted]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

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
          {toasts.slice(0, maxToasts).map(toast => {
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
                    colorScheme={
                      toast.type === 'success'
                        ? 'green'
                        : toast.type === 'error'
                          ? 'red'
                          : toast.type === 'warning'
                            ? 'yellow'
                            : 'blue'
                    }
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
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
                      <Text
                        fontWeight="semibold"
                        fontSize="sm"
                        color="text.primary"
                      >
                        {toast.title}
                      </Text>
                      <HStack spacing={2}>
                        <Text fontSize="xs" color="text.tertiary">
                          {formatTime(toast.timestamp)}
                        </Text>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          icon={<Icon as={FiX} />}
                          onClick={() => onDismiss(toast.id)}
                          aria-label="Dismiss toast"
                          color="text.secondary"
                          _hover={{
                            bg: 'bg.surface.hover',
                            color: 'text.primary',
                          }}
                        />
                      </HStack>
                    </HStack>

                    {toast.message && (
                      <Text fontSize="sm" color="text.secondary">
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
