import React, { ReactNode, useEffect, useState } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

interface BreakpointProps {
  children: ReactNode;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  direction?: 'up' | 'down' | 'only';
}

interface GridProps {
  children: ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

interface ContainerProps {
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

// Breakpoint values
const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Main responsive layout wrapper
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch by rendering a basic layout on server
    return (
      <div className={`responsive-layout ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`responsive-layout ${className}`}>
      {children}
    </div>
  );
};

// Breakpoint-based conditional rendering
export const Breakpoint: React.FC<BreakpointProps> = ({
  children,
  breakpoint,
  direction = 'up',
}) => {
  const breakpointValue = breakpoints[breakpoint];
  
  let mediaQuery = '';
  switch (direction) {
    case 'up':
      mediaQuery = `(min-width: ${breakpointValue}px)`;
      break;
    case 'down':
      mediaQuery = `(max-width: ${breakpointValue - 1}px)`;
      break;
    case 'only':
      const nextBreakpoint = Object.entries(breakpoints).find(
        ([, value]) => value > breakpointValue
      );
      if (nextBreakpoint) {
        mediaQuery = `(min-width: ${breakpointValue}px) and (max-width: ${nextBreakpoint[1] - 1}px)`;
      } else {
        mediaQuery = `(min-width: ${breakpointValue}px)`;
      }
      break;
  }

  const matches = useMediaQuery(mediaQuery);

  return matches ? <>{children}</> : null;
};

// Responsive grid component
export const ResponsiveGrid: React.FC<GridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className = '',
}) => {
  const [currentColumns, setCurrentColumns] = useState(columns.xs || 1);

  const isXs = useMediaQuery('(max-width: 639px)');
  const isSm = useMediaQuery('(min-width: 640px) and (max-width: 767px)');
  const isMd = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isLg = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const isXl = useMediaQuery('(min-width: 1280px) and (max-width: 1535px)');
  const is2xl = useMediaQuery('(min-width: 1536px)');

  useEffect(() => {
    if (is2xl && columns['2xl']) {
      setCurrentColumns(columns['2xl']);
    } else if (isXl && columns.xl) {
      setCurrentColumns(columns.xl);
    } else if (isLg && columns.lg) {
      setCurrentColumns(columns.lg);
    } else if (isMd && columns.md) {
      setCurrentColumns(columns.md);
    } else if (isSm && columns.sm) {
      setCurrentColumns(columns.sm);
    } else {
      setCurrentColumns(columns.xs || 1);
    }
  }, [isXs, isSm, isMd, isLg, isXl, is2xl, columns]);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
    gap: `var(--space-${gap})`,
  };

  return (
    <div 
      className={`responsive-grid ${className}`}
      style={gridStyle}
    >
      {children}
    </div>
  );
};

// Responsive container component
export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'xl',
  className = '',
}) => {
  const containerClass = size === 'full' ? 'w-full' : `container-${size}`;
  
  return (
    <div className={`container ${containerClass} ${className}`}>
      {children}
    </div>
  );
};

// Mobile navigation component
interface MobileNavProps {
  items: Array<{
    label: string;
    href: string;
    icon?: ReactNode;
    active?: boolean;
  }>;
  className?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  items,
  className = '',
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (!isMobile) return null;

  return (
    <nav className={`nav-mobile ${className}`}>
      {items.map((item, index) => (
        <a
          key={index}
          href={item.href}
          className={`nav-mobile-item ${item.active ? 'active' : ''}`}
        >
          {item.icon && (
            <span className="nav-mobile-icon">
              {item.icon}
            </span>
          )}
          <span className="nav-mobile-label">
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  );
};

// Responsive image component with lazy loading
interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  srcSet?: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  sizes = '100vw',
  srcSet,
  className = '',
  priority = false,
  aspectRatio = 'auto',
  objectFit = 'cover',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const aspectRatioClass = aspectRatio !== 'auto' ? `aspect-ratio-${aspectRatio.replace(':', '-')}` : '';

  return (
    <div className={`responsive-image-container ${aspectRatioClass} ${className}`}>
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        srcSet={srcSet}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'low'}
        className={`responsive-image ${loaded ? 'loaded' : ''} ${error ? 'error' : ''}`}
        style={{ objectFit }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {!loaded && !error && (
        <div className="skeleton-loader" style={{ aspectRatio }} />
      )}
      {error && (
        <div className="image-error-placeholder">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
};

// Responsive text component with fluid typography
interface ResponsiveTextProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  as: Component = 'p',
  size = 'base',
  className = '',
}) => {
  const sizeClass = `text-${size}`;
  
  return (
    <Component className={`responsive-text ${sizeClass} ${className}`}>
      {children}
    </Component>
  );
};

// Performance-optimized list component for mobile
interface VirtualizedListProps {
  items: any[];
  renderItem: (item: any, index: number) => ReactNode;
  itemHeight: number;
  containerHeight: number;
  className?: string;
}

export const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  className = '',
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      className={`virtualized-list ${className}`}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) =>
            renderItem(item, visibleStart + index)
          )}
        </div>
      </div>
    </div>
  );
};

// Export all components
export default {
  ResponsiveLayout,
  Breakpoint,
  ResponsiveGrid,
  Container,
  MobileNav,
  ResponsiveImage,
  ResponsiveText,
  VirtualizedList,
};

