'use client';

import React from 'react';
import { Card, CardProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  motionVariants,
  getMotionVariants,
  createHoverAnimation,
  createPressAnimation,
} from '@/lib/motion';

const MotionCardBase = motion.create(Card);

interface MotionCardProps extends CardProps {
  children: React.ReactNode;
  hover?: boolean;
  press?: boolean;
  variant?: 'fade' | 'scale' | 'slide';
  delay?: number;
}

export function MotionCard({
  children,
  hover = true,
  press = true,
  variant = 'fade',
  delay = 0,
  ...props
}: MotionCardProps) {
  const baseVariants = getMotionVariants(
    motionVariants[
      variant === 'fade'
        ? 'fadeIn'
        : variant === 'scale'
          ? 'scaleIn'
          : 'fadeInUp'
    ]
  );

  const hoverVariants = hover ? createHoverAnimation() : {};
  const pressVariants = press ? createPressAnimation() : {};

  const combinedVariants = {
    ...baseVariants,
    ...hoverVariants,
    ...pressVariants,
  };

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
    <MotionCardBase
      variants={combinedVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      {...safeProps}
    >
      {children}
    </MotionCardBase>
  );
}

export default MotionCard;
