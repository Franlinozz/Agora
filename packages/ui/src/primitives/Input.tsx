import React from 'react';

import { cn } from '../index.ts';

/** Example: <Input label="Amount" suffix="USDC" error="Too low" /> */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  helperText?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  mono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, prefix, suffix, mono, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label className="grid gap-2 text-[13px] text-[var(--color-text-secondary)]" htmlFor={inputId}>
        {label ? <span>{label}</span> : null}
        <span
          className={cn(
            'flex h-10 items-center gap-2 rounded-md border bg-[var(--color-bg-1)] px-3 transition focus-within:ring-2',
            error
              ? 'border-[var(--color-danger)] focus-within:ring-[var(--color-danger)]'
              : 'border-[var(--color-bg-3)] focus-within:ring-[var(--color-arc-purple)]',
          )}
        >
          {prefix ? <span className="text-[var(--color-text-tertiary)]">{prefix}</span> : null}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'min-w-0 flex-1 bg-transparent text-[15px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]',
              mono && 'font-mono',
              className,
            )}
            {...props}
          />
          {suffix ? <span className="text-[var(--color-text-tertiary)]">{suffix}</span> : null}
        </span>
        {error || helperText ? (
          <span className={cn(error ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-tertiary)]')}>
            {error ?? helperText}
          </span>
        ) : null}
      </label>
    );
  },
);
Input.displayName = 'Input';
