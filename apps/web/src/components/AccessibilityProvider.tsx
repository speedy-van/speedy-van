"use client";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface AccessibilityContextType {
  announceToScreenReader: (message: string) => void;
  focusFirstInteractive: () => void;
  focusLastInteractive: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const router = useRouter();
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Screen reader announcements
  const announceToScreenReader = (message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
      // Clear the message after a short delay
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = "";
        }
      }, 1000);
    }
  };

  // Focus management utilities
  const focusFirstInteractive = () => {
    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  };

  const focusLastInteractive = () => {
    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
    }
  };

  // Handle route changes for accessibility
  useEffect(() => {
    const handleRouteChange = () => {
      // Announce page changes to screen readers
      const pageTitle = document.title || "Page loaded";
      announceToScreenReader(`Navigated to ${pageTitle}`);
      
      // Focus the main content area
      const mainElement = document.querySelector('main[id="main"]');
      if (mainElement) {
        (mainElement as HTMLElement).focus();
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [router]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip to main content (Alt + M)
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        const mainElement = document.querySelector('main[id="main"]');
        if (mainElement) {
          (mainElement as HTMLElement).focus();
          announceToScreenReader("Moved to main content");
        }
      }

      // Skip to navigation (Alt + N)
      if (event.altKey && event.key === 'n') {
        event.preventDefault();
        const navElement = document.querySelector('nav');
        if (navElement) {
          (navElement as HTMLElement).focus();
          announceToScreenReader("Moved to navigation");
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const value: AccessibilityContextType = {
    announceToScreenReader,
    focusFirstInteractive,
    focusLastInteractive,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      />
    </AccessibilityContext.Provider>
  );
}

// Keyboard navigation hook
export function useKeyboardNavigation() {
  const handleKeyDown = (event: React.KeyboardEvent, onEnter?: () => void, onEscape?: () => void) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
    }
  };

  return { handleKeyDown };
}

// Focus trap hook for modals and dialogs
export function useFocusTrap(enabled: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus the first element when the trap is enabled
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [enabled]);

  return containerRef;
}
