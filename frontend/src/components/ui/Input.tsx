import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-text2">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-lg border border-border2 bg-bg2 px-3 py-2 text-sm text-text1 ring-offset-bg file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-red focus-visible:ring-red",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
