import React from "react";

type Variant = "auto" | "logo" | "wordmark" | "icon" | "icon-min";
type Mode = "auto" | "dark" | "light";

type Props = {
  variant?: Variant;
  mode?: Mode;
  width?: number | string;
  height?: number | string;
  className?: string;
  ariaLabel?: string;
  boxProps?: any;
};

const paths = {
  logo: { dark: "/logo/speedy-van-logo-dark.svg", light: "/logo/speedy-van-logo-light.svg" },
  wordmark: "/logo/speedy-van-wordmark.svg",
  icon: "/logo/speedy-van-icon.svg",
  iconMin: "/logo/speedy-van-icon-min.svg"
};

export function LogoChakra({
  variant = "logo",
  mode = "auto",
  width,
  height,
  className,
  ariaLabel = "Speedy Van",
  boxProps = {}
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
        style={boxProps}
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
        style={boxProps}
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
        style={boxProps}
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
        style={boxProps}
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
        style={boxProps}
      />
    );
  }

  // Auto mode: use CSS media query for prefers-color-scheme
  // We'll use the dark version as default and let CSS handle the switching
  return (
    <img
      src={paths.logo.dark}
      alt={ariaLabel}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={ariaLabel}
      style={{
        ...boxProps,
        filter: 'var(--logo-filter, none)'
      }}
    />
  );
}

export default LogoChakra;
