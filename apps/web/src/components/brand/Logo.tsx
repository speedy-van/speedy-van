import React from "react";

type Variant = "auto" | "logo" | "wordmark" | "icon" | "icon-min" | "responsive" | "mobile";
type Mode = "auto" | "dark" | "light";

type Props = {
  variant?: Variant;
  mode?: Mode;
  width?: number | string;
  height?: number | string;
  className?: string;
  ariaLabel?: string;
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

export function Logo({
  variant = "logo",
  mode = "auto",
  width,
  height,
  className,
  ariaLabel = "Speedy Van",
  responsive = true
}: Props) {
  // Handle specific variants that don't need dark/light switching
  if (variant === "wordmark") {
    return (
      <img 
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
      <img 
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
  
  if (variant === "icon-min") {
    return (
      <img 
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
      <img 
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
      <img 
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

  // Handle logo variants with dark/light mode switching
  if (mode === "dark") {
    return (
      <img 
        src={paths.logo.dark} 
        alt={ariaLabel} 
        width={width} 
        height={height} 
        className={className}
        role="img"
        aria-label={ariaLabel}
      />
    );
  }
  
  if (mode === "light") {
    return (
      <img 
        src={paths.logo.light} 
        alt={ariaLabel} 
        width={width} 
        height={height} 
        className={className}
        role="img"
        aria-label={ariaLabel}
      />
    );
  }

  // Auto mode: switch based on system preference
  return (
    <picture className={className}>
      <source srcSet={paths.logo.dark} media="(prefers-color-scheme: dark)" />
      <img 
        src={paths.logo.light} 
        alt={ariaLabel} 
        width={width} 
        height={height}
        role="img"
        aria-label={ariaLabel}
      />
    </picture>
  );
}

export default Logo;
