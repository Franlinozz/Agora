'use client';

import { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

type AnimateInProps = {
  children: ReactNode;
  className?: string;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Animation direction */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Distance in px to travel */
  distance?: number;
  /** Duration in seconds */
  duration?: number;
  /** HTML element to render */
  as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'span' | 'p' | 'h1' | 'h2' | 'h3';
};

export function AnimateIn({
  children,
  className,
  delay = 0,
  direction = 'up',
  distance = 32,
  duration = 0.6,
  as = 'div',
}: AnimateInProps) {
  // Use explicit variables for x and y to guarantee they are never undefined to the compiler
  let initialX = 0;
  let initialY = 0;

  switch (direction) {
    case 'up':
      initialY = distance;
      break;
    case 'down':
      initialY = -distance;
      break;
    case 'left':
      initialX = distance;
      break;
    case 'right':
      initialX = -distance;
      break;
    default:
      // 'none' or fallback
      initialX = 0;
      initialY = 0;
      break;
  }

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: initialX,
      y: initialY,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const Component = (motion as any)[as] || motion.div;

  return (
    <Component
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </Component>
  );
}

/** Container that staggers its children's animations */
type StaggerContainerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: 'div' | 'section' | 'ul';
};

export function StaggerContainer({
  children,
  className,
  stagger = 0.08,
  delay = 0.1,
  as = 'div',
}: StaggerContainerProps) {
  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const Component = (motion as any)[as] || motion.div;

  return (
    <Component
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </Component>
  );
}
