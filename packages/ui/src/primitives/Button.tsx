import { Slot } from '@radix-ui/react-slot';
import React from 'react';

import { cn } from '../index.ts';

/** Example: <Button variant="primary" size="md">Hire agent</Button> */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-[var(--color-arc-purple)] text-white shadow-[0_0_32px_rgba(92,91,214,0.25)] hover:bg-[var(--color-arc-purple-light)]',
  secondary: 'border border-[var(--color-bg-3)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-2)]',
  ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text-primary)]',
  danger: 'bg-[var(--color-danger)] text-white hover:brightness-110',
};

const sizes = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-[15px]',
  lg: 'h-12 px-5 text-[17px]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, loading, variant = 'primary', size = 'md', className, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition duration-200 ease-agora focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-arc-purple)] disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {!asChild && loading ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';
