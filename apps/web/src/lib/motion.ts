import { Variants } from 'framer-motion';

export const MOTION_DURATIONS = {
  fast: 0.15,
  normal: 0.25,
  emphasis: 0.40,
} as const;

export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: MOTION_DURATIONS.normal, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: MOTION_DURATIONS.fast, ease: 'easeIn' } },
};

export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: MOTION_DURATIONS.normal, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: MOTION_DURATIONS.fast } },
};

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const drawerSlideVariants: Variants = {
  closed: { x: '100%', transition: { duration: MOTION_DURATIONS.normal, ease: [0.32, 0.72, 0, 1] } },
  open: { x: '0%', transition: { duration: MOTION_DURATIONS.emphasis, ease: [0.16, 1, 0.3, 1] } },
};

export const modalScaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: MOTION_DURATIONS.normal, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: MOTION_DURATIONS.fast } },
};
