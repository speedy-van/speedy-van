import React from 'react';
import { Button as ChakraButton, ButtonProps as ChakraButtonProps, useBreakpointValue } from '@chakra-ui/react';

export interface ButtonProps extends Omit<ChakraButtonProps, 'size' | 'variant'> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  fullWidth?: boolean;
  isCTA?: boolean; // Primary call-to-action button
  isCompact?: boolean; // For secondary buttons that should stay compact
  isMobileFriendly?: boolean; // Force mobile-friendly sizing
}

export default function Button({ 
  children, 
  size = 'lg', // Default to lg for consistent sizing
  variant = 'primary',
  fullWidth = false,
  isCTA = false,
  isCompact = false,
  isMobileFriendly = false,
  width,
  height,
  minHeight,
  fontSize,
  fontWeight,
  ...props 
}: ButtonProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Determine responsive sizing based on mobile state
  const getResponsiveSize = () => {
    if (isMobileFriendly || isMobile) {
      // Mobile-friendly sizes with larger touch targets
      switch (size) {
        case 'sm': return 'md';
        case 'md': return 'lg';
        case 'lg': return 'lg';
        case 'xl': return 'xl';
        default: return 'lg';
      }
    }
    return size;
  };

  const getResponsiveHeight = () => {
    if (isMobileFriendly || isMobile) {
      // Ensure minimum 44px touch target on mobile
      return { base: '48px', md: height || 'auto' } as any;
    }
    return height;
  };

  const getResponsiveFontSize = () => {
    if (isMobileFriendly || isMobile) {
      // Prevent zoom on iOS with 16px minimum
      return { base: '16px', md: fontSize || 'auto' } as any;
    }
    return fontSize;
  };

  const getResponsiveFontWeight = () => {
    if (isMobileFriendly || isMobile) {
      return { base: 'semibold', md: fontWeight || 'medium' } as any;
    }
    return fontWeight;
  };

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
  delete (chakraProps as any).isMobileFriendly;

  return (
    <ChakraButton
      size={getResponsiveSize()}
      variant={finalVariant as any}
      width={finalWidth}
      height={getResponsiveHeight()}
      minHeight={isMobileFriendly || isMobile ? '44px' : minHeight}
      fontSize={getResponsiveFontSize()}
      fontWeight={getResponsiveFontWeight()}
      borderRadius={isMobileFriendly || isMobile ? '8px' : undefined}
      _hover={{
        transform: isMobileFriendly || isMobile ? 'translateY(-1px)' : undefined,
        boxShadow: isMobileFriendly || isMobile ? '0 4px 12px rgba(0,0,0,0.15)' : undefined,
      }}
      _active={{
        transform: isMobileFriendly || isMobile ? 'translateY(0)' : undefined,
      }}
      transition={isMobileFriendly || isMobile ? 'all 0.2s ease' : undefined}
      {...chakraProps}
    >
      {children}
    </ChakraButton>
  );
}
