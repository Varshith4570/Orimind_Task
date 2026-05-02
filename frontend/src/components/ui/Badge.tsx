import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'pro' | 'free';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-bg3 text-text2 border border-border",
    success: "bg-green/10 text-green border border-green/20",
    warning: "bg-amber/10 text-amber border border-amber/20",
    error: "bg-red/10 text-red border border-red/20",
    pro: "bg-accent/10 text-accent border border-accent/20",
    free: "bg-cyan/10 text-cyan border border-cyan/20"
  };

  return (
    <div className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
