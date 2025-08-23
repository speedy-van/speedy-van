import React from 'react';
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';

export interface ButtonProps extends Omit<ChakraButtonProps, 'size' | 'variant'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  fullWidth?: boolean;
  isCTA?: boolean; // Primary call-to-action button
  isCompact?: boolean; // For secondary buttons that should stay compact
}

export default function Button({ 
  children, 
  size = 'lg', // Default to lg for consistent sizing
  variant = 'primary',
  fullWidth = false,
  isCTA = false,
  isCompact = false,
  width,
  ...props 
}: ButtonProps) {
  // Determine width based on button type and responsive rules
  let finalWidth = width;
  
  if (fullWidth) {
    finalWidth = '100%';
  } else if (isCTA && variant === 'primary') {
    // Primary CTA buttons: full width on mobile, auto on desktop
    finalWidth = { base: '100%', md: 'auto' };
  } else if (isCompact || variant === 'secondary' || variant === 'outline' || variant === 'ghost') {
    // Secondary/outline/ghost buttons: always auto-width (compact)
    finalWidth = 'auto';
  } else if (variant === 'primary') {
    // Non-CTA primary buttons: responsive width
    finalWidth = { base: '100%', md: 'auto' };
  }

  // Map link variant to ghost for compatibility
  const finalVariant = variant === 'link' ? 'ghost' : variant;

  // Create a clean props object without our custom props
  const chakraProps = { ...props };
  delete (chakraProps as any).fullWidth;
  delete (chakraProps as any).isCTA;
  delete (chakraProps as any).isCompact;

  return (
    <ChakraButton
      size={size}
      variant={finalVariant as any}
      width={finalWidth}
      {...chakraProps}
    >
      {children}
    </ChakraButton>
  );
}
