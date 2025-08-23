'use client';

import React from 'react';
import { Badge, BadgeProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { motionVariants, statusAnimations, getMotionVariants } from '@/lib/motion';

const MotionBadge = motion.create(Badge);

export type StatusType = 'new' | 'active' | 'success' | 'error' | 'warning' | 'info' | 'pending' | 'completed' | 'cancelled';

interface StatusChipProps extends Omit<BadgeProps, 'colorScheme'> {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showIcon?: boolean;
}

const statusConfig = {
  new: {
    color: 'yellow',
    bg: 'yellow.50',
    textColor: 'yellow.800',
    borderColor: 'yellow.200',
    icon: '🆕',
  },
  active: {
    color: 'blue',
    bg: 'blue.50',
    textColor: 'blue.800',
    borderColor: 'blue.200',
    icon: '🔄',
  },
  success: {
    color: 'green',
    bg: 'green.50',
    textColor: 'green.800',
    borderColor: 'green.200',
    icon: '✅',
  },
  error: {
    color: 'red',
    bg: 'red.50',
    textColor: 'red.800',
    borderColor: 'red.200',
    icon: '❌',
  },
  warning: {
    color: 'orange',
    bg: 'orange.50',
    textColor: 'orange.800',
    borderColor: 'orange.200',
    icon: '⚠️',
  },
  info: {
    color: 'cyan',
    bg: 'cyan.50',
    textColor: 'cyan.800',
    borderColor: 'cyan.200',
    icon: 'ℹ️',
  },
  pending: {
    color: 'purple',
    bg: 'purple.50',
    textColor: 'purple.800',
    borderColor: 'purple.200',
    icon: '⏳',
  },
  completed: {
    color: 'green',
    bg: 'green.50',
    textColor: 'green.800',
    borderColor: 'green.200',
    icon: '🎉',
  },
  cancelled: {
    color: 'gray',
    bg: 'gray.50',
    textColor: 'gray.800',
    borderColor: 'gray.200',
    icon: '🚫',
  },
};

const sizeConfig = {
  sm: {
    px: 2,
    py: 1,
    fontSize: 'xs',
    borderRadius: 'full',
  },
  md: {
    px: 3,
    py: 1.5,
    fontSize: 'sm',
    borderRadius: 'full',
  },
  lg: {
    px: 4,
    py: 2,
    fontSize: 'md',
    borderRadius: 'full',
  },
};

export function StatusChip({ 
  status, 
  size = 'md', 
  animated = true, 
  showIcon = false,
  children,
  ...props 
}: StatusChipProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  
  if (!config) {
    console.warn(`Unknown status type: ${status}`);
    return null;
  }

  const variants = animated 
    ? getMotionVariants(motionVariants.statusChip)
    : { initial: {}, animate: {}, exit: {} };

  // Filter out problematic props that might conflict with motion
  const { transition, onAnimationStart, onAnimationEnd, onDragStart, onDragEnd, onDrag, ...safeProps } = props;

  return (
    <MotionBadge
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      colorScheme={config.color}
      bg={config.bg}
      color={config.textColor}
      borderColor={config.borderColor}
      borderWidth="1px"
      fontWeight="medium"
      textTransform="none"
      display="inline-flex"
      alignItems="center"
      gap={showIcon ? 1 : 0}
      {...sizeStyles}
      {...safeProps}
    >
      {showIcon && (
        <span role="img" aria-label={`${status} status`}>
          {config.icon}
        </span>
      )}
      {children || status.charAt(0).toUpperCase() + status.slice(1)}
    </MotionBadge>
  );
}

export default StatusChip;
