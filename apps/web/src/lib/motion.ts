import { Variants } from 'framer-motion';

// Motion tokens - consistent with CSS variables
export const motionTokens = {
  ease: {
    enter: 'cubic-bezier(.2,.8,.2,1)',
    exit: 'cubic-bezier(.4,0,1,1)',
    bounce: 'cubic-bezier(.68,-.55,.265,1.55)',
    smooth: 'cubic-bezier(.25,.46,.45,.94)',
  },
  duration: {
    fast: 120,
    normal: 200,
    slow: 280,
    slower: 400,
  },
  spring: {
    stiffness: 300,
    damping: 30,
  },
} as const;

// Common motion variants
export const motionVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },
  
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },
  
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },
  
  fadeInLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },
  
  fadeInRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },
  
  scaleInBounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
    transition: { 
      duration: motionTokens.duration.slow / 1000, 
      ease: motionTokens.ease.bounce,
    },
  },

  // Slide animations
  slideInUp: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },
  
  slideInDown: {
    initial: { y: '-100%' },
    animate: { y: 0 },
    exit: { y: '-100%' },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },
  
  slideInLeft: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },
  
  slideInRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },

  // Drawer animations
  drawer: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { 
      duration: motionTokens.duration.slow / 1000, 
      ease: motionTokens.ease.enter,
    },
  },

  // Modal animations
  modal: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
    transition: { 
      duration: motionTokens.duration.slow / 1000, 
      ease: motionTokens.ease.enter,
    },
  },

  // List item animations
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: motionTokens.duration.fast / 1000, ease: motionTokens.ease.enter },
  },

  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },

  // Status chip animations
  statusChip: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: motionTokens.duration.fast / 1000, ease: motionTokens.ease.enter },
  },

  // Button press animation
  buttonPress: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: motionTokens.duration.fast / 1000, ease: motionTokens.ease.enter },
  },

  // Card hover animation
  cardHover: {
    initial: { y: 0 },
    whileHover: { y: -4 },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.smooth },
  },

  // Loading spinner
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },

  // Pulse animation for notifications
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: motionTokens.ease.smooth,
      },
    },
  },

  // Shake animation for errors
  shake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: motionTokens.ease.exit,
      },
    },
  },

  // Bounce animation for success
  bounce: {
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.3,
        ease: motionTokens.ease.bounce,
      },
    },
  },
} as const;

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.normal / 1000,
      ease: motionTokens.ease.enter as any,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: motionTokens.duration.fast / 1000,
      ease: motionTokens.ease.exit as any,
    },
  },
};

// Status-specific animations
export const statusAnimations = {
  new: {
    initial: { opacity: 0, scale: 0.8, backgroundColor: '#FEF3C7' },
    animate: { opacity: 1, scale: 1, backgroundColor: '#FEF3C7' },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },
  active: {
    initial: { opacity: 0, scale: 0.8, backgroundColor: '#DBEAFE' },
    animate: { opacity: 1, scale: 1, backgroundColor: '#DBEAFE' },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },
  success: {
    initial: { opacity: 0, scale: 0.8, backgroundColor: '#D1FAE5' },
    animate: { opacity: 1, scale: 1, backgroundColor: '#D1FAE5' },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },
  error: {
    initial: { opacity: 0, scale: 0.8, backgroundColor: '#FEE2E2' },
    animate: { opacity: 1, scale: 1, backgroundColor: '#FEE2E2' },
    transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.enter },
  },
};

// Utility functions
export const createStaggeredAnimation = (delay: number = 0.05) => ({
  animate: {
    transition: {
      staggerChildren: delay,
      delayChildren: 0.1,
    },
  },
});

export const createHoverAnimation = (scale: number = 1.02, y: number = -2) => ({
  whileHover: { scale, y },
  transition: { duration: motionTokens.duration.normal / 1000, ease: motionTokens.ease.smooth },
});

export const createPressAnimation = (scale: number = 0.98) => ({
  whileTap: { scale },
  transition: { duration: motionTokens.duration.fast / 1000, ease: motionTokens.ease.enter },
});

// Reduced motion support
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get motion variants with reduced motion support
export const getMotionVariants = (variants: Variants, fallback?: Variants): Variants => {
  if (shouldReduceMotion()) {
    return fallback || { initial: {}, animate: {}, exit: {} };
  }
  return variants;
};
