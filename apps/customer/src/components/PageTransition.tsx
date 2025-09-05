'use client';

import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { pageVariants, getMotionVariants } from '@/lib/motion';

const MotionBox = motion.create(Box);

interface PageTransitionProps extends BoxProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'scale';
  duration?: number;
}

const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
};

export function PageTransition({
  children,
  variant = 'fade',
  duration,
  ...props
}: PageTransitionProps) {
  const baseVariants =
    transitionVariants[variant as keyof typeof transitionVariants];
  const variants = getMotionVariants(baseVariants);

  // Filter out problematic props
  const {
    transition,
    onAnimationStart,
    onAnimationEnd,
    onDragStart,
    onDragEnd,
    onDrag,
    ...safeProps
  } = props;

  return (
    <MotionBox
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...safeProps}
    >
      {children}
    </MotionBox>
  );
}

export default PageTransition;
