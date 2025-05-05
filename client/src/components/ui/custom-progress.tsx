import React, { useEffect } from 'react';
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
  
  useEffect(() => {
    // Debug output
    console.log(`Progress Bar - Value: ${numericValue}, MaxValue: ${maxValue}, Percentage: ${percentage}%`);
  }, [numericValue, maxValue, percentage]);
  
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700", className)}>
      <div 
        className={cn("absolute left-0 top-0 h-full rounded-full transition-all", barClassName || "bg-primary")}
        style={{ width: `${percentage}%` }}
        data-testid="progress-indicator"
        data-value={numericValue}
        data-max={maxValue}
        data-percent={percentage}
      />
    </div>
  );
}
