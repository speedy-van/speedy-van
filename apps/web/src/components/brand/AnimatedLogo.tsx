import React, { useState } from "react";
import { Box } from "@chakra-ui/react";

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
};

const paths = {
  logo: { dark: "/logo/speedy-van-logo-dark.svg", light: "/logo/speedy-van-logo-light.svg" },
  wordmark: "/logo/speedy-van-wordmark.svg",
  icon: "/logo/speedy-van-icon.svg",
  iconMin: "/logo/speedy-van-icon-min.svg"
};

// Neon glow animations using CSS
const neonPulseAnimation = "neonPulse 2s ease-in-out infinite";
const neonPurplePulseAnimation = "neonPurplePulse 2s ease-in-out infinite";
const motionTrailAnimation = "motionTrail 0.8s ease-in-out infinite";

// CSS keyframes for animations
const keyframesCSS = `
  @keyframes neonPulse {
    0%, 100% { filter: drop-shadow(0 0 5px #00C2FF) drop-shadow(0 0 10px #00C2FF) drop-shadow(0 0 15px #00C2FF); }
    50% { filter: drop-shadow(0 0 10px #00C2FF) drop-shadow(0 0 20px #00C2FF) drop-shadow(0 0 30px #00C2FF); }
  }
  
  @keyframes neonPurplePulse {
    0%, 100% { filter: drop-shadow(0 0 5px #B026FF) drop-shadow(0 0 10px #B026FF) drop-shadow(0 0 15px #B026FF); }
    50% { filter: drop-shadow(0 0 10px #B026FF) drop-shadow(0 0 20px #B026FF) drop-shadow(0 0 30px #B026FF); }
  }
  
  @keyframes motionTrail {
    0% { opacity: 0.3; transform: translateX(-5px); }
    50% { opacity: 1; transform: translateX(0px); }
    100% { opacity: 0.3; transform: translateX(5px); }
  }
`;

export function AnimatedLogo({
  variant = "logo",
  mode = "auto",
  width,
  height,
  className,
  ariaLabel = "Speedy Van",
  animated = true
}: Props) {
  const [isHovered, setIsHovered] = useState(false);

  // Inject CSS keyframes
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'animated-logo-keyframes';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = keyframesCSS;
        document.head.appendChild(style);
      }
    }
  }, []);

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
        transition="all 0.3s ease-in-out"
        _hover={{
          transform: animated ? "scale(1.05)" : "none",
          filter: animated ? "drop-shadow(0 0 20px #00C2FF)" : "none"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animation={animated ? neonPulseAnimation : "none"}
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
        transition="all 0.3s ease-in-out"
        _hover={{
          transform: animated ? "scale(1.1) rotate(5deg)" : "none",
          filter: animated ? "drop-shadow(0 0 25px #00C2FF)" : "none"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animation={animated ? neonPulseAnimation : "none"}
      />
    );
  }
  
  if (variant === "icon-min") {
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
        transition="all 0.3s ease-in-out"
        _hover={{
          transform: animated ? "scale(1.08)" : "none",
          filter: animated ? "drop-shadow(0 0 15px #00C2FF)" : "none"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animation={animated ? neonPulseAnimation : "none"}
      />
    );
  }

  // Handle logo variants with dark/light mode switching
  if (mode === "dark") {
    return (
      <Box
        as="img"
        src={paths.logo.dark}
        alt={ariaLabel}
        width={width}
        height={height}
        className={className}
        role="img"
        aria-label={ariaLabel}
        transition="all 0.4s ease-in-out"
        _hover={{
          transform: animated ? "scale(1.02)" : "none",
          filter: animated ? "drop-shadow(0 0 30px #00C2FF)" : "none"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animation={animated ? neonPulseAnimation : "none"}
        sx={{
          "&:hover .motion-trail": {
            animation: motionTrailAnimation
          }
        }}
      />
    );
  }
  
  if (mode === "light") {
    return (
      <Box
        as="img"
        src={paths.logo.light}
        alt={ariaLabel}
        width={width}
        height={height}
        className={className}
        role="img"
        aria-label={ariaLabel}
        transition="all 0.4s ease-in-out"
        _hover={{
          transform: animated ? "scale(1.02)" : "none",
          filter: animated ? "drop-shadow(0 0 30px #00C2FF)" : "none"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animation={animated ? neonPulseAnimation : "none"}
      />
    );
  }

  // Auto mode: switch based on system preference
  return (
    <Box
      as="picture"
      className={className}
      transition="all 0.4s ease-in-out"
      _hover={{
        transform: animated ? "scale(1.02)" : "none",
        filter: animated ? "drop-shadow(0 0 30px #00C2FF)" : "none"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animation={animated ? neonPulseAnimation : "none"}
    >
      <source srcSet={paths.logo.dark} media="(prefers-color-scheme: dark)" />
      <Box
        as="img"
        src={paths.logo.light}
        alt={ariaLabel}
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
      />
    </Box>
  );
}

export default AnimatedLogo;
