import React, { useState, useEffect } from "react";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import { AnimatedLogo } from "./AnimatedLogo";

type Variant = "logo" | "wordmark" | "icon" | "icon-min";
type Mode = "auto" | "dark" | "light";

type Props = {
  variant?: Variant;
  mode?: Mode;
  width?: number | string;
  height?: number | string;
  className?: string;
  ariaLabel?: string;
  animated?: boolean;
  responsive?: boolean;
};

const paths = {
  logo: { 
    dark: "/logo/speedy-van-logo-dark.svg", 
    light: "/logo/speedy-van-logo-light.svg",
    responsive: "/logo/speedy-van-logo-responsive.svg",
    mobile: "/logo/speedy-van-logo-mobile.svg"
  },
  wordmark: "/logo/speedy-van-wordmark.svg",
  icon: "/logo/speedy-van-icon.svg",
  iconMin: "/logo/speedy-van-icon-min.svg"
};

export function ResponsiveLogo({
  variant = "logo",
  mode = "auto",
  width,
  height,
  className,
  ariaLabel = "Speedy Van",
  animated = true,
  responsive = true
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Use Chakra UI's breakpoint system
  const logoVariant = useBreakpointValue({
    base: "mobile",
    sm: "mobile",
    md: "responsive",
    lg: "default",
    xl: "default"
  });

  // Detect device capabilities
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /mobile|android|iphone|ipad|phone/i.test(userAgent);
      const isTabletDevice = /tablet|ipad/i.test(userAgent);
      
      setIsMobile(isMobileDevice && !isTabletDevice);
      setIsTablet(isTabletDevice);
      setIsDesktop(!isMobileDevice && !isTabletDevice);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Determine the best logo variant based on screen size and device
  const getOptimalLogoVariant = () => {
    if (!responsive) return variant;

    if (isMobile || logoVariant === "mobile") {
      return "mobile";
    } else if (isTablet || logoVariant === "responsive") {
      return "responsive";
    } else {
      return variant;
    }
  };

  const optimalVariant = getOptimalLogoVariant();

  // Handle specific variants that don't need responsive switching
  if (variant === "wordmark") {
    return (
      <AnimatedLogo
        variant="wordmark"
        mode={mode}
        width={width}
        height={height}
        className={className}
        ariaLabel={ariaLabel}
        animated={animated}
      />
    );
  }
  
  if (variant === "icon") {
    return (
      <AnimatedLogo
        variant="icon"
        mode={mode}
        width={width}
        height={height}
        className={className}
        ariaLabel={ariaLabel}
        animated={animated}
      />
    );
  }
  
  if (variant === "icon-min") {
    return (
      <AnimatedLogo
        variant="icon-min"
        mode={mode}
        width={width}
        height={height}
        className={className}
        ariaLabel={ariaLabel}
        animated={animated}
      />
    );
  }

  // Handle responsive logo variants
  if (optimalVariant === "mobile") {
    return (
      <Box
        as="img"
        src={paths.logo.mobile}
        alt={ariaLabel}
        width={width || "160px"}
        height={height || "60px"}
        className={className}
        role="img"
        aria-label={ariaLabel}
        transition="all 0.3s ease-in-out"
        _hover={{
          transform: animated ? "scale(1.02)" : "none",
          filter: animated ? "drop-shadow(0 0 20px #00C2FF)" : "none"
        }}
      />
    );
  }

  if (optimalVariant === "responsive") {
    return (
      <Box
        as="img"
        src={paths.logo.responsive}
        alt={ariaLabel}
        width={width || "320px"}
        height={height || "120px"}
        className={className}
        role="img"
        aria-label={ariaLabel}
        transition="all 0.3s ease-in-out"
        _hover={{
          transform: animated ? "scale(1.02)" : "none",
          filter: animated ? "drop-shadow(0 0 25px #00C2FF)" : "none"
        }}
      />
    );
  }

  // Default logo variants with dark/light mode switching
  if (mode === "dark") {
    return (
      <AnimatedLogo
        variant="logo"
        mode="dark"
        width={width}
        height={height}
        className={className}
        ariaLabel={ariaLabel}
        animated={animated}
      />
    );
  }
  
  if (mode === "light") {
    return (
      <AnimatedLogo
        variant="logo"
        mode="light"
        width={width}
        height={height}
        className={className}
        ariaLabel={ariaLabel}
        animated={animated}
      />
    );
  }

  // Auto mode: switch based on system preference
  return (
    <AnimatedLogo
      variant="logo"
      mode="auto"
      width={width}
      height={height}
      className={className}
      ariaLabel={ariaLabel}
      animated={animated}
    />
  );
}

export default ResponsiveLogo;
