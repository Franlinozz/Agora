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

const directionMap: Record<string, { x?: number; y?: number }> = {
  up: { y: 1 },
  down: { y: -1 },
  left: { x: 1 },
  right: { x: -1 },
  none: { x: 0, y: 0 },
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
  const dir = directionMap[direction];
  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...(dir.x !== undefined ? { x: dir.x * distance } : {}),
      ...(dir.y !== undefined ? { y: dir.y * distance } : {}),
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

  const Component = motion[as] as any;

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

  const Component = motion[as] as any;

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
