import { Variants } from 'framer-motion'

// Timing constants (120-200ms for micro-interactions)
export const TRANSITIONS = {
  fast: { duration: 0.15 },
  medium: { duration: 0.2 },
  slow: { duration: 0.3 },
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  springFast: { type: 'spring' as const, stiffness: 400, damping: 35 },
}

// Fade animations
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: TRANSITIONS.medium },
  exit: { opacity: 0, transition: TRANSITIONS.fast },
}

// Slide animations
export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: TRANSITIONS.spring,
  },
  exit: { opacity: 0, y: -20, transition: TRANSITIONS.fast },
}

export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: TRANSITIONS.spring,
  },
  exit: { opacity: 0, y: 20, transition: TRANSITIONS.fast },
}

// Scale animations
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: TRANSITIONS.spring,
  },
  exit: { opacity: 0, scale: 0.9, transition: TRANSITIONS.fast },
}

// Card hover effect
export const cardHover: Variants = {
  hover: { 
    y: -4,
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    transition: TRANSITIONS.springFast,
  },
}

// Button press effect
export const buttonTap = {
  whileTap: { scale: 0.98 },
  transition: TRANSITIONS.fast,
}

// Stagger children animation
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

// Loading spinner
export const spinner = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Success checkmark
export const successCheck: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
}

// Error shake
export const errorShake: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
}

