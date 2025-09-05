import React from 'react';
import { useSafeProps } from '../../hooks/useSafeProps';

/**
 * Higher-order component that filters out problematic attributes that can cause hydration warnings
 * @param Component - The component to wrap
 * @returns A new component with problematic attributes filtered out
 */
export function withSafeProps<P extends Record<string, any>>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const safeProps = useSafeProps(props);

    // Use any type to avoid complex TypeScript constraints
    const ComponentAny = Component as any;

    return <ComponentAny {...safeProps} ref={ref} />;
  });

  WrappedComponent.displayName = `withSafeProps(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default withSafeProps;
