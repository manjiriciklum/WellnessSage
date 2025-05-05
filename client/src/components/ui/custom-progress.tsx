import React from 'react';
import { cn } from '@/lib/utils';

interface CustomProgressProps {
  value: number;
  maxValue: number;
  className?: string;
  barClassName?: string;
}

export function CustomProgress({ value, maxValue, className, barClassName }: CustomProgressProps) {
  // Ensure value is a number and calculate percentage
  const numericValue = Number(value) || 0;
  const percentage = Math.min((numericValue / maxValue) * 100, 100);
  
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700", className)}>
      <div 
        className={cn("h-full bg-primary rounded-full transition-all duration-300 ease-in-out", barClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
