import React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";

type Variant = "auto" | "logo" | "wordmark" | "icon" | "iconMin" | "responsive" | "mobile";

type Props = {
  variant?: Variant;
  width?: number | string;
  height?: number | string;
  className?: string;
  ariaLabel?: string;
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

export function LogoChakra({
  variant = "logo",
  width,
  height,
  className,
  ariaLabel = "Speedy Van"
}: Props) {
  const logo = useColorModeValue(paths.logo.light, paths.logo.dark);

  // Handle specific variants that don't need dark/light switching
  if (variant === "wordmark") {
    return (
      <Box
        as="img"
        src={paths.wordmark}
        alt={ariaLabel}
        width={width}
        height={height}
        className={className}
        role="img"
        aria-label={ariaLabel}
      />
    );
  }
  
  if (variant === "icon") {
    return (
      <Box
        as="img"
        src={paths.icon}
        alt={ariaLabel}
        width={width}
        height={height}
        className={className}
        role="img"
        aria-label={ariaLabel}
      />
    );
  }
  
  if (variant === "iconMin") {
    return (
      <Box
        as="img"
        src={paths.iconMin}
        alt={ariaLabel}
        width={width}
        height={height}
        className={className}
        role="img"
        aria-label={ariaLabel}
      />
    );
  }

  // Handle responsive variants
  if (variant === "responsive") {
    return (
      <Box
        as="img"
        src={paths.logo.responsive}
        alt={ariaLabel}
        width={width || 320}
        height={height || 120}
        className={className}
        role="img"
        aria-label={ariaLabel}
      />
    );
  }

  if (variant === "mobile") {
    return (
      <Box
        as="img"
        src={paths.logo.mobile}
        alt={ariaLabel}
        width={width || 160}
        height={height || 60}
        className={className}
        role="img"
        aria-label={ariaLabel}
      />
    );
  }

  // Default logo with color mode switching
  return (
    <Box
      as="img"
      src={logo}
      alt={ariaLabel}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={ariaLabel}
    />
  );
}

export default LogoChakra;
