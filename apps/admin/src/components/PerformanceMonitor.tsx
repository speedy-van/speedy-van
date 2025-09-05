'use client';

import { useEffect, useRef } from 'react';
import { useTelemetry } from '@/lib/telemetry';

interface PerformanceMonitorProps {
  pageName: string;
  children: React.ReactNode;
}

export function PerformanceMonitor({
  pageName,
  children,
}: PerformanceMonitorProps) {
  const telemetry = useTelemetry();

  useEffect(() => {
    const loadStartTime = performance.now();

    const trackPageLoad = () => {
      const loadTime = performance.now() - loadStartTime;
      telemetry.trackPageLoad(pageName, loadTime);
    };

    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
    }

    return () => {
      window.removeEventListener('load', trackPageLoad);
    };
  }, [pageName, telemetry]);

  return <>{children}</>;
}

export function useComponentPerformance(componentName: string) {
  const telemetry = useTelemetry();
  const startTime = useRef<number>(Date.now());

  const trackComponentLoad = () => {
    const loadTime = Date.now() - startTime.current;
    telemetry.trackPerformance({
      name: 'component_load_time',
      value: loadTime,
      unit: 'milliseconds',
      tags: { component: componentName },
    });
  };

  return { trackComponentLoad };
}
