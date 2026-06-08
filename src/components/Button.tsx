import React from 'react';
import { cn } from '../utils/cn';

export const Button = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn(
      'w-full py-4 rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50',
      className,
    )}
    {...props}
  />
);
