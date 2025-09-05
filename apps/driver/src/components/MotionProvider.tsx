'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { shouldReduceMotion } from '@/lib/motion';

interface MotionContextType {
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
}

const MotionContext = createContext<MotionContextType>({
  reducedMotion: false,
  setReducedMotion: () => {},
});

export const useMotion = () => {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error('useMotion must be used within a MotionProvider');
  }
  return context;
};

interface MotionProviderProps {
  children: React.ReactNode;
  mode?: 'auto' | 'reduced' | 'normal';
}

export function MotionProvider({
  children,
  mode = 'auto',
}: MotionProviderProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (mode === 'auto') {
      const checkReducedMotion = () => {
        const isReduced = shouldReduceMotion();
        setReducedMotion(isReduced);
      };

      // Check on mount
      checkReducedMotion();

      // Listen for changes
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      mediaQuery.addEventListener('change', checkReducedMotion);

      return () => {
        mediaQuery.removeEventListener('change', checkReducedMotion);
      };
    } else {
      setReducedMotion(mode === 'reduced');
    }
  }, [mode]);

  const value = {
    reducedMotion,
    setReducedMotion,
  };

  return (
    <MotionContext.Provider value={value}>
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </MotionContext.Provider>
  );
}

export default MotionProvider;
