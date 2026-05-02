import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export function Button({ className, variant = 'primary', isLoading, children, disabled, ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-accent to-accent2 text-white hover:opacity-90 shadow-lg shadow-accent/20 px-4 py-2",
    outline: "border border-border2 text-text1 hover:bg-bg3 px-4 py-2",
    ghost: "text-text2 hover:text-text1 hover:bg-bg3 px-4 py-2",
    danger: "bg-red/10 text-red hover:bg-red/20 px-4 py-2"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], className)} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
