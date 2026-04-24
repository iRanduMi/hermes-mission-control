import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'destructive';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'bg-accent text-white hover:bg-accent/90',
      ghost: 'text-text-secondary hover:text-text-primary hover:bg-panel-hover',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-[510] transition-colors border border-transparent',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
